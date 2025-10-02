import { InvocationContext } from '@azure/functions';
import { logError } from '../utils/logger';
import { processFileUpload } from '../services/fileProcessor';

/**
 * Main data trigger function handler
 * Pure function that handles EventGrid triggers
 */
export const dataTrigger = async (event: any, context: InvocationContext): Promise<any> => {
    context.log('File Processor triggered via EventGrid!');
    try {
        context.log('EventGrid event:', JSON.stringify(event, null, 2));
        
        if (!event || !event.data || !event.data.url) {
            throw new Error('EventGrid event data is not available or missing URL');
        }

        // Parse blob URL to extract path components
        const blobUrl = event.data.url;
        context.log(`Processing blob URL: ${blobUrl}`);
        
        const pathComponents = extractBlobPathComponents(blobUrl);
        context.log(`Processing file: ${pathComponents.filename}`);

        // Validate path components
        validateBlobPathComponents(pathComponents);

        // Convert timestamp to number
        const timestampNumber = parseTimestamp(pathComponents.timestamp);
        context.log(`Converted timestamp: ${timestampNumber}`);

        // Process the file upload
        const result = await processFileUpload(pathComponents, timestampNumber, context);
        context.log('File processing completed successfully!', result);
        
        return result;
    } catch (error) {
        context.log('Error processing file:', error);
        logError('File processing failed', error);
        throw error;
    }
};

/**
 * Extract blob path components from URL
 * Pure function that parses blob URL
 */
const extractBlobPathComponents = (blobUrl: string) => {
    const urlParts = blobUrl.split('/');
    const containerIndex = urlParts.findIndex(part => part === 'file-processor-input');
    
    if (containerIndex === -1 || containerIndex + 4 >= urlParts.length) {
        throw new Error(`Invalid blob URL format. Expected: .../file-processor-input/orgId/sourceId/timestamp/filename, got: ${blobUrl}`);
    }

    return {
        orgId: urlParts[containerIndex + 1],
        sourceId: urlParts[containerIndex + 2],
        timestamp: urlParts[containerIndex + 3],
        filename: urlParts[containerIndex + 4]
    };
};

/**
 * Validate blob path components
 * Pure function that validates path components
 */
const validateBlobPathComponents = (pathComponents: any) => {
    if (!pathComponents.orgId || !pathComponents.sourceId || !pathComponents.timestamp || !pathComponents.filename) {
        throw new Error('Invalid blob path: missing required components');
    }
};

/**
 * Parse timestamp string to number
 * Pure function that converts timestamp
 */
const parseTimestamp = (timestampString: string): number => {
    const cleaned = timestampString.replace('_', '');
    const timestampNumber = parseInt(cleaned, 10);
    
    if (isNaN(timestampNumber)) {
        throw new Error(`Invalid timestamp: ${timestampString}`);
    }
    
    return timestampNumber;
};
