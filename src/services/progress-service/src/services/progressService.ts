import { calculateProgress, updateProgressState, createProgressNotification, calculateOverallProgress, shouldUpdateProgress } from '../utils/progressCalculator';
import { sendProgressNotification, sendJobCompletionNotification } from '../utils/signalRService';
import { logInfo, logError } from '../utils/logger';

/**
 * Process progress update
 * Pure function that processes a progress update
 */
export const processProgressUpdate = async (
    jobId: string,
    serviceName: string,
    processedCount: number,
    totalRows: number,
    progressStates: Map<string, any>,
    signalRConnection: any
): Promise<{ success: boolean; error?: string; notification?: any }> => {
    try {
        logInfo('Processing progress update', {
            jobId,
            serviceName,
            processedCount,
            totalRows
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
        
        // Update progress state
        const updatedState = updateProgressState(existingState, jobId, serviceName, processedCount, totalRows);
        updatedState.lastPercentage = progressResult.percentage;
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
            
            // Send notification via SignalR
            const sendResult = await sendProgressNotification(signalRConnection, notification);
            if (!sendResult.success) {
                logError('Failed to send progress notification', undefined, {
                    jobId,
                    serviceName,
                    error: sendResult.error
                });
            }
            
            logInfo('Progress notification sent', {
                jobId,
                serviceName,
                percentage: progressResult.percentage,
                isComplete: progressResult.isComplete
            });
            
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
            totalRows
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
 */
export const checkJobCompletion = async (
    jobId: string,
    progressStates: Map<string, any>,
    signalRConnection: any,
    totalRows: number
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
            // Send job completion notification
            const completionResult = await sendJobCompletionNotification(
                signalRConnection,
                jobId,
                overallProgress.overallPercentage,
                totalRows
            );
            
            if (!completionResult.success) {
                logError('Failed to send job completion notification', undefined, {
                    jobId,
                    error: completionResult.error
                });
            }
            
            logInfo('Job completed', {
                jobId,
                overallPercentage: overallProgress.overallPercentage,
                totalRows
            });
        }
        
        return {
            success: true,
            isComplete
        };
    } catch (error) {
        logError('Job completion check failed', error, {
            jobId
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
