import { BlobServiceClient, BlockBlobClient } from '@azure/storage-blob';
import { getEnvironmentConfig } from './environment';
import { logInfo, logError, logWarning } from './logger';

interface InvalidRowWriter {
    append(invalidRows: any[]): Promise<void>;
    finalize(): Promise<{ success: boolean; blobPath?: string; error?: string }>;
}

export function createInvalidRowWriter(
    orgId: string,
    sourceId: string,
    jobId: string
): InvalidRowWriter {
    const env = getEnvironmentConfig();
    const blobServiceClient = BlobServiceClient.fromConnectionString(env.dataStorageConnection);
    const containerClient = blobServiceClient.getContainerClient(env.dataStorageContainer);
    const blobPath = `${orgId}/${sourceId}/${jobId}/errors.csv`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
    
    let blockIds: string[] = [];
    let blockCounter = 0;
    let headerWritten = false;

    return {
        async append(invalidRows: any[]): Promise<void> {
            try {
                // Build CSV content
                let csvContent = '';
                
                // Write header only once
                if (!headerWritten) {
                    csvContent += 'Row Number,Field Name,Field Value,Error Type,Error Message,Expected Format\n';
                    headerWritten = true;
                }
                
                // Add error rows
                for (const invalidRow of invalidRows) {
                    const rowNumber = invalidRow.originalRow.rowNumber;
                    const fields = invalidRow.originalRow.fields;

                    const errors = Array.isArray(invalidRow.errors) ? invalidRow.errors : [];
                    
                    if (errors.length === 0) {
                        logWarning('Invalid row with no errors array', {
                            jobId: invalidRow.jobId,
                            rowNumber
                        });
                        continue;  // Skip this row
                    }

                    
                    for (const error of errors) {
                        const fieldName = error.field || 'Unknown';
                        const fieldValue = fields[fieldName] || '<empty>';
                        const errorType = mapErrorCode(error.code);
                        
                        csvContent += `${rowNumber},"${escapeCsv(fieldName)}","${escapeCsv(fieldValue)}","${errorType}","${error.message}","${error.expected || 'N/A'}"\n`;
                    }
                }
                
                // Upload as block
                const blockId = Buffer.from(`block-${blockCounter.toString().padStart(6, '0')}`).toString('base64');
                blockIds.push(blockId);
                blockCounter++;
                
                await blockBlobClient.stageBlock(blockId, csvContent, Buffer.byteLength(csvContent));
                
            } catch (error) {
                logError('Failed to append invalid rows', error, { orgId, sourceId, jobId });
                throw error;
            }
        },

        async finalize(): Promise<{ success: boolean; blobPath?: string; error?: string }> {
            try {
                if (blockIds.length === 0) {
                    // No invalid rows - don't create file
                    return { success: true };
                }
                
                // Commit all blocks
                await blockBlobClient.commitBlockList(blockIds, {
                    blobHTTPHeaders: {
                        blobContentType: 'text/csv'
                    }
                });
                
                logInfo('Invalid rows file finalized', {
                    orgId,
                    sourceId,
                    jobId,
                    blobPath,
                    blockCount: blockIds.length
                });
                
                return {
                    success: true,
                    blobPath: `invalid-rows/${blobPath}`
                };
            } catch (error) {
                logError('Failed to finalize invalid rows file', error, { orgId, sourceId, jobId });
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        }
    };
}

function mapErrorCode(code: string): string {
    const mapping: Record<string, string> = {
        'invalid_type': 'Missing Required Field',
        'invalid_string': 'Invalid Format',
        'too_small': 'Value Too Short',
        'too_big': 'Value Too Long'
    };
    return mapping[code] || 'Validation Error';
}

function escapeCsv(value: string): string {
    if (typeof value !== 'string') return String(value);
    return value.replace(/"/g, '""');
}