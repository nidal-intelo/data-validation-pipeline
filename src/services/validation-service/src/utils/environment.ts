/**
 * Environment configuration utilities
 * Pure functions for environment variable management
 */

/**
 * Get environment configuration
 * Pure function that returns environment variables
 */
export const getEnvironmentConfig = (): {
    kafkaBootstrapServers: string;
    kafkaTopicInjection: string;
    kafkaTopicValidRows: string;
    kafkaTopicInvalidRows: string;
    kafkaTopicProgress: string;
    postgresHost: string;
    postgresDatabase: string;
    postgresClientId: string;
    postgresClientSecret: string;
    validationDbBatchSize: number;
    validationMaxAccumulatedRows: number;
    nodeEnv: string;
    azureStorageConnectionString: string;
    azureStorageContainerName: string;
    dataStorageConnection: string;
    dataStorageContainer: string;
} => {
    const requiredEnvVars = [
        'KAFKA_BOOTSTRAP_SERVERS',
        'KAFKA_TOPIC_INJECTION',
        'KAFKA_TOPIC_VALID_ROWS',
        'KAFKA_TOPIC_INVALID_ROWS',
        'KAFKA_TOPIC_PROGRESS',
        'POSTGRES_HOST',
        'POSTGRES_DATABASE',
        'POSTGRES_CLIENT_ID',
        'DATABRICKS_OAUTH_TOKEN',
        'AZURE_STORAGE_CONNECTION_STRING',
        'AZURE_STORAGE_CONTAINER_NAME',
        'DATA_STORAGE_CONNECTION',
        'DATA_STORAGE_CONTAINER'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    return {
        kafkaBootstrapServers: process.env.KAFKA_BOOTSTRAP_SERVERS!,
        kafkaTopicInjection: process.env.KAFKA_TOPIC_INJECTION!,
        kafkaTopicValidRows: process.env.KAFKA_TOPIC_VALID_ROWS!,
        kafkaTopicInvalidRows: process.env.KAFKA_TOPIC_INVALID_ROWS!,
        kafkaTopicProgress: process.env.KAFKA_TOPIC_PROGRESS!,
        postgresHost: process.env.POSTGRES_HOST!,
        postgresDatabase: process.env.POSTGRES_DATABASE!,
        postgresClientId: process.env.POSTGRES_CLIENT_ID!,
        postgresClientSecret: process.env.DATABRICKS_OAUTH_TOKEN!,
        validationDbBatchSize: parseInt(process.env.VALIDATION_DB_BATCH_SIZE || '10', 10),
        validationMaxAccumulatedRows: parseInt(process.env.VALIDATION_MAX_ACCUMULATED_ROWS || '1000', 10),
        nodeEnv: process.env.NODE_ENV || 'development',
        azureStorageConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING!,
        azureStorageContainerName: process.env.AZURE_STORAGE_CONTAINER_NAME!,
        dataStorageConnection: process.env.DATA_STORAGE_CONNECTION!,
        dataStorageContainer: process.env.DATA_STORAGE_CONTAINER!
    };
};

/**
 * Validate environment configuration
 * Pure function that validates environment setup
 */
export const validateEnvironment = (config: any): boolean => {
    return Object.values(config).every(value => {
        if (typeof value === 'string') {
            return value && value.length > 0;
        }
        if (typeof value === 'number') {
            return value > 0;
        }
        return true;
    });
};
