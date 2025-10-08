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
    kafkaTopicProgress: string;
    postgresHost: string;
    postgresDatabase: string;
    postgresClientId: string;
    postgresClientSecret: string;
    firebaseServiceAccount: string;
    firebaseProjectId: string;
    nodeEnv: string;
} => {
    const requiredEnvVars = [
        'KAFKA_BOOTSTRAP_SERVERS',
        'KAFKA_TOPIC_PROGRESS',
        'POSTGRES_HOST',
        'POSTGRES_DATABASE',
        'POSTGRES_CLIENT_ID',
        'DATABRICKS_OAUTH_TOKEN',
        'FIREBASE_SERVICE_ACCOUNT',
        'FIREBASE_PROJECT_ID'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Decode Firebase service account from base64
    const firebaseServiceAccount = Buffer.from(
        process.env.FIREBASE_SERVICE_ACCOUNT!,
        'base64'
    ).toString('utf-8');

    return {
        kafkaBootstrapServers: process.env.KAFKA_BOOTSTRAP_SERVERS!,
        kafkaTopicProgress: process.env.KAFKA_TOPIC_PROGRESS!,
        postgresHost: process.env.POSTGRES_HOST!,
        postgresDatabase: process.env.POSTGRES_DATABASE!,
        postgresClientId: process.env.POSTGRES_CLIENT_ID!,
        postgresClientSecret: process.env.DATABRICKS_OAUTH_TOKEN!,
        firebaseServiceAccount: firebaseServiceAccount,
        firebaseProjectId: process.env.FIREBASE_PROJECT_ID!,
        nodeEnv: process.env.NODE_ENV || 'development'
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
        return true;
    });
};