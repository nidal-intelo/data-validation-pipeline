import express from 'express';
import { EventHubConsumerClient } from '@azure/event-hubs';
import * as crypto from 'crypto';
import { getEnvironmentConfig } from './utils/environment';
import { createDatabasePool, closeDatabasePool, createDatabaseConfig } from './utils/database';
import { createSignalRRestClient, SignalRRestClient } from './utils/signalRRestClient';
import { handleProgressUpdate } from './handlers/progressHandler';
import { logInfo, logError } from './utils/logger';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public')); // Serve static test page

// Enable CORS for testing
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Global state for progress tracking
const progressStates = new Map();

// Initialize services
let consumer: EventHubConsumerClient;
let signalRClient: SignalRRestClient;
let databasePool: any;

/**
 * Generate JWT token for SignalR client connection
 * This is the token generation logic embedded in the service
 */
function generateSignalRToken(
    endpoint: string,
    accessKey: string,
    hubName: string,
    userId?: string,
    orgId?: string,
    expiresInMinutes: number = 60
): string {
    const audience = `${endpoint}/client/?hub=${hubName}`;
    const expiresAt = Math.floor(Date.now() / 1000) + (expiresInMinutes * 60);
    
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };
    
    const payload: any = {
        aud: audience,
        exp: expiresAt,
        iat: Math.floor(Date.now() / 1000)
    };
    
    // Add user ID for user-specific messages
    if (userId) {
        payload.sub = userId;
    }
    
    // IMPORTANT: Add orgId as a claim for filtering
    if (orgId) {
        payload.orgId = orgId;
    }
    
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    
    const signature = crypto
        .createHmac('sha256', accessKey)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64url');
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Parse SignalR connection string
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
    
    return { endpoint, accessKey };
}

/**
 * TOKEN GENERATION ENDPOINT
 * This replaces the need for a separate Azure Function
 * 
 * GET /api/signalr/negotiate?userId=<user>&orgId=<org>
 */
app.get('/api/signalr/negotiate', (req, res) => {
    try {
        const env = getEnvironmentConfig();
        const { endpoint, accessKey } = parseConnectionString(env.signalRConnectionString);
        
        const orgId = req.query.orgId as string;
        const hubName = req.query.hubName as string || 'progressHub';
        
        if (!orgId) {
            return res.status(400).json({
                error: 'orgId is required for connection'
            });
        }
        
        // CRITICAL: Generate token with group membership
        const groupName = `org_${orgId}`;
        const token = generateSignalRTokenWithGroup(endpoint, accessKey, hubName, groupName, 60);
        
        const url = `${endpoint}/client/?hub=${hubName}`;
        
        logInfo('Generated SignalR connection info with group', {
            orgId,
            hubName,
            groupName
        });
        
        res.status(200).json({
            url: url,
            accessToken: token,
            orgId: orgId
        });
    } catch (error) {
        logError('Failed to generate SignalR token', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});


function generateSignalRTokenWithGroup(
    endpoint: string,
    accessKey: string,
    hubName: string,
    groupName: string,
    expiresInMinutes: number = 60
): string {
    const cleanEndpoint = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
    const audience = `${cleanEndpoint}/client/?hub=${hubName}`;
    const expiresAt = Math.floor(Date.now() / 1000) + (expiresInMinutes * 60);
    
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };
    
    const payload = {
        aud: audience,
        exp: expiresAt,
        iat: Math.floor(Date.now() / 1000),
        role: [`webpubsub.group.${groupName}`]  // ← Add group membership
    };
    
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    
    const signature = crypto
        .createHmac('sha256', accessKey)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64url');
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
}


/**
 * Initialize progress service
 */
const initializeProgressService = async (): Promise<void> => {
    try {
        const env = getEnvironmentConfig();
        
        databasePool = createDatabasePool(createDatabaseConfig());
        signalRClient = createSignalRRestClient(env.signalRConnectionString, 'progressHub');
        
        const consumerGroup = 'progress-service-group';
        consumer = new EventHubConsumerClient(consumerGroup, env.kafkaBootstrapServers, env.kafkaTopicProgress);
        
        logInfo('Progress service initialized successfully', {
            kafkaBootstrapServers: env.kafkaBootstrapServers,
            kafkaTopicProgress: env.kafkaTopicProgress,
            signalRMode: 'serverless-rest-api'
        });
    } catch (error) {
        logError('Failed to initialize progress service', error);
        throw error;
    }
};

/**
 * Start EventHub consumer
 */
const startEventHubConsumer = async (): Promise<void> => {
    try {
        logInfo('Starting EventHub consumer...');
        
        await consumer.subscribe({
            processEvents: async (events) => {
                for (const event of events) {
                    await handleProgressUpdate(event, progressStates, signalRClient);
                }
            },
            processError: async (error) => {
                logError('EventHub consumer error', error);
            }
        });
        
        logInfo('EventHub consumer started successfully');
    } catch (error) {
        logError('Failed to start EventHub consumer', error);
        throw error;
    }
};

/**
 * Stop EventHub consumer
 */
const stopEventHubConsumer = async (): Promise<void> => {
    try {
        await consumer.close();
        logInfo('EventHub consumer stopped successfully');
    } catch (error) {
        logError('Failed to stop EventHub consumer', error);
    }
};

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: 'progress-service',
        timestamp: new Date().toISOString(),
        signalR: {
            mode: 'serverless-rest-api',
            tokenEndpoint: '/api/signalr/negotiate'
        }
    });
});

// Status endpoint
app.get('/status', (req, res) => {
    res.status(200).json({
        service: 'progress-service',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        kafka: {
            isRunning: true,
            consumerGroupId: 'progress-service-group'
        },
        signalR: {
            mode: 'serverless-rest-api',
            tokenEndpoint: '/api/signalr/negotiate'
        },
        statistics: {
            activeProgressStates: progressStates.size
        }
    });
});

// Statistics endpoint
app.get('/statistics', (req, res) => {
    res.status(200).json({
        service: 'progress-service',
        timestamp: new Date().toISOString(),
        statistics: {
            activeProgressStates: progressStates.size,
            progressStates: Array.from(progressStates.entries()).map(([key, state]) => ({
                key,
                jobId: state.jobId,
                serviceName: state.serviceName,
                percentage: state.lastPercentage,
                processedCount: state.currentProcessed,
                totalRows: state.totalRows,
                lastUpdated: state.lastUpdated
            }))
        }
    });
});

/**
 * TEST ENDPOINT: Send progress update to specific orgId
 * POST /test/send-progress
 * Body: { jobId, orgId, serviceName, processedCount, totalRows }
 */
app.post('/test/send-progress', async (req, res) => {
    try {
        const orgId = req.body.orgId;
        if (!orgId) {
            return res.status(400).json({
                error: 'orgId is required'
            });
        }
        
        const testUpdate = {
            jobId: req.body.jobId || 'test-123',
            orgId: orgId,
            serviceName: req.body.serviceName || 'validation',
            processedCount: req.body.processedCount || 100,
            totalRows: req.body.totalRows || 1000,
            percentage: Math.floor((req.body.processedCount / req.body.totalRows) * 100),
            isComplete: req.body.isComplete || false,
            timestamp: new Date().toISOString()
        };
        
        // Send to specific orgId group
        const result = await signalRClient.sendToGroup(
            `org_${orgId}`,  // Group name based on orgId
            'ReceiveProgressUpdate',
            testUpdate
        );
        
        if (result.success) {
            res.status(200).json({
                message: 'Test progress update sent successfully',
                update: testUpdate,
                targetGroup: `org_${orgId}`
            });
        } else {
            res.status(500).json({
                message: 'Failed to send test progress update',
                error: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error sending test progress update',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down gracefully...');
    await stopEventHubConsumer();
    await closeDatabasePool(databasePool);
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    await stopEventHubConsumer();
    await closeDatabasePool(databasePool);
    process.exit(0);
});

// Start the application
const main = async (): Promise<void> => {
    try {
        console.log('Starting Progress Service with embedded token endpoint...');
        
        await initializeProgressService();
        await startEventHubConsumer();
        
        app.listen(port, () => {
            console.log(`Progress Service running on port ${port}`);
            console.log(`Token endpoint: GET http://localhost:${port}/api/signalr/negotiate?orgId=<org>&userId=<user>`);
            console.log(`Test endpoint: POST http://localhost:${port}/test/send-progress`);
            console.log(`Health check: http://localhost:${port}/health`);
        });
    } catch (error) {
        console.error('Failed to start Progress Service:', error);
        process.exit(1);
    }
};

main();