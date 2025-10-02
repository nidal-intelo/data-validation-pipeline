import express from 'express';
import { EventHubConsumerClient } from '@azure/event-hubs';
import { getEnvironmentConfig } from './utils/environment';
import { createDatabasePool, closeDatabasePool, createDatabaseConfig } from './utils/database';
import { createSignalRConnection, connectToSignalR, disconnectFromSignalR } from './utils/signalRService';
import { handleProgressUpdate } from './handlers/progressHandler';
import { logInfo, logError } from './utils/logger';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Global state for progress tracking
const progressStates = new Map();

// Initialize services
let consumer: EventHubConsumerClient;
let signalRConnection: any;
let databasePool: any;

/**
 * Initialize progress service
 * Pure function that initializes all services
 */
const initializeProgressService = async (): Promise<void> => {
    try {
        const env = getEnvironmentConfig();
        
        // Initialize database pool
        databasePool = createDatabasePool(createDatabaseConfig());
        
        // Initialize SignalR connection
        signalRConnection = createSignalRConnection();
        const signalRResult = await connectToSignalR(signalRConnection);
        if (!signalRResult.success) {
            throw new Error(`Failed to connect to SignalR: ${signalRResult.error}`);
        }
        
        // Initialize EventHub consumer
        const consumerGroup = 'progress-service-group';
        consumer = new EventHubConsumerClient(consumerGroup, env.kafkaBootstrapServers, env.kafkaTopicProgress);
        
        logInfo('Progress service initialized successfully', {
            kafkaBootstrapServers: env.kafkaBootstrapServers,
            kafkaTopicProgress: env.kafkaTopicProgress,
            signalRConnectionString: env.signalRConnectionString
        });
    } catch (error) {
        logError('Failed to initialize progress service', error);
        throw error;
    }
};

/**
 * Start EventHub consumer
 * Pure function that starts the consumer
 */
const startEventHubConsumer = async (): Promise<void> => {
    try {
        logInfo('Starting EventHub consumer...');
        
        await consumer.subscribe({
            processEvents: async (events) => {
                for (const event of events) {
                    await handleProgressUpdate(event, progressStates, signalRConnection);
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
 * Pure function that stops the consumer
 */
const stopEventHubConsumer = async (): Promise<void> => {
    try {
        await consumer.close();
        logInfo('EventHub consumer stopped successfully');
    } catch (error) {
        logError('Failed to stop EventHub consumer', error);
    }
};

/**
 * Get service status
 * Pure function that returns service status
 */
const getServiceStatus = () => {
    return {
        isRunning: true,
        consumerGroupId: 'progress-service-group',
        progressStates: progressStates.size
    };
};

// Health check endpoint
app.get('/health', (req, res) => {
    const status = getServiceStatus();
    res.status(200).json({
        status: 'healthy',
        service: 'progress-service',
        timestamp: new Date().toISOString(),
        kafka: {
            isRunning: status.isRunning,
            consumerGroupId: status.consumerGroupId
        }
    });
});

// Status endpoint
app.get('/status', (req, res) => {
    const status = getServiceStatus();
    res.status(200).json({
        service: 'progress-service',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        kafka: {
            isRunning: status.isRunning,
            consumerGroupId: status.consumerGroupId
        },
        topics: {
            input: process.env.KAFKA_TOPIC_PROGRESS || 'progress-topic'
        },
        statistics: {
            activeProgressStates: status.progressStates
        }
    });
});

// Statistics endpoint
app.get('/statistics', (req, res) => {
    const status = getServiceStatus();
    res.status(200).json({
        service: 'progress-service',
        timestamp: new Date().toISOString(),
        statistics: {
            activeProgressStates: status.progressStates,
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

// Graceful shutdown handling
process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down gracefully...');
    await stopEventHubConsumer();
    await disconnectFromSignalR(signalRConnection);
    await closeDatabasePool(databasePool);
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    await stopEventHubConsumer();
    await disconnectFromSignalR(signalRConnection);
    await closeDatabasePool(databasePool);
    process.exit(0);
});

// Error handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the application
const main = async (): Promise<void> => {
    try {
        console.log('Starting Progress Service Container App...');
        console.log('Environment variables:', {
            KAFKA_BOOTSTRAP_SERVERS: process.env.KAFKA_BOOTSTRAP_SERVERS,
            KAFKA_TOPIC_PROGRESS: process.env.KAFKA_TOPIC_PROGRESS,
            DATABASE_HOST: process.env.POSTGRES_HOST,
            SIGNALR_CONNECTION_STRING: process.env.SIGNALR_CONNECTION_STRING,
            NODE_ENV: process.env.NODE_ENV
        });
        
        // Initialize services
        await initializeProgressService();
        
        // Start EventHub consumer
        await startEventHubConsumer();
        
        // Start HTTP server
        app.listen(port, () => {
            console.log(`Progress Service running on port ${port}`);
            console.log(`Health check available at: http://localhost:${port}/health`);
            console.log(`Status available at: http://localhost:${port}/status`);
            console.log(`Statistics available at: http://localhost:${port}/statistics`);
        });
    } catch (error) {
        console.error('Failed to start Progress Service:', error);
        process.exit(1);
    }
};

// Start the application
main();
