import { logDebug } from './logger';

/**
 * Calculate progress for a service
 * Pure function that calculates progress percentage
 */
export const calculateProgress = (
    jobId: string,
    serviceName: string,
    processedCount: number,
    totalRows: number,
    existingState: any
): {
    percentage: number;
    shouldNotify: boolean;
    isComplete: boolean;
} => {
    logDebug('Calculating progress', {
        jobId,
        serviceName,
        processedCount,
        totalRows
    });
    
    if (totalRows <= 0) {
        logDebug('Invalid totalRows for jobId', {
            jobId,
            totalRows
        });
        return {
            percentage: 0,
            shouldNotify: false,
            isComplete: false
        };
    }
    
    const currentPercentage = Math.floor((processedCount / totalRows) * 100);
    const isComplete = currentPercentage >= 100;
    
    // Check if we should notify based on threshold
    const NOTIFICATION_THRESHOLD = 2; // Notify every 2% increase
    const lastPercentage = existingState?.lastPercentage || 0;
    const shouldNotify = (currentPercentage - lastPercentage) >= NOTIFICATION_THRESHOLD || isComplete;
    
    logDebug('Progress calculation result', {
        jobId,
        serviceName,
        currentPercentage,
        lastPercentage,
        shouldNotify,
        isComplete
    });
    
    return {
        percentage: currentPercentage,
        shouldNotify,
        isComplete
    };
};

/**
 * Update progress state
 * Pure function that updates progress state
 */
export const updateProgressState = (
    existingState: any,
    jobId: string,
    serviceName: string,
    processedCount: number,
    totalRows: number
): any => {
    const now = new Date();
    if (existingState) {
        return {
            ...existingState,
            currentProcessed: processedCount,
            totalRows,
            lastUpdated: now
        };
    } else {
        return {
            jobId,
            lastPercentage: 0,
            totalRows,
            currentProcessed: processedCount,
            serviceName,
            lastUpdated: now
        };
    }
};

/**
 * Create progress notification
 * Pure function that creates a progress notification
 */
export const createProgressNotification = (
    jobId: string,
    serviceName: string,
    percentage: number,
    processedCount: number,
    totalRows: number,
    isComplete: boolean
): any => {
    return {
        jobId,
        serviceName,
        percentage,
        processedCount,
        totalRows,
        isComplete,
        timestamp: new Date()
    };
};

/**
 * Calculate overall job progress
 * Pure function that calculates overall progress across services
 */
export const calculateOverallProgress = (serviceStates: Map<string, any>): {
    jobId: string;
    overallPercentage: number;
    services: any[];
    isComplete: boolean;
    lastUpdated: Date;
} => {
    const serviceProgresses: any[] = [];
    let totalPercentage = 0;
    let serviceCount = 0;
    let allComplete = true;
    
    for (const [serviceName, state] of serviceStates) {
        const serviceProgress = {
            serviceName,
            percentage: state.lastPercentage,
            processedCount: state.currentProcessed,
            totalRows: state.totalRows,
            isComplete: state.lastPercentage >= 100
        };
        serviceProgresses.push(serviceProgress);
        totalPercentage += state.lastPercentage;
        serviceCount++;
        
        if (state.lastPercentage < 100) {
            allComplete = false;
        }
    }
    
    const overallPercentage = serviceCount > 0 ? Math.floor(totalPercentage / serviceCount) : 0;
    
    return {
        jobId: serviceStates.values().next().value?.jobId || '',
        overallPercentage,
        services: serviceProgresses,
        isComplete: allComplete,
        lastUpdated: new Date()
    };
};

/**
 * Check if progress should be updated
 * Pure function that determines if progress should be updated
 */
export const shouldUpdateProgress = (
    currentState: any,
    newProcessedCount: number,
    newTotalRows: number
): boolean => {
    const hasProcessedCountChanged = currentState.currentProcessed !== newProcessedCount;
    const hasTotalRowsChanged = currentState.totalRows !== newTotalRows;
    const isSignificantChange = Math.abs(newProcessedCount - currentState.currentProcessed) >= 1;
    
    return hasProcessedCountChanged || hasTotalRowsChanged || isSignificantChange;
};
