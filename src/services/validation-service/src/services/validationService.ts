import {
  jsonSchemaToZod,
  validateRowWithZodSchema,
} from "../utils/schemaConverter";
import {
  sendValidRowMessage,
  sendProgressMessage,
} from "../utils/eventHubs";
import { logInfo, logError } from "../utils/logger";
import { generateDataIdWithFallback, extractUniqueColumns, validateUniqueColumns } from "../utils/dataIdGenerator";

/**
 * Process data chunk for validation
 * Pure function that processes a data chunk
 */
export const processDataChunk = async (
  chunk: any,
  schema: any,
  validRowsProducer: any,
  progressProducer: any,
  progressTracker: Map<string, any>
): Promise<{
  success: boolean;
  processedRows: number;
  validRows: number;
  invalidRows: number;
  errors: string[];
  isJobComplete: boolean;
  totalValidRows: number;
  totalInvalidRows: number;
}> => {
  const errors: string[] = [];
  let processedRows = 0;
  let validRows = 0;
  let invalidRows = 0;

  const BATCH_SIZE = 50;
  const validRowBatch: any[] = [];
  const invalidRowBatch: any[] = [];

  try {
    // Extract and validate unique columns from schema
    const uniqueCols = extractUniqueColumns(schema);
    const uniqueColsValidation = validateUniqueColumns(schema, uniqueCols);
    
    if (!uniqueColsValidation.isValid && uniqueCols.length > 0) {
      logError('Some unique columns missing from schema', undefined, {
        jobId: chunk.jobId,
        missingColumns: uniqueColsValidation.missingColumns,
        uniqueCols
      });
    }

    logInfo('Starting chunk processing with unique columns', {
      jobId: chunk.jobId,
      chunkNumber: chunk.chunkNumber,
      uniqueCols,
      rowCount: chunk.rows.length
    });

    // Convert JSON schema to Zod schema once for the entire chunk
    let zodSchema: any;
    try {
      zodSchema = jsonSchemaToZod(schema.schema);
    } catch (schemaError) {
      logError("Failed to convert JSON schema to Zod", schemaError, {
        jobId: chunk.jobId,
        chunkNumber: chunk.chunkNumber,
      });
      return {
        success: false,
        processedRows: 0,
        validRows: 0,
        invalidRows: 0,
        errors: [
          `Schema conversion failed: ${
            schemaError instanceof Error ? schemaError.message : "Unknown error"
          }`,
        ],
        isJobComplete: false,
        totalValidRows: 0,
        totalInvalidRows: 0,
      };
    }

    // Process each row in the chunk
    for (const row of chunk.rows) {
      const validationResult = validateRowWithZodSchema(row.fields, zodSchema);

      if (validationResult.success) {
        // Generate dataId for valid row
        const dataId = generateDataIdWithFallback(
          row.fields,
          schema,
          chunk.jobId,
          row.rowNumber
        );

        // Send valid row message with dataId and timestamp
        validRowBatch.push({
          jobId: chunk.jobId,
          orgId: chunk.orgId,
          sourceId: chunk.sourceId,
          data: row,        // Renamed from validRow
          dataId: dataId,    // NEW: Composite key from unique columns
          timestamp: Date.now()  // NEW: Current timestamp in milliseconds
        });
        validRows++;

        if (validRowBatch.length >= BATCH_SIZE) {
          const sendResult = await sendValidRowMessage(
            validRowsProducer,
            validRowBatch
          );

          if (!sendResult.success) {
            errors.push(
              `Failed to send valid row batch: ${sendResult.error}`
            );
          } 
          validRowBatch.length = 0;
        }
      } else {
        logInfo('Validation failed for row', {
            jobId: chunk.jobId,
            rowNumber: row.rowNumber,
            validationErrors: validationResult.errors
        });
    
        // Transform Zod errors to consistent array format
        let formattedErrors = [];
        
        if (validationResult.errors && typeof validationResult.errors === 'object') {
            // Check if it has the Zod issues array structure
            if (Array.isArray(validationResult.errors.issues)) {
                formattedErrors = validationResult.errors.issues.map((issue: any) => ({
                    field: Array.isArray(issue.path) ? issue.path.join('.') : String(issue.path || 'Unknown'),
                    code: issue.code || 'validation_error',
                    message: issue.message || 'Validation failed',
                    expected: issue.expected,
                    received: issue.received
                }));
            } else {
                // Fallback for unexpected error structure
                formattedErrors = [{
                    field: 'Unknown',
                    code: 'validation_error',
                    message: JSON.stringify(validationResult.errors),
                    expected: 'valid data',
                    received: 'invalid data'
                }];
            }
        }
    
        invalidRowBatch.push({
            jobId: chunk.jobId,
            orgId: chunk.orgId,
            sourceId: chunk.sourceId,
            originalRow: row,
            errors: formattedErrors  // Always an array
        });
        invalidRows++;
    
        if (invalidRowBatch.length >= BATCH_SIZE) {
            const tracker = progressTracker.get(chunk.jobId);
            if (tracker?.invalidRowWriter) {
                await tracker.invalidRowWriter.append(invalidRowBatch);
            }
            invalidRowBatch.length = 0;
        }
    }
      processedRows++;
    }

    // Send remaining batches
    if (validRowBatch.length > 0) {
        const sendResult = await sendValidRowMessage(validRowsProducer, validRowBatch);
        if (!sendResult.success) {
            errors.push(`Failed to send final valid row batch: ${sendResult.error}`);
        }
    }

    if (invalidRowBatch.length > 0) {
        const tracker = progressTracker.get(chunk.jobId);
        if (tracker?.invalidRowWriter) {
            await tracker.invalidRowWriter.append(invalidRowBatch);
        }
    }

    // Update progress tracker
    updateProgressTracker(
      progressTracker,
      chunk,
      processedRows,
      validRows,
      invalidRows
    );

    // Capture status and totals from the updated tracker
    const tracker = progressTracker.get(chunk.jobId);
    let isJobComplete = false;
    let totalValidRows = 0;
    let totalInvalidRows = 0;

    if (tracker) {
      const shouldSendProgress = tracker.processedChunks % 5 === 0 || tracker.isComplete;
      
      // Send progress update message to progress service
      if (shouldSendProgress) {
        await sendProgressMessage(progressProducer, chunk.jobId, chunk.orgId, chunk.sourceId, 'validation',{
            processedRows: tracker.processedRows,
            validRows: tracker.validRows,
            invalidRows: tracker.invalidRows,
            totalRows: tracker.totalRows,
            processedChunks: tracker.processedChunks,
            totalChunks: tracker.totalChunks,
            isComplete: tracker.isComplete
        });
      }

      // Set return values based on the final tracker state
      isJobComplete = tracker.isComplete;
      totalValidRows = tracker.validRows;
      totalInvalidRows = tracker.invalidRows;
    }

    logInfo("Data chunk processing completed", {
      jobId: chunk.jobId,
      chunkNumber: chunk.chunkNumber,
      processedRows,
      validRows,
      invalidRows,
      isJobComplete,
    });

    return {
      success: errors.length === 0,
      processedRows,
      validRows,
      invalidRows,
      errors,
      isJobComplete,
      totalValidRows,
      totalInvalidRows,
    };
  } catch (error) {
    logError("Data chunk processing failed", error, {
      jobId: chunk.jobId,
      chunkNumber: chunk.chunkNumber,
    });
    return {
      success: false,
      processedRows,
      validRows,
      invalidRows,
      errors: [
        ...errors,
        error instanceof Error ? error.message : "Unknown error occurred",
      ],
      isJobComplete: false,
      totalValidRows: 0,
      totalInvalidRows: 0,
    };
  }
};

/**
 * Update progress tracker
 * Pure function that updates progress tracking
 */
const updateProgressTracker = (
  progressTracker: Map<string, any>,
  chunk: any,
  processedRows: number,
  validRows: number,
  invalidRows: number
): void => {
  const existing = progressTracker.get(chunk.jobId);
  if (existing) {
    const updated = {
      ...existing,
      processedRows: existing.processedRows + processedRows,
      validRows: existing.validRows + validRows,
      invalidRows: existing.invalidRows + invalidRows,
      processedChunks: existing.processedChunks + 1,
      receivedChunks: new Set([...existing.receivedChunks, chunk.chunkNumber])
    };

    if (existing.totalChunks > 0) {
        updated.isComplete = updated.processedChunks >= existing.totalChunks;
    }

    // Fallback: check if all expected rows processed
    if (existing.totalRows > 0 && updated.processedRows >= existing.totalRows) {
        updated.isComplete = true;
    }

    progressTracker.set(chunk.jobId, updated);
  } else {
    const newTracker = {
      processedRows,
      validRows,
      invalidRows,
      totalChunks: 0,
      processedChunks: 1,
      totalRows: 0,
      isComplete: false,
      receivedChunks: new Set([chunk.chunkNumber]),
      expectedChunks: 0,
    };
    progressTracker.set(chunk.jobId, newTracker);
  }
};

/**
 * Get progress tracker
 * Pure function that retrieves progress tracking
 */
export const getProgressTracker = (
  progressTracker: Map<string, any>,
  jobId: string
): any => {
  return progressTracker.get(jobId);
};

/**
 * Clear progress tracker
 * Pure function that clears progress tracking
 */
export const clearProgressTracker = (
  progressTracker: Map<string, any>,
  jobId: string
): void => {
  progressTracker.delete(jobId);
  logInfo("Cleared progress tracker", { jobId });
};