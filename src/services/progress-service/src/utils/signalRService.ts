import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { getEnvironmentConfig } from './environment';
import { logInfo, logError } from './logger';

/**
 * Parse Azure SignalR connection string
 * Pure function that parses the connection string
 */
const parseSignalRConnectionString = (connectionString: string): { endpoint: string; accessKey: string } => {
    const parts = connectionString.split(';');
    let endpoint = '';
    let accessKey = '';
    
    for (const part of parts) {
        if (part.startsWith('Endpoint=')) {
            endpoint = part.substring(9); // Remove 'Endpoint='
        } else if (part.startsWith('AccessKey=')) {
            accessKey = part.substring(9); // Remove 'AccessKey='
        }
    }
    
    if (!endpoint || !accessKey) {
        throw new Error('Invalid SignalR connection string format');
    }
    
    return { endpoint, accessKey };
};

/**
 * Create SignalR connection
 * Pure function that creates a SignalR connection
 */
export const createSignalRConnection = (): HubConnection => {
    const env = getEnvironmentConfig();
    const { endpoint, accessKey } = parseSignalRConnectionString(env.signalRConnectionString);
    
    logInfo('Creating SignalR connection', {
        endpoint: endpoint.substring(0, 50) + '...', // Log partial endpoint for security
        hasAccessKey: !!accessKey
    });
    
    const connection = new HubConnectionBuilder()
        .withUrl(endpoint, {
            accessTokenFactory: () => accessKey
        })
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()
        .build();
        
    return connection;
};

/**
 * Connect to SignalR hub
 * Pure function that connects to SignalR
 */
export const connectToSignalR = async (connection: HubConnection): Promise<{ success: boolean; error?: string }> => {
    try {
        await connection.start();
        logInfo('Connected to SignalR hub');
        return { success: true };
    } catch (error) {
        logError('Failed to connect to SignalR hub', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};

/**
 * Disconnect from SignalR hub
 * Pure function that disconnects from SignalR
 */
export const disconnectFromSignalR = async (connection: HubConnection): Promise<void> => {
    try {
        await connection.stop();
        logInfo('Disconnected from SignalR hub');
    } catch (error) {
        logError('Failed to disconnect from SignalR hub', error);
    }
};

/**
 * Send progress notification
 * Pure function that sends a progress notification
 */
export const sendProgressNotification = async (
    connection: HubConnection,
    notification: any
): Promise<{ success: boolean; error?: string }> => {
    try {
        await connection.invoke('SendProgressUpdate', notification);
        
        logInfo('Sent progress notification', {
            jobId: notification.jobId,
            serviceName: notification.serviceName,
            percentage: notification.percentage,
            isComplete: notification.isComplete
        });
        
        return { success: true };
    } catch (error) {
        logError('Failed to send progress notification', error, {
            jobId: notification.jobId,
            serviceName: notification.serviceName
        });
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};

/**
 * Send job completion notification
 * Pure function that sends a job completion notification
 */
export const sendJobCompletionNotification = async (
    connection: HubConnection,
    jobId: string,
    overallPercentage: number,
    totalRows: number
): Promise<{ success: boolean; error?: string }> => {
    try {
        const completionNotification = {
            jobId,
            serviceName: 'overall',
            percentage: overallPercentage,
            processedCount: totalRows,
            totalRows,
            isComplete: true,
            timestamp: new Date()
        };
        
        await connection.invoke('SendProgressUpdate', completionNotification);
        
        logInfo('Sent job completion notification', {
            jobId,
            overallPercentage,
            totalRows
        });
        
        return { success: true };
    } catch (error) {
        logError('Failed to send job completion notification', error, {
            jobId
        });
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};
