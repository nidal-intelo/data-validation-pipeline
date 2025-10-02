import { createDatabasePool, createDatabaseConfig, updateUploadSession, getUploadSession, createUploadSession, closeDatabasePool } from '../utils/database';
import { createBlobServiceClient, downloadBlob } from './blobService';
import { parseCSVFromBuffer, validateCSVStructure } from '../utils/dataParser';
import { createDataChunks, validateChunks, getChunkingStats, createChunkingSummary } from './chunkingService';
import { createEventHubProducer, sendChunksToEventHub, closeEventHubProducer } from './eventhubs';
import { logInfo, logError } from '../utils/logger';

/**
 * Process file upload - main orchestration function
 * Pure function that orchestrates the entire file processing pipeline
 */
export const processFileUpload = async (pathComponents: any, timestamp: number, context: any) => {
    const pool = createDatabasePool(createDatabaseConfig());
    const blobServiceClient = createBlobServiceClient();
    const eventHubProducer = createEventHubProducer();

    try {
        logInfo('Starting file processing', {
            filename: pathComponents.filename,
            orgId: pathComponents.orgId,
            sourceId: pathComponents.sourceId,
            timestamp
        });

        // Check for existing session or create new one
        const sessionResult = await handleUploadSession(pool, pathComponents, timestamp);
        if (!sessionResult.success || !sessionResult.sessionId) {
            throw new Error(`Session handling failed: ${sessionResult.error}`);
        }
        const sessionId = sessionResult.sessionId;

        // Download and parse file
        const parseResult = await downloadAndParseFile(blobServiceClient, pathComponents);
        if (!parseResult.success || !parseResult.data) {
            throw new Error(`File parsing failed: ${parseResult.error}`);
        }
        const parsedData = parseResult.data;

        // Validate CSV structure
        const validation = validateCSVStructure(parsedData);
        if (!validation.isValid) {
            throw new Error(`CSV validation failed: ${validation.errors.join(', ')}`);
        }

        // Update session with file information
        await updateUploadSession(pool, sessionId, {
            totalrows: parsedData.totalrows,
            mimetype: parsedData.mimetype,
            fileprocessingstatus: 'completed'
        });

        // Create chunks
        const chunkingResult = createDataChunks(parsedData, pathComponents, sessionId, 100);
        if (!chunkingResult.success) {
            throw new Error(`Chunking failed: ${chunkingResult.error}`);
        }

        // Validate chunks
        const chunkValidation = validateChunks(chunkingResult.chunks);
        if (!chunkValidation.isValid) {
            throw new Error(`Chunk validation failed: ${chunkValidation.errors.join(', ')}`);
        }

        // Log chunking statistics
        const stats = getChunkingStats(chunkingResult.chunks);
        const summary = createChunkingSummary(chunkingResult.chunks);
        logInfo('Chunking statistics', stats);
        logInfo('Chunking summary', { summary: summary.summary });

        // Send chunks to EventHub
        const eventHubResult = await sendChunksToEventHub(eventHubProducer, chunkingResult.chunks);
        if (!eventHubResult.success) {
            throw new Error(`EventHub sending failed: ${eventHubResult.errors.join(', ')}`);
        }

        logInfo('File processing completed successfully', {
            totalrows: parsedData.totalrows,
            totalChunks: chunkingResult.totalChunks,
            sentCount: eventHubResult.sentCount,
            failedCount: eventHubResult.failedCount
        });

        return {
            success: true,
            totalrows: parsedData.totalrows,
            chunks: chunkingResult.totalChunks
        };
    } catch (error) {
        logError('File processing failed', error, {
            filename: pathComponents.filename,
            orgId: pathComponents.orgId,
            sourceId: pathComponents.sourceId
        });

        return {
            success: false,
            totalrows: 0,
            chunks: 0,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    } finally {
        // Clean up resources
        await closeDatabasePool(pool);
        await closeEventHubProducer(eventHubProducer);
    }
};

/**
 * Handle upload session (check existing or create new)
 * Pure function that manages upload sessions
 */
const handleUploadSession = async (pool: any, pathComponents: any, timestamp: number) => {
    try {
        // Check for existing session
        const existingSession = await getUploadSession(pool, pathComponents.orgId, pathComponents.sourceId, timestamp);
        
        if (existingSession.success && existingSession.data) {
            logInfo('Found existing upload session', {
                sessionId: existingSession.data.id,
                status: existingSession.data.overallstatus
            });

            // Update session to processing status
            const updateResult = await updateUploadSession(pool, existingSession.data.id, {
                fileprocessingstatus: 'processing',
                overallstatus: 'processing'
            });

            if (!updateResult.success) {
                return {
                    success: false,
                    error: `Failed to update existing session: ${updateResult.error}`
                };
            }

            return {
                success: true,
                sessionId: existingSession.data.id
            };
        } else {
            // Create new session
            const newSession = await createUploadSession(pool, {
                orgid: pathComponents.orgId,
                sourceid: pathComponents.sourceId,
                filename: pathComponents.filename,
                timestamp,
                totalrows: 0,
                validrows: 0,
                invalidrows: 0,
                fileprocessingstatus: 'processing',
                validationstatus: 'pending',
                transformationstatus: 'pending',
                overallstatus: 'processing',
                mimetype: undefined
            });

            if (!newSession.success || !newSession.data) {
                return {
                    success: false,
                    error: `Failed to create new session: ${newSession.error}`
                };
            }

            logInfo('Created new upload session', {
                sessionId: newSession.data.id
            });

            return {
                success: true,
                sessionId: newSession.data.id
            };
        }
    } catch (error) {
        logError('Session handling failed', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};

/**
 * Download and parse file from blob storage
 * Pure function that downloads and parses files
 */
const downloadAndParseFile = async (blobServiceClient: any, pathComponents: any) => {
    try {
        // Download blob
        const downloadResult = await downloadBlob(blobServiceClient, pathComponents);
        if (!downloadResult.success || !downloadResult.data) {
            return {
                success: false,
                error: `Download failed: ${downloadResult.error}`
            };
        }

        // Parse CSV from buffer
        const parseResult = await parseCSVFromBuffer(downloadResult.data);
        if (!parseResult.success || !parseResult.data) {
            return {
                success: false,
                error: `Parsing failed: ${parseResult.error}`
            };
        }

        return {
            success: true,
            data: parseResult.data
        };
    } catch (error) {
        logError('File download and parsing failed', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};
