export interface DataChunk {
    jobId: string;
    orgId: string;
    sourceId: string;
    chunkNumber: number;
    rows: DataRow[];
}

export interface DataRow {
    rowNumber: number;
    fields: Record<string, string>;
    rawData: string;
}

export interface ValidationResult {
    success: boolean;
    processedRows: number;
    validRows: number;
    invalidRows: number;
    errors: string[];
}

export interface SchemaField {
    name: string;
    type: string;
    validation: Record<string, any>;
    nullable: boolean;
}

export interface SchemaDefinition {
    id: string;
    orgId: string;
    label: string;
    schema: {
        type: string;
        fields: SchemaField[];
    };
    createdDate: string;
    updatedDate: string;
}

export interface ValidationError {
    fieldName: string;
    errorCode: string;
    errorMessage: string;
    expectedFormat?: string;
    actualValue?: string;
    validationRule?: string;
}

export interface RowValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

export interface ValidRowMessage {
    jobId: string;
    orgId: string;
    sourceId: string;
    validRow: DataRow;
}

export interface InvalidRowMessage {
    jobId: string;
    orgId: string;
    sourceId: string;
    originalRow: DataRow;
    errors: ValidationError[];
}

export interface ProgressTracker {
    processedRows: number;
    validRows: number;
    invalidRows: number;
    totalChunks: number;
    processedChunks: number;
    totalRows: number;
    isComplete: boolean;
    receivedChunks: Set<number>;
    expectedChunks: number;
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
