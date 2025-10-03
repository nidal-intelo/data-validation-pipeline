import { getSchemaDefinition, updateValidationStatus, incrementValidationCounts } from '../utils/database';
import { processDataChunk } from '../services/validationService';
import { logInfo, logError } from '../utils/logger';
import * as generated from '../utils/generated.js';
import { clearProgressTracker } from '../services/validationService';

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
        // Handle metadata event
        if (eventData.body && eventData.body.type === 'JOB_METADATA') {
            const metadata = eventData.body;
            logInfo('Received job metadata', {
                jobId: metadata.jobId,
                totalChunks: metadata.totalChunks,
                totalRows: metadata.totalRows
            });

            // Initialize or update progress tracker with totals
            const existing = progressTracker.get(metadata.jobId);
            if (existing) {
                progressTracker.set(metadata.jobId, {
                    ...existing,
                    totalChunks: metadata.totalChunks,
                    totalRows: metadata.totalRows,
                    schema: metadata.schema,  // ← Update schema if metadata comes late
                    expectedChunks: metadata.totalChunks
                });
            } else {
                progressTracker.set(metadata.jobId, {
                    processedRows: 0,
                    validRows: 0,
                    invalidRows: 0,
                    totalChunks: metadata.totalChunks,
                    processedChunks: 0,
                    totalRows: metadata.totalRows,
                    schema: metadata.schema,  // ← Store schema from metadata
                    isComplete: false,
                    receivedChunks: new Set(),
                    expectedChunks: metadata.totalChunks
                });
            }

            // Set initial DB status
            await updateValidationStatus(databasePool, metadata.jobId, 0, 0, 'processing');
            return;
        }

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
                chunkNumber: chunk.chunkNumber,
                rowCount: chunk.rows.length
            });
        } else {
            // Fallback for JSON format (backward compatibility)
            chunk = eventData.body;
            logInfo('Received JSON data chunk', {
                jobId: chunk.jobId,
                chunkNumber: chunk.chunkNumber
            });
        }

        // Get or initialize tracker for this job
        let currentTracker = progressTracker.get(chunk.jobId);
        
        // If tracker doesn't exist or schema is missing, we need to fetch it
        if (!currentTracker || !currentTracker.schema) {
            logInfo('Tracker or schema not found, fetching schema', { 
                jobId: chunk.jobId,
                hasTracker: !!currentTracker,
                hasSchema: currentTracker?.schema ? true : false
            });
            
            // Get schema definition (fallback if metadata wasn't received first)
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

            if (currentTracker) {
                // Update existing tracker with schema
                currentTracker.schema = schemaResult.data;
            } else {
                // Create new tracker (metadata event was missed or delayed)
                logInfo('Creating new tracker as metadata was not received', { jobId: chunk.jobId });
                currentTracker = {
                    processedRows: 0,
                    validRows: 0,
                    invalidRows: 0,
                    totalChunks: 0,  // Unknown until metadata arrives
                    processedChunks: 0,
                    totalRows: 0,    // Unknown until metadata arrives
                    schema: schemaResult.data,
                    isComplete: false,
                    receivedChunks: new Set(),
                    expectedChunks: 0
                };
                progressTracker.set(chunk.jobId, currentTracker);
            }
        }

        // Process the chunk with validated schema
        const result = await processDataChunk(
            chunk, 
            currentTracker.schema, 
            validRowsProducer, 
            invalidRowsProducer, 
            progressProducer, 
            progressTracker
        );

        if (!result.success) {
            logError('Data chunk processing failed', undefined, {
                jobId: chunk.jobId,
                chunkNumber: chunk.chunkNumber,
                errors: result.errors
            });
            return;  // Early exit on processing failure
        }

        logInfo('Data chunk processed successfully', {
            jobId: chunk.jobId,
            chunkNumber: chunk.chunkNumber,
            processedRows: result.processedRows,
            validRows: result.validRows,
            invalidRows: result.invalidRows
        });

        // ===== NEW: Atomic database update =====
        const tracker = progressTracker.get(chunk.jobId);
        if (!tracker) {
            logError('Progress tracker disappeared during processing', undefined, { 
                jobId: chunk.jobId 
            });
            return;
        }

        // Only update DB if we know the total rows (metadata received)
        if (tracker.totalRows > 0) {
            const dbResult = await incrementValidationCounts(
                databasePool,
                chunk.jobId,
                result.validRows,        // Increment by this chunk's valid count
                result.invalidRows,      // Increment by this chunk's invalid count
                result.processedRows,    // Not used in query, but kept for logging
                tracker.totalRows        // Total expected rows from metadata
            );

            if (!dbResult.success) {
                logError('Failed to update database counts', undefined, {
                    jobId: chunk.jobId,
                    chunkNumber: chunk.chunkNumber,
                    error: dbResult.error
                });
                return;  // Don't continue if DB update fails
            }

            // Update local tracker with authoritative DB values
            progressTracker.set(chunk.jobId, {
                ...tracker,
                validRows: dbResult.validRows,        // From DB (source of truth)
                invalidRows: dbResult.invalidRows,    // From DB (source of truth)
                processedRows: dbResult.validRows + dbResult.invalidRows,
                processedChunks: tracker.processedChunks + 1,
                receivedChunks: new Set([...tracker.receivedChunks, chunk.chunkNumber]),
                isComplete: dbResult.isComplete       // From DB (source of truth)
            });

            logInfo('Database counts updated', {
                jobId: chunk.jobId,
                chunkNumber: chunk.chunkNumber,
                validRows: dbResult.validRows,
                invalidRows: dbResult.invalidRows,
                totalProcessed: dbResult.validRows + dbResult.invalidRows,
                totalExpected: tracker.totalRows,
                isComplete: dbResult.isComplete
            });

            // Clean up if job is complete
            if (dbResult.isComplete) {
                logInfo('Validation job completed - final counts committed to database', {
                    jobId: chunk.jobId,
                    finalValidRows: dbResult.validRows,
                    finalInvalidRows: dbResult.invalidRows,
                    totalRows: tracker.totalRows,
                    processedChunks: tracker.processedChunks + 1,
                    totalChunks: tracker.totalChunks
                });
                
                // Remove job from in-memory tracker
                clearProgressTracker(progressTracker, chunk.jobId);
            }
        } else {
            // Metadata not yet received - just update local tracker
            logInfo('Metadata not yet received, updating local tracker only', {
                jobId: chunk.jobId,
                chunkNumber: chunk.chunkNumber
            });
            
            progressTracker.set(chunk.jobId, {
                ...tracker,
                validRows: tracker.validRows + result.validRows,
                invalidRows: tracker.invalidRows + result.invalidRows,
                processedRows: tracker.processedRows + result.processedRows,
                processedChunks: tracker.processedChunks + 1,
                receivedChunks: new Set([...tracker.receivedChunks, chunk.chunkNumber])
            });
        }

    } catch (error) {
        logError('Data validation handler failed', error);
    }
};