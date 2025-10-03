import { EventHubProducerClient } from '@azure/event-hubs';
import { getEnvironmentConfig } from '../utils/environment';
import { logInfo, logError } from '../utils/logger';
import { serializeDataChunk } from './protobufService';

/**
 * Create EventHub producer client
 * Pure function that creates an EventHub producer
 */
export const createEventHubProducer = () => {
    const env = getEnvironmentConfig();
    return new EventHubProducerClient(env.kafkaBootstrapServers, env.kafkaTopicInjection);
};

/**
 * Send chunks to EventHub
 * Pure function that sends data chunks to EventHub
 */
export const sendChunksToEventHub = async (producer: EventHubProducerClient, chunks: any[]) => {
    const errors: string[] = [];
    let sentBatchCount = 0;
    let sentChunkCount = 0;
    let failedCount = 0;

    try {
        logInfo('Starting EventHub integration', {
            totalChunks: chunks.length
        });

        let batch = await producer.createBatch();

        for (const chunk of chunks) {
            try {
                // Serialize chunk to protobuf binary format
                const serializationResult = serializeDataChunk(chunk);
                if (!serializationResult.success || !serializationResult.data) {
                    throw new Error(`Failed to serialize chunk: ${serializationResult.error}`);
                }

                const eventData = {
                    body: serializationResult.data,
                    partitionKey: chunk.jobId
                };

                // Try to add to current batch
                let added = batch.tryAdd(eventData);
                
                // If batch is full, send it and create a new one
                while (!added) {
                    // Send the full batch
                    if (batch.count > 0) {
                        await producer.sendBatch(batch);
                        sentBatchCount++;
                        logInfo('Sent batch', { 
                            batchNumber: sentBatchCount, 
                            eventsInBatch: batch.count,
                            jobId: chunk.jobId
                        });
                    }
                    
                    // Create new batch and retry adding
                    batch = await producer.createBatch();
                    added = batch.tryAdd(eventData);
                    
                    // If still can't add, the single event is too large
                    if (!added && batch.count === 0) {
                        throw new Error(`Event data too large for batch (chunk ${chunk.chunkNumber}, size: ${serializationResult.data.length} bytes)`);
                    }
                }
                
                sentChunkCount++;
                
            } catch (error) {
                failedCount++;
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                errors.push(`Failed to process chunk ${chunk.chunkNumber}: ${errorMessage}`);
                logError('Failed to process chunk', error, {
                    chunkNumber: chunk.chunkNumber,
                    jobId: chunk.jobId
                });
            }
        }

        // Send final batch with remaining events
        if (batch.count > 0) {
            await producer.sendBatch(batch);
            sentBatchCount++;
            logInfo('Sent final batch', { 
                batchNumber: sentBatchCount, 
                eventsInBatch: batch.count 
            });
        }

        logInfo('EventHub integration completed', {
            totalChunks: chunks.length,
            sentChunkCount,
            sentBatchCount,
            failedCount
        });

        // CRITICAL: Verify all chunks were sent
        if (sentChunkCount !== chunks.length - failedCount) {
            const missingCount = chunks.length - sentChunkCount - failedCount;
            errors.push(`CRITICAL: ${missingCount} chunks were neither sent nor failed - potential data loss!`);
        }

        return {
            success: errors.length === 0,
            sentBatchCount,
            sentChunkCount,
            failedCount,
            errors
        };
    } catch (error) {
        logError('EventHub sending failed catastrophically', error);
        return {
            success: false,
            sentBatchCount,
            sentChunkCount,
            failedCount: chunks.length - sentChunkCount,
            errors: [...errors, error instanceof Error ? error.message : 'Unknown error']
        };
    }
};

/**
 * Close EventHub producer
 * Pure function that closes the EventHub producer
 */
export const closeEventHubProducer = async (producer: EventHubProducerClient) => {
    try {
        await producer.close();
        logInfo('EventHub producer closed successfully');
    } catch (error) {
        logError('Failed to close EventHub producer', error);
    }
};