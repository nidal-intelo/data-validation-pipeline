import { logError } from './logger';

/**
 * Validate a single data row against a schema definition
 * Pure function that validates a row
 */
export const validateRow = (row: any, schema: any): { isValid: boolean; errors: any[] } => {
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
        
        const fieldErrors = validateField(fieldName, fieldValue, schemaField);
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
};

/**
 * Validate a single field against its schema definition
 * Pure function that validates a field
 */
export const validateField = (fieldName: string, fieldValue: any, schemaField: any): any[] => {
    const errors: any[] = [];
    
    // Check if field is null/empty and if it's allowed
    if ((!fieldValue || fieldValue.trim() === '') && !schemaField.nullable) {
        errors.push({
            fieldName,
            errorCode: 'NULL_VALUE_NOT_ALLOWED',
            errorMessage: `Field '${fieldName}' cannot be null or empty`,
            actualValue: fieldValue,
            validationRule: 'nullable: false'
        });
        return errors; // No point in further validation if field is null and not allowed
    }

    // Skip validation for null values if they're allowed
    if (!fieldValue || fieldValue.trim() === '') {
        return errors;
    }

    // Type-specific validation
    switch (schemaField.type.toLowerCase()) {
        case 'string':
            validateStringField(fieldName, fieldValue, schemaField, errors);
            break;
        case 'integer':
        case 'int':
            validateIntegerField(fieldName, fieldValue, schemaField, errors);
            break;
        case 'double':
        case 'float':
            validateFloatField(fieldName, fieldValue, schemaField, errors);
            break;
        case 'boolean':
        case 'bool':
            validateBooleanField(fieldName, fieldValue, schemaField, errors);
            break;
        case 'date':
            validateDateField(fieldName, fieldValue, schemaField, errors);
            break;
        case 'timestamp':
            validateTimestampField(fieldName, fieldValue, schemaField, errors);
            break;
        default:
            logError(`Unknown field type: ${schemaField.type}`, undefined, {
                fieldName,
                fieldType: schemaField.type
            });
    }

    return errors;
};

/**
 * Validate string field
 * Pure function that validates string fields
 */
const validateStringField = (fieldName: string, fieldValue: string, schemaField: any, errors: any[]): void => {
    // Check length constraints if specified in metadata
    const maxLength = schemaField.metadata?.maxLength;
    if (maxLength && fieldValue.length > maxLength) {
        errors.push({
            fieldName,
            errorCode: 'STRING_TOO_LONG',
            errorMessage: `Field '${fieldName}' exceeds maximum length of ${maxLength}`,
            actualValue: fieldValue,
            expectedFormat: `max length: ${maxLength}`,
            validationRule: 'maxLength'
        });
    }
    
    const minLength = schemaField.metadata?.minLength;
    if (minLength && fieldValue.length < minLength) {
        errors.push({
            fieldName,
            errorCode: 'STRING_TOO_SHORT',
            errorMessage: `Field '${fieldName}' is shorter than minimum length of ${minLength}`,
            actualValue: fieldValue,
            expectedFormat: `min length: ${minLength}`,
            validationRule: 'minLength'
        });
    }

    // Check pattern if specified
    const pattern = schemaField.metadata?.pattern;
    if (pattern && !new RegExp(pattern).test(fieldValue)) {
        errors.push({
            fieldName,
            errorCode: 'PATTERN_MISMATCH',
            errorMessage: `Field '${fieldName}' does not match required pattern`,
            actualValue: fieldValue,
            expectedFormat: pattern,
            validationRule: 'pattern'
        });
    }
};

/**
 * Validate integer field
 * Pure function that validates integer fields
 */
const validateIntegerField = (fieldName: string, fieldValue: string, schemaField: any, errors: any[]): void => {
    const numValue = parseInt(fieldValue, 10);
    if (isNaN(numValue)) {
        errors.push({
            fieldName,
            errorCode: 'INVALID_INTEGER',
            errorMessage: `Field '${fieldName}' is not a valid integer`,
            actualValue: fieldValue,
            expectedFormat: 'integer',
            validationRule: 'type: integer'
        });
        return;
    }

    // Check range constraints
    const maxValue = schemaField.metadata?.maxValue;
    if (maxValue !== undefined && numValue > maxValue) {
        errors.push({
            fieldName,
            errorCode: 'INTEGER_TOO_LARGE',
            errorMessage: `Field '${fieldName}' exceeds maximum value of ${maxValue}`,
            actualValue: fieldValue,
            expectedFormat: `max: ${maxValue}`,
            validationRule: 'maxValue'
        });
    }
    
    const minValue = schemaField.metadata?.minValue;
    if (minValue !== undefined && numValue < minValue) {
        errors.push({
            fieldName,
            errorCode: 'INTEGER_TOO_SMALL',
            errorMessage: `Field '${fieldName}' is below minimum value of ${minValue}`,
            actualValue: fieldValue,
            expectedFormat: `min: ${minValue}`,
            validationRule: 'minValue'
        });
    }
};

/**
 * Validate float field
 * Pure function that validates float fields
 */
const validateFloatField = (fieldName: string, fieldValue: string, schemaField: any, errors: any[]): void => {
    const numValue = parseFloat(fieldValue);
    if (isNaN(numValue)) {
        errors.push({
            fieldName,
            errorCode: 'INVALID_FLOAT',
            errorMessage: `Field '${fieldName}' is not a valid number`,
            actualValue: fieldValue,
            expectedFormat: 'number',
            validationRule: 'type: float'
        });
        return;
    }

    // Check range constraints
    const maxValue = schemaField.metadata?.maxValue;
    if (maxValue !== undefined && numValue > maxValue) {
        errors.push({
            fieldName,
            errorCode: 'FLOAT_TOO_LARGE',
            errorMessage: `Field '${fieldName}' exceeds maximum value of ${maxValue}`,
            actualValue: fieldValue,
            expectedFormat: `max: ${maxValue}`,
            validationRule: 'maxValue'
        });
    }
    
    const minValue = schemaField.metadata?.minValue;
    if (minValue !== undefined && numValue < minValue) {
        errors.push({
            fieldName,
            errorCode: 'FLOAT_TOO_SMALL',
            errorMessage: `Field '${fieldName}' is below minimum value of ${minValue}`,
            actualValue: fieldValue,
            expectedFormat: `min: ${minValue}`,
            validationRule: 'minValue'
        });
    }
};

/**
 * Validate boolean field
 * Pure function that validates boolean fields
 */
const validateBooleanField = (fieldName: string, fieldValue: string, schemaField: any, errors: any[]): void => {
    const lowerValue = fieldValue.toLowerCase();
    if (!['true', 'false', '1', '0', 'yes', 'no', 'on', 'off'].includes(lowerValue)) {
        errors.push({
            fieldName,
            errorCode: 'INVALID_BOOLEAN',
            errorMessage: `Field '${fieldName}' is not a valid boolean value`,
            actualValue: fieldValue,
            expectedFormat: 'true/false, 1/0, yes/no, on/off',
            validationRule: 'type: boolean'
        });
    }
};

/**
 * Validate date field
 * Pure function that validates date fields
 */
const validateDateField = (fieldName: string, fieldValue: string, schemaField: any, errors: any[]): void => {
    const date = new Date(fieldValue);
    if (isNaN(date.getTime())) {
        errors.push({
            fieldName,
            errorCode: 'INVALID_DATE',
            errorMessage: `Field '${fieldName}' is not a valid date`,
            actualValue: fieldValue,
            expectedFormat: 'ISO date string',
            validationRule: 'type: date'
        });
    }
};

/**
 * Validate timestamp field
 * Pure function that validates timestamp fields
 */
const validateTimestampField = (fieldName: string, fieldValue: string, schemaField: any, errors: any[]): void => {
    const timestamp = new Date(fieldValue);
    if (isNaN(timestamp.getTime())) {
        errors.push({
            fieldName,
            errorCode: 'INVALID_TIMESTAMP',
            errorMessage: `Field '${fieldName}' is not a valid timestamp`,
            actualValue: fieldValue,
            expectedFormat: 'ISO timestamp string',
            validationRule: 'type: timestamp'
        });
    }
};
