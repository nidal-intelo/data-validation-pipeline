import express from 'express';
import { EventHubConsumerClient } from '@azure/event-hubs';
import { getEnvironmentConfig } from './utils/environment';
import { createDatabasePool, closeDatabasePool, createDatabaseConfig } from './utils/database';
import { closeEventHubProducer } from './utils/eventHubs';
import { handleDataValidation } from './handlers/dataValidation';
import { logInfo, logError } from './utils/logger';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Global state for progress tracking
const progressTracker = new Map();

// Initialize services
let consumer: EventHubConsumerClient;
let validRowsProducer: any;
let invalidRowsProducer: any;
let progressProducer: any;
let databasePool: any;

/**
 * Initialize validation service
 * Pure function that initializes all services
 */
const initializeValidationService = async (): Promise<void> => {
    try {
        const env = getEnvironmentConfig();
        
        // Initialize database pool
        databasePool = createDatabasePool(createDatabaseConfig());
        
        // Initialize EventHub producers
        validRowsProducer = require('./utils/eventHubs').createValidRowsProducer();
        invalidRowsProducer = require('./utils/eventHubs').createInvalidRowsProducer();
        progressProducer = require('./utils/eventHubs').createProgressProducer();
        
        // Initialize EventHub consumer
        const consumerGroup = 'validation-service-group';
        consumer = new EventHubConsumerClient(consumerGroup, env.kafkaBootstrapServers, env.kafkaTopicInjection);
        
        logInfo('Validation service initialized successfully', {
            kafkaBootstrapServers: env.kafkaBootstrapServers,
            kafkaTopicInjection: env.kafkaTopicInjection,
            kafkaTopicValidRows: env.kafkaTopicValidRows,
            kafkaTopicInvalidRows: env.kafkaTopicInvalidRows,
            kafkaTopicProgress: env.kafkaTopicProgress
        });
    } catch (error) {
        logError('Failed to initialize validation service', error);
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
                    await handleDataValidation(event, databasePool, validRowsProducer, invalidRowsProducer, progressProducer, progressTracker);
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
        consumerGroupId: 'validation-service-group',
        progressTrackers: progressTracker.size
    };
};

// Health check endpoint
app.get('/health', (req, res) => {
    const status = getServiceStatus();
    res.status(200).json({
        status: 'healthy',
        service: 'validation-service',
        timestamp: new Date().toISOString(),
        eventHubs: status
    });
});

// Status endpoint
app.get('/status', (req, res) => {
    const status = getServiceStatus();
    res.status(200).json({
        service: 'validation-service',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        eventHubs: status,
        topics: {
            input: process.env.KAFKA_TOPIC_INJECTION || 'injection-topic',
            validOutput: process.env.KAFKA_TOPIC_VALID_ROWS || 'valid-row-topic',
            invalidOutput: process.env.KAFKA_TOPIC_INVALID_ROWS || 'invalid-row-topic',
            progressOutput: process.env.KAFKA_TOPIC_PROGRESS || 'progress-topic'
        }
    });
});

// Graceful shutdown handling
process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down gracefully...');
    await stopEventHubConsumer();
    await closeEventHubProducer(validRowsProducer);
    await closeEventHubProducer(invalidRowsProducer);
    await closeEventHubProducer(progressProducer);
    await closeDatabasePool(databasePool);
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    await stopEventHubConsumer();
    await closeEventHubProducer(validRowsProducer);
    await closeEventHubProducer(invalidRowsProducer);
    await closeEventHubProducer(progressProducer);
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
        console.log('Starting Validation Service Container App...');
        console.log('Environment variables:', {
            KAFKA_BOOTSTRAP_SERVERS: process.env.KAFKA_BOOTSTRAP_SERVERS,
            KAFKA_TOPIC_INJECTION: process.env.KAFKA_TOPIC_INJECTION,
            KAFKA_TOPIC_VALID_ROWS: process.env.KAFKA_TOPIC_VALID_ROWS,
            KAFKA_TOPIC_INVALID_ROWS: process.env.KAFKA_TOPIC_INVALID_ROWS,
            KAFKA_TOPIC_PROGRESS: process.env.KAFKA_TOPIC_PROGRESS,
            VALIDATION_DB_BATCH_SIZE: process.env.VALIDATION_DB_BATCH_SIZE || '10',
            VALIDATION_MAX_ACCUMULATED_ROWS: process.env.VALIDATION_MAX_ACCUMULATED_ROWS || '1000',
            POSTGRES_HOST: process.env.POSTGRES_HOST,
            NODE_ENV: process.env.NODE_ENV
        });
        
        // Initialize services
        await initializeValidationService();
        
        // Start EventHub consumer
        await startEventHubConsumer();
        
        // Start HTTP server
        app.listen(port, () => {
            console.log(`Validation Service running on port ${port}`);
            console.log(`Health check available at: http://localhost:${port}/health`);
            console.log(`Status available at: http://localhost:${port}/status`);
        });
    } catch (error) {
        console.error('Failed to start Validation Service:', error);
        process.exit(1);
    }
};

// Start the application
main();
