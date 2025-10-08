import { calculateProgress, updateProgressState, createProgressNotification, calculateOverallProgress, shouldUpdateProgress } from '../utils/progressCalculator';
import { logInfo, logError } from '../utils/logger';
import { writeProgressUpdate, writeJobCompletion } from '../utils/firebaseClient';

/**
 * Process progress update
 * Sends updates directly to Firebase Firestore for the specific orgId
 */
export const processProgressUpdate = async (
    jobId: string,
    serviceName: string,
    processedCount: number,
    totalRows: number,
    progressStates: Map<string, any>,
    orgId: string,
    metadata?: {
        fileName?: string;
        uploadedBy?: string;
    }
): Promise<{ success: boolean; error?: string; notification?: any }> => {
    try {
        if (!orgId) {
            logError('Progress update missing orgId', undefined, {
                jobId,
                serviceName
            });
            return {
                success: false,
                error: 'Missing orgId - cannot write to Firestore'
            };
        }

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
        
        // Update progress state
        const updatedState = updateProgressState(existingState, jobId, serviceName, processedCount, totalRows);
        updatedState.lastPercentage = progressResult.percentage;
        updatedState.orgId = orgId;
        progressStates.set(stateKey, updatedState);
        
        // Send to Firestore if progress changed significantly
        if (progressResult.shouldNotify) {
            const firestoreResult = await writeProgressUpdate(
                orgId,
                jobId,
                serviceName,
                {
                    percentage: progressResult.percentage,
                    processedCount: processedCount,
                    totalRows: totalRows,
                    isComplete: progressResult.isComplete
                },
                metadata
            );
            
            if (!firestoreResult.success) {
                logError('Failed to write progress to Firestore', undefined, {
                    jobId,
                    serviceName,
                    orgId,
                    error: firestoreResult.error
                });
                return {
                    success: false,
                    error: firestoreResult.error
                };
            }
            
            logInfo('Progress written to Firestore successfully', {
                jobId,
                serviceName,
                orgId,
                percentage: progressResult.percentage,
                isComplete: progressResult.isComplete
            });
            
            const notification = createProgressNotification(
                jobId,
                serviceName,
                progressResult.percentage,
                processedCount,
                totalRows,
                progressResult.isComplete
            );
            notification.orgId = orgId;
            
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
 * Writes completion status to Firestore for the specific orgId
 */
export const checkJobCompletion = async (
    jobId: string,
    progressStates: Map<string, any>,
    totalRows: number,
    orgId: string
): Promise<{ success: boolean; isComplete: boolean; error?: string }> => {
    try {
        if (!orgId) {
            logError('Job completion check missing orgId', undefined, { jobId });
            return {
                success: false,
                isComplete: false,
                error: 'Missing orgId'
            };
        }

        const jobStates = Array.from(progressStates.entries())
            .filter(([key]) => key.startsWith(`${jobId}_`))
            .map(([_, state]) => state);
            
        if (jobStates.length === 0) {
            return { success: true, isComplete: false };
        }
        
        const overallProgress = calculateOverallProgress(new Map(jobStates.map(state => [state.serviceName, state])));
        const isComplete = overallProgress.isComplete;
        
        if (isComplete) {
            const completedServices = jobStates
            .filter(state => state.lastPercentage >= 100)
            .map(state => state.serviceName);
            
            const completionResult = await writeJobCompletion(
                orgId,
                jobId,
                overallProgress.overallPercentage,
                completedServices
            );
            
            if (!completionResult.success) {
                logError('Failed to write job completion to Firestore', undefined, {
                    jobId,
                    orgId,
                    error: completionResult.error
                });
                return {
                    success: false,
                    isComplete: false,
                    error: completionResult.error
                };
            }
            
            logInfo('Job completion written to Firestore successfully', {
                jobId,
                orgId,
                overallPercentage: overallProgress.overallPercentage,
                totalRows
            });

            clearJobProgress(jobId, progressStates);
            logInfo('Cleaned up in-memory state for completed job', {
                jobId,
                orgId
            });
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