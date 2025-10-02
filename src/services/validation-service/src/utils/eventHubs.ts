import { EventHubProducerClient } from '@azure/event-hubs';
import { getEnvironmentConfig } from './environment';
import { logInfo, logError } from './logger';

/**
 * Create EventHub producer client for valid rows
 * Pure function that creates a valid rows producer
 */
export const createValidRowsProducer = (): EventHubProducerClient => {
    const env = getEnvironmentConfig();
    return new EventHubProducerClient(env.kafkaBootstrapServers, env.kafkaTopicValidRows);
};

/**
 * Create EventHub producer client for invalid rows
 * Pure function that creates an invalid rows producer
 */
export const createInvalidRowsProducer = (): EventHubProducerClient => {
    const env = getEnvironmentConfig();
    return new EventHubProducerClient(env.kafkaBootstrapServers, env.kafkaTopicInvalidRows);
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
export const sendValidRowMessage = async (producer: EventHubProducerClient, message: any): Promise<{ success: boolean; error?: string }> => {
    try {
        const eventData = {
            body: message
        };
        await producer.sendBatch([eventData]);
        
        logInfo('Sent valid row message', {
            jobId: message.jobId,
            orgId: message.orgId,
            sourceId: message.sourceId,
            rowNumber: message.validRow.rowNumber
        });
        
        return { success: true };
    } catch (error) {
        logError('Failed to send valid row message', error, {
            jobId: message.jobId,
            rowNumber: message.validRow.rowNumber
        });
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};

/**
 * Send invalid row message
 * Pure function that sends an invalid row message
 */
export const sendInvalidRowMessage = async (producer: EventHubProducerClient, message: any): Promise<{ success: boolean; error?: string }> => {
    try {
        const eventData = {
            body: message
        };
        await producer.sendBatch([eventData]);
        return { success: true };
    } catch (error) {
        logError('Failed to send invalid row message', error, {
            jobId: message.jobId,
            rowNumber: message.originalRow.rowNumber
        });
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
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
    progress: any
): Promise<{ success: boolean; error?: string }> => {
    try {
        const eventData = {
            body: {
                jobId,
                orgId,
                sourceId,
                ...progress,
                timestamp: new Date().toISOString()
            }
        };
        await producer.sendBatch([eventData]);
        
        logInfo('Sent progress message', {
            jobId,
            orgId,
            sourceId,
            processedRows: progress.processedRows,
            validRows: progress.validRows,
            invalidRows: progress.invalidRows,
            isComplete: progress.isComplete
        });
        
        return { success: true };
    } catch (error) {
        logError('Failed to send progress message', error, {
            jobId,
            orgId,
            sourceId
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
