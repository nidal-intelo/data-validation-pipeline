import csvParser from 'csv-parser';
import { Readable } from 'stream';
import { logInfo, logError } from './logger';

/**
 * Clean and normalize CSV data
 * Pure function that cleans malformed CSV data
 */
export const cleanCSVData = (data: any): any => {
    const cleanedRows: any[] = [];
    const expectedColumns = data.headers.length;
    
    for (const row of data.rows) {
        const rowKeys = Object.keys(row.data);
        
        // If row has fewer columns than expected, pad with empty values
        if (rowKeys.length < expectedColumns) {
            const cleanedData = { ...row.data };
            for (let i = rowKeys.length; i < expectedColumns; i++) {
                cleanedData[`column_${i}`] = '';
            }
            cleanedRows.push({
                ...row,
                data: cleanedData
            });
        }
        // If row has more columns than expected, truncate
        else if (rowKeys.length > expectedColumns) {
            const cleanedData: any = {};
            for (let i = 0; i < expectedColumns; i++) {
                const key = rowKeys[i];
                cleanedData[key] = row.data[key] || '';
            }
            cleanedRows.push({
                ...row,
                data: cleanedData
            });
        }
        // Row is fine as is
        else {
            cleanedRows.push(row);
        }
    }
    
    return {
        ...data,
        rows: cleanedRows
    };
};

/**
 * Parse CSV data from buffer
 * Pure function that parses CSV data
 */
export const parseCSVFromBuffer = (buffer: Buffer): Promise<{ success: boolean; data?: any; error?: string }> => {
    return new Promise((resolve) => {
        const rows: any[] = [];
        let headers: string[] = [];
        let rowNumber = 0;
        
        const stream = Readable.from(buffer.toString());
        
        stream
            .pipe(csvParser())
            .on('headers', (headerList: string[]) => {
                headers = headerList;
                logInfo('CSV headers detected', { headers: headerList });
            })
            .on('data', (data: any) => {
                rowNumber++;
                const rawLine = Object.values(data).join(',');
                rows.push({
                    rowNumber,
                    data,
                    rawLine
                });
            })
            .on('end', () => {
                logInfo('CSV parsing completed', {
                    totalRows: rows.length,
                    headers: headers.length
                });
                
                const parsedData = {
                    headers,
                    rows,
                    totalrows: rows.length,
                    mimetype: 'text/csv'
                };
                
                // Clean the data to handle inconsistencies
                const cleanedData = cleanCSVData(parsedData);
                resolve({
                    success: true,
                    data: cleanedData
                });
            })
            .on('error', (error: any) => {
                logError('CSV parsing failed', error);
                resolve({
                    success: false,
                    error: error.message
                });
            });
    });
};

/**
 * Detect file type from buffer
 * Pure function that detects file type
 */
export const detectFileType = (buffer: Buffer, filename: string): string => {
    const extension = filename.toLowerCase().split('.').pop();
    
    switch (extension) {
        case 'csv':
            return 'text/csv';
        case 'json':
            return 'application/json';
        case 'xml':
            return 'application/xml';
        case 'txt':
            return 'text/plain';
        default:
            // Try to detect from content
            const content = buffer.toString('utf8', 0, Math.min(1024, buffer.length));
            if (content.includes(',') && content.includes('\n')) {
                return 'text/csv';
            }
            if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
                return 'application/json';
            }
            if (content.trim().startsWith('<')) {
                return 'application/xml';
            }
            return 'application/octet-stream';
    }
};

/**
 * Validate CSV structure
 * Pure function that validates CSV structure
 */
export const validateCSVStructure = (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!data.headers || data.headers.length === 0) {
        errors.push('CSV file has no headers');
    }
    
    if (data.rows.length === 0) {
        errors.push('CSV file has no data rows');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Get file statistics
 * Pure function that calculates file statistics
 */
export const getFileStats = (data: any): {
    totalRows: number;
    totalColumns: number;
    averageRowLength: number;
    emptyRows: number;
    duplicateHeaders: string[];
} => {
    const totalRows = data.rows.length;
    const totalColumns = data.headers.length;
    const rowLengths = data.rows.map((row: any) => row.rawLine.length);
    const averageRowLength = rowLengths.length > 0
        ? rowLengths.reduce((sum: number, length: number) => sum + length, 0) / rowLengths.length
        : 0;
    
    const emptyRows = data.rows.filter((row: any) => 
        Object.values(row.data).every((value: any) => !value || value.trim() === '')
    ).length;
    
    // Find duplicate headers
    const headerCounts = data.headers.reduce((counts: any, header: string) => {
        counts[header] = (counts[header] || 0) + 1;
        return counts;
    }, {});
    
    const duplicateHeaders = Object.entries(headerCounts)
        .filter(([_, count]) => (count as number) > 1)
        .map(([header, _]) => header);
    
    return {
        totalRows,
        totalColumns,
        averageRowLength,
        emptyRows,
        duplicateHeaders
    };
};
