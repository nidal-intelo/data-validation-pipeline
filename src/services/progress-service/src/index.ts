import express from 'express';
import { EventHubConsumerClient } from '@azure/event-hubs';
import { getEnvironmentConfig, validateEnvironment } from './utils/environment';
import { createDatabasePool, closeDatabasePool, createDatabaseConfig } from './utils/database';
import { initializeFirebase } from './utils/firebaseClient';
import { handleProgressUpdate } from './handlers/progressHandler';
import { logInfo, logError } from './utils/logger';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

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

// Global state for progress tracking (in-memory cache)
const progressStates = new Map();

// Initialize services
let consumer: EventHubConsumerClient;
let databasePool: any;

/**
 * Initialize progress service with Firebase
 */
const initializeProgressService = async (): Promise<void> => {
    try {
        const env = getEnvironmentConfig();
        
        // Validate environment
        if (!validateEnvironment(env)) {
            throw new Error('Invalid environment configuration');
        }

        logInfo('🚀 Initializing Progress Service...', {
            environment: env.nodeEnv,
            kafkaServers: env.kafkaBootstrapServers.substring(0, 50) + '...',
            firebaseProject: env.firebaseProjectId
        });

        // Initialize Firebase Firestore
        logInfo('📱 Initializing Firebase Firestore...');
        console.log('firebaseServiceAccount', env.firebaseServiceAccount);
        console.log('firebaseProjectId', env.firebaseProjectId);
        initializeFirebase(env.firebaseServiceAccount, env.firebaseProjectId);
        logInfo('✅ Firebase Firestore initialized');

        // Initialize database pool
        logInfo('💾 Initializing database pool...');
        databasePool = createDatabasePool(createDatabaseConfig());
        logInfo('✅ Database pool initialized');
        
        // Initialize Event Hubs consumer
        logInfo('📨 Initializing Event Hubs consumer...');
        const consumerGroup = '$Default'; // or 'progress-service-group'
        consumer = new EventHubConsumerClient(
            consumerGroup, 
            env.kafkaBootstrapServers, 
            env.kafkaTopicProgress
        );
        logInfo('✅ Event Hubs consumer initialized');
        
        logInfo('✅ Progress service initialized successfully', {
            kafkaBootstrapServers: env.kafkaBootstrapServers.substring(0, 50) + '...',
            kafkaTopicProgress: env.kafkaTopicProgress,
            storageBackend: 'Firebase Firestore',
            consumerGroup
        });
    } catch (error) {
        logError('❌ Failed to initialize progress service', error);
        throw error;
    }
};

/**
 * Start EventHub consumer
 */
const startEventHubConsumer = async (): Promise<void> => {
    try {
        logInfo('📨 Starting EventHub consumer...');
        
        const subscription = consumer.subscribe({
            processEvents: async (events, context) => {
                if (events.length === 0) {
                    return;
                }

                logInfo('📩 Received batch of events from Event Hubs', {
                    eventCount: events.length,
                    partitionId: context.partitionId
                });

                for (const event of events) {
                    try {
                        await handleProgressUpdate(event, progressStates);
                    } catch (error) {
                        logError('❌ Failed to handle progress update', error, {
                            eventBody: event.body
                        });
                    }
                }
            },
            processError: async (error, context) => {
                logError('❌ EventHub consumer error', error, {
                    partitionId: context.partitionId,
                    consumerGroup: context.consumerGroup
                });
            }
        });
        
        logInfo('✅ EventHub consumer started successfully', {
            topic: process.env.KAFKA_TOPIC_PROGRESS
        });
    } catch (error) {
        logError('❌ Failed to start EventHub consumer', error);
        throw error;
    }
};

/**
 * Stop EventHub consumer
 */
const stopEventHubConsumer = async (): Promise<void> => {
    try {
        if (consumer) {
            await consumer.close();
            logInfo('✅ EventHub consumer stopped successfully');
        }
    } catch (error) {
        logError('❌ Failed to stop EventHub consumer', error);
    }
};

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: 'progress-service',
        timestamp: new Date().toISOString(),
        storage: {
            backend: 'Firebase Firestore',
            realtimeUpdates: 'enabled'
        }
    });
});

// Status endpoint
app.get('/status', (req, res) => {
    res.status(200).json({
        service: 'progress-service',
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'development',
        eventHubs: {
            isRunning: true,
            consumerGroupId: '$Default',
            topic: process.env.KAFKA_TOPIC_PROGRESS
        },
        storage: {
            backend: 'Firebase Firestore',
            projectId: process.env.FIREBASE_PROJECT_ID,
            realtimeUpdates: 'enabled'
        },
        statistics: {
            activeProgressStates: progressStates.size,
            memoryUsage: process.memoryUsage()
        }
    });
});

// Statistics endpoint - shows in-memory cache state
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
                orgId: state.orgId,
                lastUpdated: state.lastUpdated
            }))
        }
    });
});

/**
 * TEST ENDPOINT: Simulate a progress update
 * POST /test/send-progress
 * Body: { jobId, orgId, serviceName, processedCount, totalRows, fileName?, uploadedBy? }
 */
app.post('/test/send-progress', async (req, res) => {
    try {
        const { jobId, orgId, serviceName, processedCount, totalRows, fileName, uploadedBy } = req.body;

        if (!jobId || !orgId || !serviceName) {
            return res.status(400).json({
                error: 'Missing required fields: jobId, orgId, serviceName'
            });
        }

        const testEvent = {
            body: {
                jobId,
                orgId,
                serviceName,
                processedCount: processedCount || 100,
                totalRows: totalRows || 1000,
                fileName: fileName || 'test-file.csv',
                uploadedBy: uploadedBy || 'test-user@example.com',
                isComplete: processedCount >= totalRows,
                timestamp: new Date().toISOString()
            }
        };

        logInfo('🧪 TEST: Simulating progress update', {
            jobId,
            orgId,
            serviceName,
            processedCount,
            totalRows
        });

        await handleProgressUpdate(testEvent, progressStates);

        res.status(200).json({
            message: '✅ Test progress update processed successfully',
            update: testEvent.body,
            firestorePath: `progress/${orgId}/jobs/${jobId}`,
            consoleUrl: `https://console.firebase.google.com/project/${process.env.FIREBASE_PROJECT_ID}/firestore/data/~2Fprogress~2F${orgId}~2Fjobs~2F${jobId}`
        });
    } catch (error) {
        logError('❌ Test endpoint failed', error);
        res.status(500).json({
            message: 'Failed to process test progress update',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * TEST ENDPOINT: Get current progress state from memory
 * GET /test/progress-state/:jobId
 */
app.get('/test/progress-state/:jobId', (req, res) => {
    const { jobId } = req.params;
    
    const jobStates = Array.from(progressStates.entries())
        .filter(([key]) => key.startsWith(`${jobId}_`))
        .map(([key, state]) => ({
            key,
            ...state
        }));

    if (jobStates.length === 0) {
        return res.status(404).json({
            message: 'No progress state found for this jobId',
            jobId
        });
    }

    res.status(200).json({
        jobId,
        states: jobStates
    });
});

// Graceful shutdown
const shutdown = async () => {
    logInfo('🛑 Shutting down Progress Service...');
    
    try {
        await stopEventHubConsumer();
        await closeDatabasePool(databasePool);
        
        logInfo('✅ Progress Service shutdown complete');
        process.exit(0);
    } catch (error) {
        logError('❌ Error during shutdown', error);
        process.exit(1);
    }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start the application
const main = async (): Promise<void> => {
    try {
        logInfo('🚀 Starting Progress Service with Firebase Firestore...');
        
        await initializeProgressService();
        await startEventHubConsumer();
        
        app.listen(port, () => {
            logInfo('✅ Progress Service is running', {
                port,
                endpoints: {
                    health: `http://localhost:${port}/health`,
                    status: `http://localhost:${port}/status`,
                    statistics: `http://localhost:${port}/statistics`,
                    testProgressUpdate: `POST http://localhost:${port}/test/send-progress`,
                    getProgressState: `GET http://localhost:${port}/test/progress-state/:jobId`
                },
                firebaseProject: process.env.FIREBASE_PROJECT_ID,
                firebaseConsole: `https://console.firebase.google.com/project/${process.env.FIREBASE_PROJECT_ID}/firestore`
            });
        });
    } catch (error) {
        logError('❌ Failed to start Progress Service', error);
        process.exit(1);
    }
};

main();