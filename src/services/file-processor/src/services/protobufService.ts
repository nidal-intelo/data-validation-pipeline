import { logInfo, logError } from '../utils/logger';
import * as generated from '../utils/generated.js';

/**
 * Serialize data chunk to protobuf format
 * Pure function that serializes data chunks using protobuf
 */
export const serializeDataChunk = (chunk: any) => {
    try {
        logInfo('Serializing data chunk with protobuf', {
            chunkNumber: chunk.chunkNumber,
            rowCount: chunk.rows.length,
            jobId: chunk.jobId
        });

        // Create protobuf DataChunk message
        const protobufDataChunk = generated.cfk_poc.pipeline.DataChunk.create({
            jobId: chunk.jobId,
            orgId: chunk.orgId,
            sourceId: chunk.sourceId,
            chunkNumber: chunk.chunkNumber,
            rows: chunk.rows.map((row: any) => ({
                rowNumber: row.rowNumber,
                fields: row.fields,
                rawData: row.rawData
            }))
        });

        // Encode to protobuf binary format
        const writer = generated.cfk_poc.pipeline.DataChunk.encode(protobufDataChunk);
        const buffer = Buffer.from(writer.finish());

        logInfo('Data chunk serialized successfully with protobuf', {
            chunkNumber: chunk.chunkNumber,
            serializedSize: buffer.length,
            protobufSize: buffer.length
        });

        return {
            success: true,
            data: buffer
        };
    } catch (error) {
        logError('Failed to serialize data chunk with protobuf', error, {
            chunkNumber: chunk.chunkNumber,
            jobId: chunk.jobId
        });

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};

/**
 * Serialize multiple data chunks
 * Pure function that serializes multiple chunks
 */
export const serializeDataChunks = (chunks: any[]) => {
    const serializedChunks: any[] = [];
    const errors: string[] = [];

    for (const chunk of chunks) {
        const result = serializeDataChunk(chunk);
        if (result.success && result.data) {
            serializedChunks.push(result.data);
        } else {
            errors.push(`Failed to serialize chunk ${chunk.chunkNumber}: ${result.error}`);
        }
    }

    return {
        success: errors.length === 0,
        serializedChunks,
        errors
    };
};

/**
 * Deserialize data chunk from protobuf format
 * Pure function that deserializes data chunks using protobuf
 */
export const deserializeDataChunk = (buffer: Buffer) => {
    try {
        logInfo('Deserializing data chunk with protobuf', {
            bufferSize: buffer.length
        });

        // Decode protobuf binary format
        const protobufDataChunk = generated.cfk_poc.pipeline.DataChunk.decode(buffer);
        const chunk = {
            jobId: protobufDataChunk.jobId,
            orgId: protobufDataChunk.orgId,
            sourceId: protobufDataChunk.sourceId,
            chunkNumber: protobufDataChunk.chunkNumber,
            rows: protobufDataChunk.rows.map((row: any) => ({
                rowNumber: row.rowNumber,
                fields: row.fields,
                rawData: row.rawData
            }))
        };

        logInfo('Data chunk deserialized successfully with protobuf', {
            chunkNumber: chunk.chunkNumber,
            rowCount: chunk.rows.length,
            jobId: chunk.jobId
        });

        return {
            success: true,
            chunk
        };
    } catch (error) {
        logError('Failed to deserialize data chunk with protobuf', error, {
            bufferSize: buffer.length
        });

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};