import express from "express";
import {
  EventHubConsumerClient,
  PartitionContext,
  EventData,
  ReceivedEventData,
} from "@azure/event-hubs";
import { BlobCheckpointStore } from "@azure/eventhubs-checkpointstore-blob";
import { BlobServiceClient } from "@azure/storage-blob";

import { getEnvironmentConfig } from "./utils/environment";
import {
  createDatabasePool,
  closeDatabasePool,
  createDatabaseConfig,
} from "./utils/database";
import { closeEventHubProducer } from "./utils/eventHubs";
import { handleDataValidation } from "./handlers/dataValidation";
import { logInfo, logError } from "./utils/logger";

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Global state for progress tracking
const progressTracker = new Map();

// Service instances
let consumer: EventHubConsumerClient;
let validRowsProducer: any;
let progressProducer: any;
let databasePool: any;

/**
 * Initialize validation service
 */
const initializeValidationService = async (): Promise<void> => {
  try {
    const env = getEnvironmentConfig();

    // Initialize database pool
    databasePool = createDatabasePool(createDatabaseConfig());

    // Initialize EventHub producers
    validRowsProducer = require("./utils/eventHubs").createValidRowsProducer();
    progressProducer = require("./utils/eventHubs").createProgressProducer();

    // Initialize checkpoint store
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      env.azureStorageConnectionString
    );
    const checkpointStore = new BlobCheckpointStore(
      blobServiceClient.getContainerClient(env.azureStorageContainerName)
    );
    
    logInfo("Blob Checkpoint Store initialized successfully", {
      containerName: env.azureStorageContainerName,
    });

    // Initialize EventHub consumer
    const consumerGroup = "validation-service-group";
    consumer = new EventHubConsumerClient(
      consumerGroup,
      env.kafkaBootstrapServers,
      env.kafkaTopicInjection,
      checkpointStore
    );

    logInfo("Validation service initialized successfully", {
      kafkaBootstrapServers: env.kafkaBootstrapServers,
      kafkaTopicInjection: env.kafkaTopicInjection,
      kafkaTopicValidRows: env.kafkaTopicValidRows,
      kafkaTopicInvalidRows: env.kafkaTopicInvalidRows,
      kafkaTopicProgress: env.kafkaTopicProgress,
    });
  } catch (error) {
    logError("Failed to initialize validation service", error);
    throw error;
  }
};

/**
 * Start EventHub consumer
 */
const startEventHubConsumer = async (): Promise<void> => {
  try {
    logInfo("Starting EventHub consumer...");

    const CHECKPOINT_INTERVAL_MS = 10000; // Checkpoint every 10 seconds
    const CHECKPOINT_EVENT_COUNT = 5; // Or every 5 events, whichever comes first

    await consumer.subscribe(
      {
        processEvents: async (events: EventData[], context: PartitionContext) => {
          if (events.length === 0) {
            return;
          }

          logInfo("Received event batch", {
            partitionId: context.partitionId,
            eventCount: events.length,
          });

          let lastCheckpointTime = Date.now();
          let processedCount = 0;
          let lastProcessedEvent: ReceivedEventData | null = null;

          for (let i = 0; i < events.length; i++) {
            const event = events[i];

            if (!event.body) {
              logInfo("Skipping event with empty body", {
                partitionId: context.partitionId,
                sequenceNumber: (event as ReceivedEventData).sequenceNumber,
              });
              continue;
            }

            try {
              await handleDataValidation(
                event,
                databasePool,
                validRowsProducer,
                progressProducer,
                progressTracker
              );

              processedCount++;
              lastProcessedEvent = event as ReceivedEventData;

              const now = Date.now();
              const timeSinceLastCheckpoint = now - lastCheckpointTime;
    const isLastEvent = i === events.length - 1;
    const shouldCheckpointByTime = timeSinceLastCheckpoint >= CHECKPOINT_INTERVAL_MS;
    const shouldCheckpointByCount = processedCount >= CHECKPOINT_EVENT_COUNT;

        if (shouldCheckpointByTime || shouldCheckpointByCount || isLastEvent) {
            await context.updateCheckpoint(lastProcessedEvent);

            logInfo("Checkpoint updated", {
                partitionId: context.partitionId,
              sequenceNumber: lastProcessedEvent.sequenceNumber,
              offset: lastProcessedEvent.offset,
              processedCount,
              totalEvents: events.length,
              timeSinceLastCheckpoint: Math.round(timeSinceLastCheckpoint / 1000) + "s",
              reason: isLastEvent ? "last_event" : shouldCheckpointByTime ? "time_interval" : "event_count",
            });

            lastCheckpointTime = now;
            processedCount = 0;
        }
            } catch (error) {
              logError("Failed to process event", error, {
                partitionId: context.partitionId,
                sequenceNumber: (event as ReceivedEventData).sequenceNumber,
                offset: (event as ReceivedEventData).offset,
              });
              throw error;
            }
          }
        },

        processError: async (error, context) => {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          const isLeaseError = errorMessage.toLowerCase().includes("lease") || 
                              errorMessage.toLowerCase().includes("ownership");

          if (isLeaseError) {
            logError("CRITICAL: Partition lease lost or ownership error", error, {
              partitionId: context?.partitionId,
              errorType: "LEASE_LOSS",
            });
          } else {
            logError("EventHub consumer error during processing or checkpointing", error, {
              partitionId: context?.partitionId,
            });
          }
        },
      },
      {
        maxBatchSize: 10,
        maxWaitTimeInSeconds: 60,
      }
    );

    logInfo("EventHub consumer started successfully", {
      maxBatchSize: 10,
      checkpointInterval: CHECKPOINT_INTERVAL_MS + "ms",
      checkpointEventCount: CHECKPOINT_EVENT_COUNT,
    });
  } catch (error) {
    logError("Failed to start EventHub consumer", error);
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
      logInfo("EventHub consumer stopped successfully");
    } else {
      logInfo("EventHub consumer was not initialized");
    }
  } catch (error) {
    logError("Failed to stop EventHub consumer", error);
  }
};

/**
 * Get service status
 */
const getServiceStatus = () => {
  return {
    isRunning: true,
    consumerGroupId: "validation-service-group",
    progressTrackers: progressTracker.size,
  };
};

// Health check endpoint
app.get("/health", (req, res) => {
  const status = getServiceStatus();
  res.status(200).json({
    status: "healthy",
    service: "validation-service",
    timestamp: new Date().toISOString(),
    eventHubs: status,
  });
});

// Status endpoint
app.get("/status", (req, res) => {
  const status = getServiceStatus();
  res.status(200).json({
    service: "validation-service",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    eventHubs: status,
    topics: {
      input: process.env.KAFKA_TOPIC_INJECTION || "injection-topic",
      validOutput: process.env.KAFKA_TOPIC_VALID_ROWS || "valid-row-topic",
      invalidOutput: process.env.KAFKA_TOPIC_INVALID_ROWS || "invalid-row-topic",
      progressOutput: process.env.KAFKA_TOPIC_PROGRESS || "progress-topic",
    },
  });
});

// Graceful shutdown handling
process.on("SIGINT", async () => {
  console.log("Received SIGINT, shutting down gracefully...");
  await stopEventHubConsumer();
  await closeEventHubProducer(validRowsProducer);
  await closeEventHubProducer(progressProducer);
  await closeDatabasePool(databasePool);
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Received SIGTERM, shutting down gracefully...");
  await stopEventHubConsumer();
  await closeEventHubProducer(validRowsProducer);
  await closeEventHubProducer(progressProducer);
  await closeDatabasePool(databasePool);
  process.exit(0);
});

// Error handling
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Start the application
const main = async (): Promise<void> => {
  try {
    console.log("Starting Validation Service Container App...");
    
    console.log("Environment variables:", {
      KAFKA_BOOTSTRAP_SERVERS: process.env.KAFKA_BOOTSTRAP_SERVERS,
      KAFKA_TOPIC_INJECTION: process.env.KAFKA_TOPIC_INJECTION,
      AZURE_STORAGE_CONNECTION_STRING: process.env.AZURE_STORAGE_CONNECTION_STRING ? "***SET***" : "***NOT SET***",
      AZURE_STORAGE_CONTAINER_NAME: process.env.AZURE_STORAGE_CONTAINER_NAME,
      POSTGRES_HOST: process.env.POSTGRES_HOST,
      NODE_ENV: process.env.NODE_ENV,
    });

    await initializeValidationService();
    await startEventHubConsumer();

    app.listen(port, () => {
      console.log(`Validation Service running on port ${port}`);
      console.log(`Health check available at: http://localhost:${port}/health`);
      console.log(`Status available at: http://localhost:${port}/status`);
    });
  } catch (error) {
    console.error("Failed to start Validation Service:", error);
    process.exit(1);
  }
};

main();
