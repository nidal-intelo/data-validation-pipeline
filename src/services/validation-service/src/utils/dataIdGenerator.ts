import { logWarning, logDebug } from './logger';

/**
 * Generate dataId from unique columns in a row
 * Pure function that creates a composite key from specified fields
 */
export const generateDataId = (
    row: Record<string, string>,
    uniqueCols: string[],
    jobId: string
): string => {
    try {
        // Validate inputs
        if (!uniqueCols || uniqueCols.length === 0) {
            logWarning('No unique columns specified, falling back to rowNumber', {
                jobId
            });
            return '';
        }

        // Extract values from unique columns
        const uniqueValues: string[] = [];
        const missingCols: string[] = [];

        for (const colName of uniqueCols) {
            const value = row[colName];
            
            if (value === undefined || value === null || value === '') {
                missingCols.push(colName);
                uniqueValues.push(''); // Use empty string for missing values
            } else {
                // Sanitize value: trim whitespace, convert to string
                uniqueValues.push(String(value).trim());
            }
        }

        // Log warning if any unique columns are missing
        if (missingCols.length > 0) {
            logWarning('Missing values in unique columns for dataId generation', {
                jobId,
                missingCols,
                availableFields: Object.keys(row)
            });
        }

        // Join with underscore separator (configurable if needed)
        const dataId = uniqueValues.join('_');

        logDebug('Generated dataId', {
            jobId,
            uniqueCols,
            dataId,
            uniqueValues
        });

        return dataId;
    } catch (error) {
        logWarning('Failed to generate dataId, using empty string', {
            jobId,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return '';
    }
};

/**
 * Validate that required unique columns exist in schema
 * Pure function that checks schema structure
 */
export const validateUniqueColumns = (
    schema: any,
    uniqueCols: string[]
): { isValid: boolean; missingColumns: string[] } => {
    if (!uniqueCols || uniqueCols.length === 0) {
        return { isValid: false, missingColumns: [] };
    }

    const schemaFields = schema?.schema?.properties 
        ? Object.keys(schema.schema.properties)
        : [];

    const missingColumns = uniqueCols.filter(col => !schemaFields.includes(col));

    return {
        isValid: missingColumns.length === 0,
        missingColumns
    };
};

/**
 * Extract unique columns from schema definition
 * Pure function that extracts uniquecols array from schema
 */
export const extractUniqueColumns = (schema: any): string[] => {
    // uniquecols is typically at the root level of schema object
    if (schema?.uniquecols && Array.isArray(schema.uniquecols)) {
        return schema.uniquecols;
    }

    // Fallback: check if it's nested in schema property
    if (schema?.schema?.uniquecols && Array.isArray(schema.schema.uniquecols)) {
        return schema.schema.uniquecols;
    }

    logWarning('No uniquecols found in schema', {
        schemaId: schema?.id,
        availableKeys: Object.keys(schema || {})
    });

    return [];
};

/**
 * Generate dataId with fallback strategies
 * Pure function that generates dataId with multiple fallback options
 */
export const generateDataIdWithFallback = (
    row: Record<string, string>,
    schema: any,
    jobId: string,
    rowNumber: number
): string => {
    // Extract unique columns from schema
    const uniqueCols = extractUniqueColumns(schema);

    // Strategy 1: Use uniquecols if available
    if (uniqueCols.length > 0) {
        const dataId = generateDataId(row, uniqueCols, jobId);
        if (dataId && dataId.length > 0) {
            return dataId;
        }
    }

    // Strategy 2: Fallback to jobId + rowNumber
    logWarning('Falling back to jobId_rowNumber for dataId', {
        jobId,
        rowNumber,
        reason: 'No unique columns or generation failed'
    });

    return `${jobId}_${rowNumber}`;
};