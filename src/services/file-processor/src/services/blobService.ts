import { BlobServiceClient } from '@azure/storage-blob';
import { getEnvironmentConfig } from '../utils/environment';
import { logInfo, logError } from '../utils/logger';

/**
 * Create blob service client
 * Pure function that creates a blob service client
 */
export const createBlobServiceClient = () => {
    const env = getEnvironmentConfig();
    return BlobServiceClient.fromConnectionString(env.dataStorageConnection);
};

/**
 * Download blob from storage
 * Pure function that downloads a blob
 */
export const downloadBlob = async (blobServiceClient: BlobServiceClient, pathComponents: any) => {
    try {
        const containerName = getEnvironmentConfig().dataStorageContainer;
        const blobPath = `${pathComponents.orgId}/${pathComponents.sourceId}/${pathComponents.timestamp}/${pathComponents.filename}`;

        logInfo('Downloading blob', {
            containerName,
            blobPath,
            filename: pathComponents.filename
        });

        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blobClient = containerClient.getBlobClient(blobPath);
        const downloadResponse = await blobClient.download();

        if (!downloadResponse.readableStreamBody) {
            return {
                success: false,
                error: 'No readable stream body in download response'
            };
        }

        const chunks: Buffer[] = [];
        for await (const chunk of downloadResponse.readableStreamBody) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }

        const buffer = Buffer.concat(chunks);

        logInfo('Blob downloaded successfully', {
            filename: pathComponents.filename,
            size: buffer.length
        });

        return {
            success: true,
            data: buffer
        };  
    } catch (error) {
        logError('Failed to download blob', error, {
            filename: pathComponents.filename,
            orgId: pathComponents.orgId,
            sourceId: pathComponents.sourceId
        });

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};

/**
 * Get blob properties
 * Pure function that gets blob properties
 */
export const getBlobProperties = async (blobServiceClient: BlobServiceClient, pathComponents: any) => {
    try {
        const containerName = getEnvironmentConfig().dataStorageContainer;
        const blobPath = `${pathComponents.orgId}/${pathComponents.sourceId}/${pathComponents.timestamp}/${pathComponents.filename}`;

        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blobClient = containerClient.getBlobClient(blobPath);
        const properties = await blobClient.getProperties();

        return {
            success: true,
            properties: {
                contentType: properties.contentType,
                contentLength: properties.contentLength,
                lastModified: properties.lastModified,
                etag: properties.etag
            }
        };
    } catch (error) {
        logError('Failed to get blob properties', error, {
            filename: pathComponents.filename
        });

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};