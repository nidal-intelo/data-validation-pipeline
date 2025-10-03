import { EventHubProducerClient } from '@azure/event-hubs';
import { logInfo, logError } from '../utils/logger';
import { getSchemaDefinition } from '../utils/database';
import { Pool } from 'pg';

export interface JobMetadata {
    jobId: string;
    orgId: string;
    sourceId: string;
    totalChunks: number;
    totalRows: number;
    filename: string;
    schema?: any;
    timestamp: number;
}
/**
 * Send job metadata before sending chunks
 * This allows the validation service to know expected totals
 */
export const sendJobMetadata = async (
    producer: EventHubProducerClient,
    pool: Pool,
    metadata: JobMetadata
): Promise<{ success: boolean; error?: string }> => {
    try {
        const schemaResult = await getSchemaDefinition(
            pool, 
            metadata.orgId, 
            metadata.sourceId
        );

        if (!schemaResult.success) {
            return {
                success: false,
                error: `Failed to fetch schema: ${schemaResult.error}`
            };
        }


        const metadataEvent = {
            body: {
                type: 'JOB_METADATA',
                ...metadata,
                schema: schemaResult.data,
                sentAt: new Date().toISOString()
            },
            partitionKey: metadata.jobId
        };

        await producer.sendBatch([metadataEvent]);
        
        logInfo('Sent job metadata', {
            jobId: metadata.jobId,
            totalChunks: metadata.totalChunks,
            totalRows: metadata.totalRows,
            partitionKey: metadata.jobId
        });

        return { success: true };
    } catch (error) {
        logError('Failed to send job metadata', error, {
            jobId: metadata.jobId
        });
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};