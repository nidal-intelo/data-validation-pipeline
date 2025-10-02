/**
 * ValidationService class
 * Pure class for validation operations
 */
export class ValidationService {
    private schemaCache: Map<string, any>;

    constructor() {
        this.schemaCache = new Map();
    }

    /**
     * Validate a single data row against a schema definition
     */
    validateRow(row: any, schema: any): { isValid: boolean; errors: any[] } {
        const errors: any[] = [];
        
        // Create a map of schema fields for quick lookup
        const schemaFieldsMap = new Map();
        schema.schema.fields.forEach((field: any) => {
            schemaFieldsMap.set(field.name, field);
        });

        // Validate each field in the row
        for (const [fieldName, fieldValue] of Object.entries(row.fields)) {
            const schemaField = schemaFieldsMap.get(fieldName);
            if (!schemaField) {
                // Field exists in data but not in schema - this might be acceptable
                // depending on business rules, but we'll log it as a warning
                continue;
            }
            
            const fieldErrors = this.validateField(fieldName, fieldValue, schemaField);
            errors.push(...fieldErrors);
        }

        // Check for required fields that are missing
        for (const schemaField of schema.schema.fields) {
            if (!schemaField.nullable && !(schemaField.name in row.fields)) {
                errors.push({
                    fieldName: schemaField.name,
                    errorCode: 'MISSING_REQUIRED_FIELD',
                    errorMessage: `Required field '${schemaField.name}' is missing`,
                    validationRule: 'nullable: false'
                });
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate a single field against its schema definition
     */
    validateField(fieldName: string, value: any, schemaField: any): any[] {
        const errors: any[] = [];
        
        // Check if value is null/empty
        const isEmpty = !value || value.trim() === '';
        if (isEmpty) {
            if (!schemaField.nullable) {
                errors.push({
                    fieldName,
                    errorCode: 'NULL_VALUE_NOT_ALLOWED',
                    errorMessage: `Field '${fieldName}' cannot be null or empty`,
                    actualValue: value || 'null',
                    validationRule: 'nullable: false'
                });
            }
            // If nullable, we can skip other validations for empty values
            return errors;
        }

        // Validate data type
        const typeValidationError = this.validateDataType(fieldName, value, schemaField.type);
        if (typeValidationError) {
            errors.push(typeValidationError);
        }

        return errors;
    }

    /**
     * Validate data type for a field value
     */
    validateDataType(fieldName: string, value: string, expectedType: string): any | null {
        switch (expectedType.toLowerCase()) {
            case 'string':
                // String type is always valid (we already have a string)
                return null;
            case 'integer':
                if (!this.isValidInteger(value)) {
                    return {
                        fieldName,
                        errorCode: 'INVALID_INTEGER',
                        errorMessage: `Field '${fieldName}' must be a valid integer`,
                        actualValue: value,
                        expectedFormat: 'integer',
                        validationRule: 'type: integer'
                    };
                }
                break;
            case 'double':
            case 'float':
                if (!this.isValidFloat(value)) {
                    return {
                        fieldName,
                        errorCode: 'INVALID_FLOAT',
                        errorMessage: `Field '${fieldName}' must be a valid number`,
                        actualValue: value,
                        expectedFormat: 'number',
                        validationRule: `type: ${expectedType}`
                    };
                }
                break;
            case 'boolean':
                if (!this.isValidBoolean(value)) {
                    return {
                        fieldName,
                        errorCode: 'INVALID_BOOLEAN',
                        errorMessage: `Field '${fieldName}' must be a valid boolean (true/false, 1/0, yes/no)`,
                        actualValue: value,
                        expectedFormat: 'boolean',
                        validationRule: 'type: boolean'
                    };
                }
                break;
            case 'date':
                if (!this.isValidDate(value)) {
                    return {
                        fieldName,
                        errorCode: 'INVALID_DATE',
                        errorMessage: `Field '${fieldName}' must be a valid date`,
                        actualValue: value,
                        expectedFormat: 'date',
                        validationRule: 'type: date'
                    };
                }
                break;
            default:
                // For unknown types, we'll be permissive but log a warning
                console.warn(`Unknown data type '${expectedType}' for field '${fieldName}', skipping validation`);
                return null;
        }
        return null;
    }

    /**
     * Check if a string represents a valid integer
     */
    isValidInteger(value: string): boolean {
        const trimmed = value.trim();
        return /^-?\d+$/.test(trimmed) && !isNaN(parseInt(trimmed, 10));
    }

    /**
     * Check if a string represents a valid float/double
     */
    isValidFloat(value: string): boolean {
        const trimmed = value.trim();
        return /^-?\d*\.?\d+$/.test(trimmed) && !isNaN(parseFloat(trimmed));
    }

    /**
     * Check if a string represents a valid boolean
     */
    isValidBoolean(value: string): boolean {
        const trimmed = value.trim().toLowerCase();
        return ['true', 'false', '1', '0', 'yes', 'no', 'y', 'n'].includes(trimmed);
    }

    /**
     * Check if a string represents a valid date
     */
    isValidDate(value: string): boolean {
        const trimmed = value.trim();
        const date = new Date(trimmed);
        return !isNaN(date.getTime()) && date.toISOString().slice(0, 10) === trimmed;
    }

    /**
     * Cache a schema definition for performance
     */
    cacheSchema(key: string, schema: any): void {
        this.schemaCache.set(key, schema);
    }

    /**
     * Get a cached schema definition
     */
    getCachedSchema(key: string): any {
        return this.schemaCache.get(key);
    }

    /**
     * Clear the schema cache
     */
    clearCache(): void {
        this.schemaCache.clear();
    }
}
