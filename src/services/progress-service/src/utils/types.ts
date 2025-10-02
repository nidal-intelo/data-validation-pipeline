export interface KafkaMessage {
    key?: string;
    value?: Buffer;
    headers?: Record<string, string>;
    partition?: number;
    offset?: string;
    timestamp?: string;
}

export interface ProgressUpdate {
    jobId: string;
    serviceName: string;
    processedCount: number;
}

export interface ProgressState {
    jobId: string;
    lastPercentage: number;
    totalRows: number;
    currentProcessed: number;
    serviceName: string;
    lastUpdated: Date;
}

export interface ProgressCalculationResult {
    percentage: number;
    shouldNotify: boolean;
    isComplete: boolean;
}

export interface UploadSession {
    id: string;
    orgId: string;
    sourceId: string;
    fileName: string;
    timestamp: number;
    totalRows?: number;
    validRows?: number;
    invalidRows?: number;
    mimeType?: string;
    fileProcessingStatus: 'pending' | 'processing' | 'completed' | 'failed';
    validationStatus: 'pending' | 'processing' | 'completed' | 'failed';
    transformationStatus: 'pending' | 'processing' | 'completed' | 'failed';
    overallStatus: 'pending' | 'processing' | 'completed' | 'failed';
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
}

export interface ProgressNotification {
    jobId: string;
    serviceName: string;
    percentage: number;
    processedCount: number;
    totalRows: number;
    isComplete: boolean;
    timestamp: Date;
}

export interface ServiceProgress {
    serviceName: string;
    percentage: number;
    processedCount: number;
    totalRows: number;
    isComplete: boolean;
}

export interface JobProgress {
    jobId: string;
    overallPercentage: number;
    services: ServiceProgress[];
    isComplete: boolean;
    lastUpdated: Date;
}

export interface DatabaseConfig {
    host: string;
    database: string;
    user: string;
    password: string;
    port: number;
    ssl: boolean;
    max: number;
    idleTimeoutMillis: number;
    connectionTimeoutMillis: number;
}

export interface DatabaseResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}
