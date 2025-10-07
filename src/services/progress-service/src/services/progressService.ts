import { calculateProgress, updateProgressState, createProgressNotification, calculateOverallProgress, shouldUpdateProgress } from '../utils/progressCalculator';
import { logInfo, logError } from '../utils/logger';
import { sendProgressUpdate } from '../utils/firebaseClient';

/**
 * Process progress update
 * Pure function that processes a progress update
 * 
 * CRITICAL: Sends notifications only to the specific orgId group
 */
export const processProgressUpdate = async (
    jobId: string,
    serviceName: string,
    processedCount: number,
    totalRows: number,
    progressStates: Map<string, any>,
    signalRClient: SignalRRestClient,
    orgId?: string  // NEW: Required for org-specific filtering
): Promise<{ success: boolean; error?: string; notification?: any }> => {
    try {
        logInfo('Processing progress update', {
            jobId,
            serviceName,
            processedCount,
            totalRows,
            orgId
        });
        
        const stateKey = `${jobId}_${serviceName}`;
        const existingState = progressStates.get(stateKey);
        
        // Check if we should update progress
        if (existingState && !shouldUpdateProgress(existingState, processedCount, totalRows)) {
            logInfo('No significant progress change, skipping update', {
                jobId,
                serviceName,
                currentProcessed: existingState.currentProcessed,
                newProcessed: processedCount
            });
            return { success: true };
        }
        
        // Calculate progress
        const progressResult = calculateProgress(jobId, serviceName, processedCount, totalRows, existingState);
        
        // Update progress state (store orgId for later use)
        const updatedState = updateProgressState(existingState, jobId, serviceName, processedCount, totalRows);
        updatedState.lastPercentage = progressResult.percentage;
        updatedState.orgId = orgId; // Store orgId in state
        progressStates.set(stateKey, updatedState);
        
        // Create notification if needed
        if (progressResult.shouldNotify) {
            const notification = createProgressNotification(
                jobId,
                serviceName,
                progressResult.percentage,
                processedCount,
                totalRows,
                progressResult.isComplete
            );
            
            // Add orgId to notification
            notification.orgId = orgId;
            
            // CRITICAL: Send to org-specific group, not to all clients
            let sendResult;
            if (orgId) {
                const groupName = `org_${orgId}`;
                logInfo('Sending progress to org-specific group', {
                    jobId,
                    serviceName,
                    groupName,
                    percentage: progressResult.percentage
                });
                
                sendResult = await signalRClient.sendToGroup(
                    groupName,
                    'ReceiveProgressUpdate',
                    notification
                );
            } else {
                // Fallback: send to all (not recommended for production)
                logInfo('WARNING: No orgId provided, sending to all clients', {
                    jobId,
                    serviceName
                });
                
                sendResult = await signalRClient.sendToAll(
                    'ReceiveProgressUpdate',
                    notification
                );
            }
            
            if (!sendResult.success) {
                logError('Failed to send progress notification', undefined, {
                    jobId,
                    serviceName,
                    orgId,
                    error: sendResult.error
                });
            } else {
                logInfo('Progress notification sent successfully', {
                    jobId,
                    serviceName,
                    orgId,
                    percentage: progressResult.percentage,
                    isComplete: progressResult.isComplete
                });
            }
            
            return {
                success: true,
                notification
            };
        }
        
        return { success: true };
    } catch (error) {
        logError('Progress update processing failed', error, {
            jobId,
            serviceName,
            processedCount,
            totalRows,
            orgId
        });
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};

/**
 * Check job completion
 * Pure function that checks if a job is complete
 * 
 * CRITICAL: Sends completion notification only to the specific orgId group
 */
export const checkJobCompletion = async (
    jobId: string,
    progressStates: Map<string, any>,
    signalRClient: SignalRRestClient,
    totalRows: number,
    orgId?: string  // NEW: Required for org-specific filtering
): Promise<{ success: boolean; isComplete: boolean; error?: string }> => {
    try {
        const jobStates = Array.from(progressStates.entries())
            .filter(([key]) => key.startsWith(`${jobId}_`))
            .map(([_, state]) => state);
            
        if (jobStates.length === 0) {
            return { success: true, isComplete: false };
        }
        
        const overallProgress = calculateOverallProgress(new Map(jobStates.map(state => [state.serviceName, state])));
        const isComplete = overallProgress.isComplete;
        
        if (isComplete) {
            const completionNotification = {
                jobId,
                serviceName: 'overall',
                percentage: overallProgress.overallPercentage,
                processedCount: totalRows,
                totalRows,
                isComplete: true,
                timestamp: new Date(),
                orgId: orgId  // Include orgId in completion notification
            };
            
            // CRITICAL: Send to org-specific group
            let completionResult;
            if (orgId) {
                const groupName = `org_${orgId}`;
                logInfo('Sending job completion to org-specific group', {
                    jobId,
                    groupName,
                    overallPercentage: overallProgress.overallPercentage
                });
                
                completionResult = await signalRClient.sendToGroup(
                    groupName,
                    'ReceiveProgressUpdate',
                    completionNotification
                );
            } else {
                // Fallback: send to all (not recommended)
                logInfo('WARNING: No orgId provided for completion, sending to all clients', {
                    jobId
                });
                
                completionResult = await signalRClient.sendToAll(
                    'ReceiveProgressUpdate',
                    completionNotification
                );
            }
            
            if (!completionResult.success) {
                logError('Failed to send job completion notification', undefined, {
                    jobId,
                    orgId,
                    error: completionResult.error
                });
            } else {
                logInfo('Job completion notification sent successfully', {
                    jobId,
                    orgId,
                    overallPercentage: overallProgress.overallPercentage,
                    totalRows
                });
            }
        }
        
        return {
            success: true,
            isComplete
        };
    } catch (error) {
        logError('Job completion check failed', error, {
            jobId,
            orgId
        });
        return {
            success: false,
            isComplete: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};

/**
 * Get job progress
 * Pure function that retrieves job progress
 */
export const getJobProgress = (jobId: string, progressStates: Map<string, any>): any => {
    try {
        const jobStates = Array.from(progressStates.entries())
            .filter(([key]) => key.startsWith(`${jobId}_`))
            .map(([_, state]) => state);
            
        if (jobStates.length === 0) {
            return null;
        }
        
        return calculateOverallProgress(new Map(jobStates.map(state => [state.serviceName, state])));
    } catch (error) {
        logError('Failed to get job progress', error, {
            jobId
        });
        return null;
    }
};

/**
 * Clear job progress
 * Pure function that clears job progress
 */
export const clearJobProgress = (jobId: string, progressStates: Map<string, any>): void => {
    const keysToDelete = Array.from(progressStates.keys())
        .filter(key => key.startsWith(`${jobId}_`));
        
    keysToDelete.forEach(key => progressStates.delete(key));
    
    logInfo('Cleared job progress', {
        jobId,
        clearedStates: keysToDelete.length
    });
};