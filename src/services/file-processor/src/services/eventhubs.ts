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
    let sentCount = 0;
    let failedCount = 0;

    try {
        logInfo('Starting EventHub integration', {
            totalChunks: chunks.length
        });

        // Create batch for sending
        const batch = await producer.createBatch();

        for (const chunk of chunks) {
            try {
                // Serialize chunk to protobuf binary format
                const serializationResult = serializeDataChunk(chunk);
                if (!serializationResult.success || !serializationResult.data) {
                    throw new Error(`Failed to serialize chunk: ${serializationResult.error}`);
                }

                const eventData = {
                    body: serializationResult.data
                };

                // Try to add to batch
                if (!batch.tryAdd(eventData)) {
                    // Batch is full, send it and create a new one
                    await producer.sendBatch(batch);
                    sentCount++;

                    const newBatch = await producer.createBatch();
                    if (!newBatch.tryAdd(eventData)) {
                        throw new Error('Event data too large for batch');
                    }
                }
            } catch (error) {
                failedCount++;
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                errors.push(`Failed to add chunk ${chunk.chunkNumber} to batch: ${errorMessage}`);
                logError('Failed to add chunk to batch', error, {
                    chunkNumber: chunk.chunkNumber,
                    jobId: chunk.jobId
                });
            }
        }

        // Send remaining batch
        if (batch.count > 0) {
            await producer.sendBatch(batch);
            sentCount++;
        }

        logInfo('EventHub integration completed', {
            sentCount,
            failedCount,
            totalChunks: chunks.length
        });

        return {
            success: errors.length === 0,
            sentCount,
            failedCount,
            errors
        };
    } catch (error) {
        logError('EventHub sending failed', error);
        return {
            success: false,
            sentCount,
            failedCount: failedCount + chunks.length,
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