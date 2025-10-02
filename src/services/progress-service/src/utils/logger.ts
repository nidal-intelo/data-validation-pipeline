/**
 * Logging utilities
 * Pure functions for consistent logging across the application
 */

/**
 * Create a structured log entry
 * Pure function that creates consistent log objects
 */
export const createLogEntry = (level: string, message: string, context?: any): any => {
    return {
        timestamp: new Date().toISOString(),
        level,
        message,
        service: 'progress-service',
        ...context
    };
};

/**
 * Log info message
 * Pure function for info logging
 */
export const logInfo = (message: string, context?: any): void => {
    const entry = createLogEntry('INFO', message, context);
    console.log(JSON.stringify(entry));
};

/**
 * Log error message
 * Pure function for error logging
 */
export const logError = (message: string, error?: any, context?: any): void => {
    const entry = createLogEntry('ERROR', message, {
        ...context,
        error: error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
        } : undefined
    });
    console.error(JSON.stringify(entry));
};

/**
 * Log warning message
 * Pure function for warning logging
 */
export const logWarning = (message: string, context?: any): void => {
    const entry = createLogEntry('WARN', message, context);
    console.warn(JSON.stringify(entry));
};

/**
 * Log debug message
 * Pure function for debug logging
 */
export const logDebug = (message: string, context?: any): void => {
    const entry = createLogEntry('DEBUG', message, context);
    console.log(JSON.stringify(entry));
};
