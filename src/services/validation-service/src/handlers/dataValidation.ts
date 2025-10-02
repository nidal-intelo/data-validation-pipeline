import { getSchemaDefinition } from '../utils/database';
import { processDataChunk } from '../services/validationService';
import { logInfo, logError } from '../utils/logger';
import * as generated from '../utils/generated.js';

/**
 * Handle data validation event
 * Pure function that handles validation events
 */
export const handleDataValidation = async (
    eventData: any,
    databasePool: any,
    validRowsProducer: any,
    invalidRowsProducer: any,
    progressProducer: any,
    progressTracker: Map<string, any>
): Promise<void> => {
    try {
        // Deserialize protobuf binary data
        let chunk: any;
        if (Buffer.isBuffer(eventData.body)) {
            // Deserialize from protobuf binary format
            const protobufDataChunk = generated.cfk_poc.pipeline.DataChunk.decode(eventData.body);
            chunk = {
                jobId: protobufDataChunk.jobId,
                orgId: protobufDataChunk.orgId,
                sourceId: protobufDataChunk.sourceId,
                chunkNumber: protobufDataChunk.chunkNumber,
                rows: protobufDataChunk.rows.map((row: any) => ({
                    rowNumber: row.rowNumber,
                    fields: row.fields,
                    rawData: row.rawData
                }))
            };
            logInfo('Deserialized protobuf data chunk', {
                jobId: chunk.jobId,
                orgId: chunk.orgId,
                sourceId: chunk.sourceId,
                chunkNumber: chunk.chunkNumber,
                rowCount: chunk.rows.length,
                protobufSize: eventData.body.length
            });
        } else {
            // Fallback for JSON format (backward compatibility)
            chunk = eventData.body;
            logInfo('Received JSON data chunk for validation (fallback)', {
                jobId: chunk.jobId,
                orgId: chunk.orgId,
                sourceId: chunk.sourceId,
                chunkNumber: chunk.chunkNumber,
                rowCount: chunk.rows.length
            });
        }

        // Get schema definition
        const schemaResult = await getSchemaDefinition(databasePool, chunk.orgId, chunk.sourceId);
        if (!schemaResult.success || !schemaResult.data) {
            logError('Failed to get schema definition', undefined, {
                jobId: chunk.jobId,
                orgId: chunk.orgId,
                sourceId: chunk.sourceId,
                error: schemaResult.error
            });
            return;
        }

        const schema = schemaResult.data;

        // Process the chunk
        const result = await processDataChunk(chunk, schema, validRowsProducer, invalidRowsProducer, progressProducer, progressTracker);
        
        if (!result.success) {
            logError('Data chunk processing failed', undefined, {
                jobId: chunk.jobId,
                chunkNumber: chunk.chunkNumber,
                errors: result.errors
            });
        } else {
            logInfo('Data chunk processed successfully', {
                jobId: chunk.jobId,
                chunkNumber: chunk.chunkNumber,
                processedRows: result.processedRows,
                validRows: result.validRows,
                invalidRows: result.invalidRows
            });
        }
    } catch (error) {
        logError('Data validation handler failed', error);
    }
};
