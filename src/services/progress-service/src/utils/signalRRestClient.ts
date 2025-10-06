import { WebPubSubServiceClient } from '@azure/web-pubsub';
import { logInfo, logError } from './logger';

/**
 * Parse Azure SignalR connection string
 */
function parseConnectionString(connectionString: string): { endpoint: string; accessKey: string } {
    const parts = connectionString.split(';');
    let endpoint = '';
    let accessKey = '';
    
    for (const part of parts) {
        if (part.startsWith('Endpoint=')) {
            endpoint = part.substring(9);
        } else if (part.startsWith('AccessKey=')) {
            accessKey = part.substring(10);
        }
    }
    
    if (!endpoint || !accessKey) {
        throw new Error('Invalid SignalR connection string format');
    }
    
    return { endpoint, accessKey };
}

/**
 * SignalR REST API Client using Official Azure SDK
 */
export class SignalRRestClient {
    private client: WebPubSubServiceClient;
    private hubName: string;
    
    constructor(connectionString: string, hubName: string = 'progressHub') {
        this.hubName = hubName;
        
        // Use official SDK - it handles all JWT token generation
        this.client = new WebPubSubServiceClient(connectionString, hubName);
        
        logInfo('SignalR REST client initialized with Azure SDK', {
            hubName
        });
    }
    
    /**
     * Send message to all connected clients
     */
    async sendToAll(target: string, ...args: any[]): Promise<{ success: boolean; error?: string }> {
        try {
            await this.client.sendToAll({
                target: target,
                arguments: args
            });
            
            logInfo('Sent message to all clients', {
                target,
                hubName: this.hubName
            });
            
            return { success: true };
        } catch (error) {
            logError('Failed to send message to all clients', error, {
                target,
                hubName: this.hubName
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    
    /**
     * Send message to specific group
     */
    async sendToGroup(groupName: string, target: string, ...args: any[]): Promise<{ success: boolean; error?: string }> {
        try {
            await this.client.group(groupName).sendToAll({
                target: target,
                arguments: args
            });
            
            logInfo('Sent message to group', {
                groupName,
                target,
                hubName: this.hubName
            });
            
            return { success: true };
        } catch (error) {
            logError('Failed to send message to group', error, {
                groupName,
                target,
                hubName: this.hubName
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}

/**
 * Create SignalR REST client instance
 */
export function createSignalRRestClient(connectionString: string, hubName: string = 'progressHub'): SignalRRestClient {
    return new SignalRRestClient(connectionString, hubName);
}

/**
 * Send progress notification using REST API
 */
export async function sendProgressNotification(
    client: SignalRRestClient,
    notification: any
): Promise<{ success: boolean; error?: string }> {
    return await client.sendToGroup(
        `org_${notification.orgId}`,
        'ReceiveProgressUpdate',
        notification
    );
}

/**
 * Send job completion notification using REST API
 */
export async function sendJobCompletionNotification(
    client: SignalRRestClient,
    jobId: string,
    overallPercentage: number,
    totalRows: number
): Promise<{ success: boolean; error?: string }> {
    const completionNotification = {
        jobId,
        serviceName: 'overall',
        percentage: overallPercentage,
        processedCount: totalRows,
        totalRows,
        isComplete: true,
        timestamp: new Date()
    };
    
    return await client.sendToAll('ReceiveProgressUpdate', completionNotification);
}