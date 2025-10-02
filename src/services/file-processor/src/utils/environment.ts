/**
 * Environment configuration utilities
 * Pure functions for environment variable management
 */

/**
 * Get environment configuration
 * Pure function that returns environment variables
 */
export const getEnvironmentConfig = (): {
    postgresHost: string;
    postgresDatabase: string;
    postgresClientId: string;
    postgresClientSecret: string;
    dataStorageConnection: string;
    dataStorageContainer: string;
    kafkaBootstrapServers: string;
    kafkaTopicInjection: string;
} => {
    const requiredEnvVars = [
        'POSTGRES_HOST',
        'POSTGRES_DATABASE',
        'POSTGRES_CLIENT_ID',
        'DATA_STORAGE_CONNECTION',
        'DATA_STORAGE_CONTAINER',
        'KAFKA_BOOTSTRAP_SERVERS',
        'DATABRICKS_OAUTH_TOKEN',
        'KAFKA_TOPIC_INJECTION'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    return {
        postgresHost: process.env.POSTGRES_HOST!,
        postgresDatabase: process.env.POSTGRES_DATABASE!,
        postgresClientId: process.env.POSTGRES_CLIENT_ID!,
        postgresClientSecret: process.env.DATABRICKS_OAUTH_TOKEN!,
        dataStorageConnection: process.env.DATA_STORAGE_CONNECTION!,
        dataStorageContainer: process.env.DATA_STORAGE_CONTAINER!,
        kafkaBootstrapServers: process.env.KAFKA_BOOTSTRAP_SERVERS!,
        kafkaTopicInjection: process.env.KAFKA_TOPIC_INJECTION!
    };
};

/**
 * Validate environment configuration
 * Pure function that validates environment setup
 */
export const validateEnvironment = (config: any): boolean => {
    return Object.values(config).every(value => value && (typeof value === 'string' ? value.length > 0 : true));
};
