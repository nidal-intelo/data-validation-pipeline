export interface BlobPathComponents {
    orgId: string;
    sourceId: string;
    timestamp: string;
    filename: string;
}

export interface UploadSession {
    id: string;
    orgid: string;
    sourceid: string;
    filename: string;
    timestamp: number;
    totalrows: number;
    validrows: number;
    invalidrows: number;
    mimetype?: string;
    fileprocessingstatus: ProcessingStatus;
    validationstatus: ProcessingStatus;
    transformationstatus: ProcessingStatus;
    overallstatus: ProcessingStatus;
    createdat: Date;
    updatedat: Date;
    completedat?: Date;
}

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface DataRow {
    rowNumber: number;
    fields: Record<string, string>;
    rawData: string;
}

export interface DataChunk {
    jobId: string;
    orgId: string;
    sourceId: string;
    chunkNumber: number;
    rows: DataRow[];
}

export interface ParsedData {
    headers: string[];
    rows: DataRow[];
    totalRows: number;
    mimeType: string;
}

export interface Result<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface DataParseResult extends Result<ParsedData> {}

export interface ChunkingResult extends Result<{
    chunks: DataChunk[];
    totalChunks: number;
}> {}

export interface EventHubSendResult extends Result<{
    sentBatchCount: number;
    sentChunkCount: number;
    failedCount: number;
}> {
    errors?: string[];
}

export interface SessionResult extends Result<UploadSession> {}

export interface SchemaResult extends Result<SchemaDefinition> {}
export interface JobMetadata {
    jobId: string;
    orgId: string;
    sourceId: string;
    totalChunks: number;
    totalRows: number;
    filename: string;
    timestamp: number;
    schema?: SchemaDefinition;
}

export interface SchemaDefinition {
    id: string;
    orgId: string;
    label: string;
    schema: any; // JSON Schema object
    createdDate: Date;
    updatedDate: Date;
}

export interface EventHubsConfig {
    connectionString: string;
    eventHubName: string;
}

export interface ProcessingResult {
    success: boolean;
    totalRows: number;
    chunks: number;
    error?: string;
}