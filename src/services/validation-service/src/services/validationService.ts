import { jsonSchemaToZod, validateRowWithZodSchema } from '../utils/schemaConverter';
import { sendValidRowMessage, sendInvalidRowMessage, sendProgressMessage } from '../utils/eventHubs';
import { logInfo, logError } from '../utils/logger';

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
}> => {
    const errors: string[] = [];
    let processedRows = 0;
    let validRows = 0;
    let invalidRows = 0;

    try {
        // Convert JSON schema to Zod schema once for the entire chunk
        let zodSchema: any;
        try {
            zodSchema = jsonSchemaToZod(schema.schema);
            console.log('Zod Schema Shape:', zodSchema.shape);
        } catch (schemaError) {
            logError('Failed to convert JSON schema to Zod', schemaError, {
                jobId: chunk.jobId,
                chunkNumber: chunk.chunkNumber
            });
            return {
                success: false,
                processedRows: 0,
                validRows: 0,
                invalidRows: 0,
                errors: [`Schema conversion failed: ${schemaError instanceof Error ? schemaError.message : 'Unknown error'}`]
            };
        }

        // Process each row in the chunk
        for (const row of chunk.rows) {
            const validationResult = validateRowWithZodSchema(row.fields, zodSchema);
            
            // Log validation details for debugging
            if (!validationResult.success) {
                logInfo('Validation failed for row', {
                    jobId: chunk.jobId,
                    rowNumber: row.rowNumber,
                    validationErrors: validationResult.errors,
                    rowData: JSON.stringify(row.fields, null, 2)
                });
            }

            if (validationResult.success) {
                // Send valid row message
                const validMessage = {
                    jobId: chunk.jobId,
                    orgId: chunk.orgId,
                    sourceId: chunk.sourceId,
                    validRow: row
                };
                const sendResult = await sendValidRowMessage(validRowsProducer, validMessage);
                if (!sendResult.success) {
                    errors.push(`Failed to send valid row ${row.rowNumber}: ${sendResult.error}`);
                } else {
                    validRows++;
                }
            } else {
                // Send invalid row message
                const invalidMessage = {
                    jobId: chunk.jobId,
                    orgId: chunk.orgId,
                    sourceId: chunk.sourceId,
                    originalRow: row,
                    errors: validationResult.errors
                };
                const sendResult = await sendInvalidRowMessage(invalidRowsProducer, invalidMessage);
                if (!sendResult.success) {
                    errors.push(`Failed to send invalid row ${row.rowNumber}: ${sendResult.error}`);
                } else {
                    invalidRows++;
                }
            }
            processedRows++;
        }

        // Update progress tracker
        updateProgressTracker(progressTracker, chunk, processedRows, validRows, invalidRows);

        // Send progress update
        const tracker = progressTracker.get(chunk.jobId);
        if (tracker) {
            await sendProgressMessage(progressProducer, chunk.jobId, chunk.orgId, chunk.sourceId, {
                processedRows: tracker.processedRows,
                validRows: tracker.validRows,
                invalidRows: tracker.invalidRows,
                totalRows: tracker.totalRows,
                isComplete: tracker.isComplete
            });
        }

        logInfo('Data chunk processing completed', {
            jobId: chunk.jobId,
            chunkNumber: chunk.chunkNumber,
            processedRows,
            validRows,
            invalidRows
        });

        return {
            success: errors.length === 0,
            processedRows,
            validRows,
            invalidRows,
            errors
        };
    } catch (error) {
        logError('Data chunk processing failed', error, {
            jobId: chunk.jobId,
            chunkNumber: chunk.chunkNumber
        });
        return {
            success: false,
            processedRows,
            validRows,
            invalidRows,
            errors: [...errors, error instanceof Error ? error.message : 'Unknown error occurred']
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
            receivedChunks: new Set([...existing.receivedChunks, chunk.chunkNumber]),
            isComplete: existing.processedChunks + 1 >= existing.expectedChunks
        };
        progressTracker.set(chunk.jobId, updated);
    } else {
        // Initialize new tracker
        const newTracker = {
            processedRows,
            validRows,
            invalidRows,
            totalChunks: 0, // Will be updated when we know the total
            processedChunks: 1,
            totalRows: 0, // Will be updated when we know the total
            isComplete: false,
            receivedChunks: new Set([chunk.chunkNumber]),
            expectedChunks: 0 // Will be updated when we know the total
        };
        progressTracker.set(chunk.jobId, newTracker);
    }
};

/**
 * Get progress tracker
 * Pure function that retrieves progress tracking
 */
export const getProgressTracker = (progressTracker: Map<string, any>, jobId: string): any => {
    return progressTracker.get(jobId);
};

/**
 * Clear progress tracker
 * Pure function that clears progress tracking
 */
export const clearProgressTracker = (progressTracker: Map<string, any>, jobId: string): void => {
    progressTracker.delete(jobId);
    logInfo('Cleared progress tracker', { jobId });
};
