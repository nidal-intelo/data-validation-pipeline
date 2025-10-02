import { logInfo, logError } from '../utils/logger';

/**
 * Create data chunks from parsed CSV data
 * Pure function that creates chunks from parsed data
 */
export const createDataChunks = (parsedData: any, pathComponents: any, sessionId: string, chunkSize: number = 100) => {
    try {
        logInfo('Starting chunking process', {
            totalrows: parsedData.totalrows,
            chunkSize,
            sessionId
        });

        // Convert CSV rows to DataRow format
        const dataRows = parsedData.rows.map((row: any) => ({
            rowNumber: row.rowNumber,
            fields: row.data,
            rawData: row.rawLine
        }));

        // Create chunks
        const chunks: any[] = [];
        const totalChunks = Math.ceil(dataRows.length / chunkSize);

        for (let i = 0; i < totalChunks; i++) {
            const startIndex = i * chunkSize;
            const endIndex = Math.min(startIndex + chunkSize, dataRows.length);
            const chunkRows = dataRows.slice(startIndex, endIndex);

            const chunk = {
                jobId: sessionId,
                orgId: pathComponents.orgId,
                sourceId: pathComponents.sourceId,
                chunkNumber: i + 1,
                rows: chunkRows
            };

            chunks.push(chunk);
        }

        logInfo('Chunking completed', {
            totalChunks: chunks.length,
            totalRows: dataRows.length,
            sessionId
        });

        return {
            success: true,
            chunks,
            totalChunks: chunks.length
        };
    } catch (error) {
        logError('Chunking failed', error, {
            sessionId,
            totalrows: parsedData.totalrows,
            chunkSize
        });

        return {
            success: false,
            chunks: [],
            totalChunks: 0,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};

/**
 * Validate created chunks
 * Pure function that validates chunk structure
 */
export const validateChunks = (chunks: any[]) => {
    const errors: string[] = [];

    if (chunks.length === 0) {
        errors.push('No chunks created');
        return { isValid: false, errors };
    }

    // Check for consistent jobId, orgId, sourceId
    const firstChunk = chunks[0];
    const inconsistentChunks = chunks.filter(chunk => 
        chunk.jobId !== firstChunk.jobId ||
        chunk.orgId !== firstChunk.orgId ||
        chunk.sourceId !== firstChunk.sourceId
    );

    if (inconsistentChunks.length > 0) {
        errors.push(`Found ${inconsistentChunks.length} chunks with inconsistent metadata`);
    }

    // Check for sequential chunk numbers
    const chunkNumbers = chunks.map(chunk => chunk.chunkNumber).sort((a, b) => a - b);
    const expectedNumbers = Array.from({ length: chunks.length }, (_, i) => i + 1);
    const missingNumbers = expectedNumbers.filter(num => !chunkNumbers.includes(num));
    const duplicateNumbers = chunkNumbers.filter((num, index) => chunkNumbers.indexOf(num) !== index);

    if (missingNumbers.length > 0) {
        errors.push(`Missing chunk numbers: ${missingNumbers.join(', ')}`);
    }

    if (duplicateNumbers.length > 0) {
        errors.push(`Duplicate chunk numbers: ${duplicateNumbers.join(', ')}`);
    }

    // Check for empty chunks
    const emptyChunks = chunks.filter(chunk => chunk.rows.length === 0);
    if (emptyChunks.length > 0) {
        errors.push(`Found ${emptyChunks.length} empty chunks`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Get chunking statistics
 * Pure function that calculates chunking statistics
 */
export const getChunkingStats = (chunks: any[]) => {
    const totalChunks = chunks.length;
    const totalRows = chunks.reduce((sum, chunk) => sum + chunk.rows.length, 0);
    const rowsPerChunk = chunks.map(chunk => chunk.rows.length);
    const averageRowsPerChunk = totalRows / totalChunks;
    const minRowsPerChunk = Math.min(...rowsPerChunk);
    const maxRowsPerChunk = Math.max(...rowsPerChunk);
    const emptyChunks = chunks.filter(chunk => chunk.rows.length === 0).length;

    return {
        totalChunks,
        totalRows,
        averageRowsPerChunk,
        minRowsPerChunk,
        maxRowsPerChunk,
        emptyChunks
    };
};

/**
 * Create chunking summary
 * Pure function that creates a summary of chunking results
 */
export const createChunkingSummary = (chunks: any[]) => {
    const statistics = getChunkingStats(chunks);
    const validation = validateChunks(chunks);

    const summary = `Created ${statistics.totalChunks} chunks from ${statistics.totalRows} rows. ` +
        `Average ${statistics.averageRowsPerChunk.toFixed(1)} rows per chunk. ` +
        `Range: ${statistics.minRowsPerChunk}-${statistics.maxRowsPerChunk} rows per chunk. ` +
        `${statistics.emptyChunks} empty chunks. ` +
        `Validation: ${validation.isValid ? 'PASSED' : 'FAILED'}`;

    return {
        summary,
        statistics,
        validation
    };
};