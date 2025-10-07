import { EventHubProducerClient } from '@azure/event-hubs';
import { getEnvironmentConfig } from './environment';
import { logInfo, logError } from './logger';
import { serializeValidRowMessages } from './protobufService';

/**
 * Create EventHub producer client for valid rows
 * Pure function that creates a valid rows producer
 */
export const createValidRowsProducer = (): EventHubProducerClient => {
    const env = getEnvironmentConfig();
    return new EventHubProducerClient(env.kafkaBootstrapServers, env.kafkaTopicValidRows);
};
/**
 * Create EventHub producer client for progress updates
 * Pure function that creates a progress producer
 */
export const createProgressProducer = (): EventHubProducerClient => {
    const env = getEnvironmentConfig();
    return new EventHubProducerClient(env.kafkaBootstrapServers, env.kafkaTopicProgress);
};

/**
 * Send valid row message
 * Pure function that sends a valid row message
 */
export const sendValidRowMessage = async (producer: EventHubProducerClient, messages: any[]): Promise<{ success: boolean; error?: string }> => {
    if (messages.length === 0) return { success: true };

    try {
        // Serialize messages with protobuf
        const serializationResult = serializeValidRowMessages(messages);
        
        if (!serializationResult.success || serializationResult.errors.length > 0) {
            logError('Failed to serialize valid row messages', undefined, {
                errors: serializationResult.errors
            });
            return {
                success: false,
                error: `Serialization failed: ${serializationResult.errors.join(', ')}`
            };
        }

        const batch = await producer.createBatch();
        
        for (const serializedMessage of serializationResult.serializedMessages) {
            const eventData = { body: serializedMessage };
            if (!batch.tryAdd(eventData)) {
                // If batch is full, send it and create new one
                if (batch.count > 0) {
                    await producer.sendBatch(batch);
                }
                const newBatch = await producer.createBatch();
                if (!newBatch.tryAdd(eventData)) {
                    throw new Error('Single event too large for batch');
                }
                await producer.sendBatch(newBatch);
            }
        }

        if (batch.count > 0) {
            await producer.sendBatch(batch);
        }

        logInfo('Sent valid row batch (protobuf serialized)', {
            count: messages.length,
            jobId: messages[0]?.jobId
        });

        return { success: true };
    } catch (error) {
        logError('Failed to send valid row batch', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

/**
 * Send progress update message
 * Pure function that sends a progress update
 */
export const sendProgressMessage = async (
    producer: EventHubProducerClient,
    jobId: string,
    orgId: string,
    sourceId: string,
    serviceName: string,  // NEW: Required parameter for service identification
    progress: {
        processedRows: number;
        validRows?: number;
        invalidRows?: number;
        totalRows: number;
        processedChunks?: number;
        totalChunks?: number;
        isComplete: boolean;
    }
): Promise<{ success: boolean; error?: string }> => {
    try {
        const eventData = {
            body: {
                jobId,
                orgId,
                sourceId,
                serviceName,           // CRITICAL: Identifies which service is reporting
                processedCount: progress.processedRows,  // Match protobuf ProgressUpdate schema
                totalRows: progress.totalRows,
                validRows: progress.validRows,           // Additional metadata
                invalidRows: progress.invalidRows,       // Additional metadata
                processedChunks: progress.processedChunks,
                totalChunks: progress.totalChunks,
                isComplete: progress.isComplete,
                timestamp: new Date().toISOString()
            }
        };
        
        await producer.sendBatch([eventData]);
        
        logInfo('Sent progress message', {
            jobId,
            orgId,
            sourceId,
            serviceName,
            processedRows: progress.processedRows,
            totalRows: progress.totalRows,
            isComplete: progress.isComplete
        });
        
        return { success: true };
    } catch (error) {
        logError('Failed to send progress message', error, {
            jobId,
            orgId,
            sourceId,
            serviceName
        });
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};


/**
 * Close EventHub producer
 * Pure function that closes the EventHub producer
 */
export const closeEventHubProducer = async (producer: EventHubProducerClient): Promise<void> => {
    try {
        await producer.close();
        logInfo('EventHub producer closed successfully');
    } catch (error) {
        logError('Failed to close EventHub producer', error);
    }
};
