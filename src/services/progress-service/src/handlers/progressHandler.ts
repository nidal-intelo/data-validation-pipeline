import { processProgressUpdate, checkJobCompletion } from '../services/progressService';
import { logInfo, logError } from '../utils/logger';

/**
 * Handle progress update event
 * Receives updates from Event Hubs and writes to Firestore
 */
export const handleProgressUpdate = async (
    eventData: any,
    progressStates: Map<string, any>
): Promise<void> => {
    try {
        const progressUpdate = eventData.body;
        
        // Validate required fields
        if (!progressUpdate.jobId || !progressUpdate.orgId || !progressUpdate.serviceName) {
            logError('Progress update missing required fields', undefined, {
                hasJobId: !!progressUpdate.jobId,
                hasOrgId: !!progressUpdate.orgId,
                hasServiceName: !!progressUpdate.serviceName
            });
            return;
        }

        logInfo('Received progress update from Event Hubs', {
            jobId: progressUpdate.jobId,
            orgId: progressUpdate.orgId,
            serviceName: progressUpdate.serviceName,
            processedCount: progressUpdate.processedCount,
            totalRows: progressUpdate.totalRows,
            isComplete: progressUpdate.isComplete
        });
        
        // Process the progress update and write to Firestore
        const result = await processProgressUpdate(
            progressUpdate.jobId,
            progressUpdate.serviceName,
            progressUpdate.processedCount,
            progressUpdate.totalRows || 0,
            progressStates,
            progressUpdate.orgId,
            {
                fileName: progressUpdate.fileName,
                uploadedBy: progressUpdate.uploadedBy
            }
        );
        
        if (!result.success) {
            logError('Progress update processing failed', undefined, {
                jobId: progressUpdate.jobId,
                serviceName: progressUpdate.serviceName,
                orgId: progressUpdate.orgId,
                error: result.error
            });
            return;
        }
        
        // Check if job is complete
        const completionResult = await checkJobCompletion(
            progressUpdate.jobId,
            progressStates,
            progressUpdate.totalRows || 0,
            progressUpdate.orgId
        );
        
        if (!completionResult.success) {
            logError('Job completion check failed', undefined, {
                jobId: progressUpdate.jobId,
                orgId: progressUpdate.orgId,
                error: completionResult.error
            });
        }
        
        logInfo('Progress update handled successfully', {
            jobId: progressUpdate.jobId,
            serviceName: progressUpdate.serviceName,
            orgId: progressUpdate.orgId,
            isComplete: completionResult.isComplete
        });
    } catch (error) {
        logError('Progress handler failed', error);
    }
};