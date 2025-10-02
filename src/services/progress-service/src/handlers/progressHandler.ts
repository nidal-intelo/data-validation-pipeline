import { processProgressUpdate, checkJobCompletion } from '../services/progressService';
import { logInfo, logError } from '../utils/logger';

/**
 * Handle progress update event
 * Pure function that handles progress events
 */
export const handleProgressUpdate = async (
    eventData: any,
    progressStates: Map<string, any>,
    signalRConnection: any
): Promise<void> => {
    try {
        const progressUpdate = eventData.body;
        
        logInfo('Received progress update', {
            jobId: progressUpdate.jobId,
            serviceName: progressUpdate.serviceName,
            processedCount: progressUpdate.processedCount
        });
        
        // Process the progress update
        const result = await processProgressUpdate(
            progressUpdate.jobId,
            progressUpdate.serviceName,
            progressUpdate.processedCount,
            progressUpdate.totalRows || 0,
            progressStates,
            signalRConnection
        );
        
        if (!result.success) {
            logError('Progress update processing failed', undefined, {
                jobId: progressUpdate.jobId,
                serviceName: progressUpdate.serviceName,
                error: result.error
            });
            return;
        }
        
        // Check if job is complete
        const completionResult = await checkJobCompletion(
            progressUpdate.jobId,
            progressStates,
            signalRConnection,
            progressUpdate.totalRows || 0
        );
        
        if (!completionResult.success) {
            logError('Job completion check failed', undefined, {
                jobId: progressUpdate.jobId,
                error: completionResult.error
            });
        }
        
        logInfo('Progress update handled successfully', {
            jobId: progressUpdate.jobId,
            serviceName: progressUpdate.serviceName,
            isComplete: completionResult.isComplete
        });
    } catch (error) {
        logError('Progress handler failed', error);
    }
};
