import { processProgressUpdate, checkJobCompletion } from '../services/progressService';
import { logInfo, logError } from '../utils/logger';
import { SignalRRestClient } from '../utils/signalRRestClient';

/**
 * Handle progress update event
 * Pure function that handles progress events
 */
export const handleProgressUpdate = async (
    eventData: any,
    progressStates: Map<string, any>,
    signalRClient: SignalRRestClient
): Promise<void> => {
    try {
        const progressUpdate = eventData.body;
        
        logInfo('Received progress update', {
            jobId: progressUpdate.jobId,
            serviceName: progressUpdate.serviceName,
            processedCount: progressUpdate.processedCount,
            orgId: progressUpdate.orgId  // Log orgId for visibility
        });
        
        // CRITICAL: Extract orgId from progress update
        const orgId = progressUpdate.orgId;
        
        if (!orgId) {
            logError('Progress update missing orgId - cannot filter by organization', undefined, {
                jobId: progressUpdate.jobId,
                serviceName: progressUpdate.serviceName
            });
            // Continue processing but log warning
        }
        
        // Process the progress update with orgId
        const result = await processProgressUpdate(
            progressUpdate.jobId,
            progressUpdate.serviceName,
            progressUpdate.processedCount,
            progressUpdate.totalRows || 0,
            progressStates,
            signalRClient,
            orgId  // Pass orgId for org-specific filtering
        );
        
        if (!result.success) {
            logError('Progress update processing failed', undefined, {
                jobId: progressUpdate.jobId,
                serviceName: progressUpdate.serviceName,
                orgId,
                error: result.error
            });
            return;
        }
        
        // Check if job is complete (with orgId)
        const completionResult = await checkJobCompletion(
            progressUpdate.jobId,
            progressStates,
            signalRClient,
            progressUpdate.totalRows || 0,
            orgId  // Pass orgId for org-specific filtering
        );
        
        if (!completionResult.success) {
            logError('Job completion check failed', undefined, {
                jobId: progressUpdate.jobId,
                orgId,
                error: completionResult.error
            });
        }
        
        logInfo('Progress update handled successfully', {
            jobId: progressUpdate.jobId,
            serviceName: progressUpdate.serviceName,
            orgId,
            isComplete: completionResult.isComplete
        });
    } catch (error) {
        logError('Progress handler failed', error);
    }
};