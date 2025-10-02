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
    rows: Array<{
        rowNumber: number;
        data: Record<string, string>;
        rawLine: string;
    }>;
    totalrows: number;
    mimetype: string;
}

export interface PathComponents {
    filename: string;
    orgId: string;
    sourceId: string;
}

export interface UploadSession {
    id: string;
    orgid: string;
    sourceid: string;
    filename: string;
    timestamp: number;
    totalrows?: number;
    validrows?: number;
    invalidrows?: number;
    mimetype?: string;
    fileprocessingstatus: 'pending' | 'processing' | 'completed' | 'failed';
    validationstatus: 'pending' | 'processing' | 'completed' | 'failed';
    transformationstatus: 'pending' | 'processing' | 'completed' | 'failed';
    overallstatus: 'pending' | 'processing' | 'completed' | 'failed';
    createdat: Date;
    updatedat: Date;
    completedat?: Date;
}

export interface DatabaseResult<T> {
    success: boolean;
    data?: T;
    error?: string;
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

export interface FileStats {
    totalRows: number;
    totalColumns: number;
    averageRowLength: number;
    emptyRows: number;
    duplicateHeaders: string[];
}

export interface ChunkingStats {
    totalChunks: number;
    totalRows: number;
    averageChunkSize: number;
    largestChunk: number;
    smallestChunk: number;
}
