import {
  jsonSchemaToZod,
  validateRowWithZodSchema,
} from "../utils/schemaConverter";
import {
  sendValidRowMessage,
  sendInvalidRowMessage,
  sendProgressMessage,
} from "../utils/eventHubs";
import { logInfo, logError } from "../utils/logger";

/**
 * Process data chunk for validation
 * Pure function that processes a data chunk
 */
export const processDataChunk = async (
  chunk: any,
  schema: any,
  validRowsProducer: any,
  invalidRowsProducer: any,
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
    // Convert JSON schema to Zod schema once for the entire chunk
    let zodSchema: any;
    try {
      zodSchema = jsonSchemaToZod(schema.schema);
    } catch (schemaError) {
      logError("Failed to convert JSON schema to Zod", schemaError, {
        jobId: chunk.jobId,
        chunkNumber: chunk.chunkNumber,
      });
      // Prepare necessary return values for failed schema conversion
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
        // Send valid row message
        validRowBatch.push({
          jobId: chunk.jobId,
          orgId: chunk.orgId,
          sourceId: chunk.sourceId,
          validRow: row,
        });
        validRows++;

        if (validRowBatch.length >= BATCH_SIZE) {
          const sendResult = await sendValidRowMessage(
            validRowsProducer,
            validRowBatch
          );

          if (!sendResult.success) {
            errors.push(
              `Failed to send valid row ${row.rowNumber}: ${sendResult.error}`
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

        // Send invalid row message
        invalidRowBatch.push({
            jobId: chunk.jobId,
            orgId: chunk.orgId,
            sourceId: chunk.sourceId,
            originalRow: row,
            errors: validationResult.errors
        });
        invalidRows++;

        
        if (invalidRowBatch.length >= BATCH_SIZE) {
            const sendResult = await sendInvalidRowMessage(invalidRowsProducer, invalidRowBatch);
            if (!sendResult.success) {
                errors.push(`Failed to send invalid row batch: ${sendResult.error}`);
            }
            invalidRowBatch.length = 0;  // Clear batch
        }

      }
      processedRows++;
    }

    if (validRowBatch.length > 0) {
        const sendResult = await sendValidRowMessage(validRowsProducer, validRowBatch);
        if (!sendResult.success) {
            errors.push(`Failed to send final valid row batch: ${sendResult.error}`);
        }
    }

    if (invalidRowBatch.length > 0) {
        const sendResult = await sendInvalidRowMessage(invalidRowsProducer, invalidRowBatch);
        if (!sendResult.success) {
            errors.push(`Failed to send final invalid row batch: ${sendResult.error}`);
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
        await sendProgressMessage(progressProducer, chunk.jobId, chunk.orgId, chunk.sourceId, {
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
    // Prepare necessary return values for generic processing failure
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
    // Initialize new tracker. Note: totalRows/totalChunks must be populated by the file processor
    // or fetched from DB to accurately determine completion (isComplete).
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
