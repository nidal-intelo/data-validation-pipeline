import { z } from 'zod';

/**
 * Pure function that validates JSON schema structure
 */
export const validateJsonSchema = (jsonSchema: any): boolean => {
    return !!(jsonSchema && jsonSchema.properties && typeof jsonSchema.properties === 'object');
};

/**
 * Pure function that converts JSON Schema to Zod schema dynamically
 * This builds the schema programmatically instead of using eval
 */
export const jsonSchemaToZod = (jsonSchema: any): any => {
    if (!validateJsonSchema(jsonSchema)) {
        throw new Error('Invalid JSON schema: missing properties');
    }

    const properties = jsonSchema.properties;
    const zodShape: any = {};
    
    console.log('Converting JSON Schema to Zod:', {
        schemaProperties: Object.keys(properties),
        requiredFields: jsonSchema.required || [],
        totalProperties: Object.keys(properties).length
    });

    for (const [key, value] of Object.entries(properties)) {
        const prop = value as any;
        console.log(`Converting field '${key}':`, {
            type: prop.type,
            required: prop.required,
            nullable: prop.nullable,
            validation: prop.validation,
            pattern: prop.pattern,
            format: prop.format,
            enum: prop.enum
        });

        // Build Zod schema based on JSON schema type
        let zodType: any;

        // Handle type
        switch (prop.type) {
            case 'string': {
                let stringSchema = z.string();
                
                // Apply string validations
                if (prop.validation) {
                    if (prop.validation.minLength !== undefined) {
                        stringSchema = stringSchema.min(prop.validation.minLength);
                    }
                    if (prop.validation.maxLength !== undefined) {
                        stringSchema = stringSchema.max(prop.validation.maxLength);
                    }
                    // Handle regex pattern in validation object
                    if (prop.validation.pattern) {
                        try {
                            const regex = new RegExp(prop.validation.pattern);
                            stringSchema = stringSchema.regex(regex, {
                                message: `${key} must match pattern: ${prop.validation.pattern}`
                            });
                        } catch (error) {
                            console.warn(`Invalid regex pattern for ${key}: ${prop.validation.pattern}`);
                        }
                    }
                }
                
                // Also check top-level pattern (standard JSON Schema)
                if (prop.pattern) {
                    try {
                        const regex = new RegExp(prop.pattern);
                        stringSchema = stringSchema.regex(regex, {
                            message: `${key} must match pattern: ${prop.pattern}`
                        });
                    } catch (error) {
                        console.warn(`Invalid regex pattern for ${key}: ${prop.pattern}`);
                    }
                }
                
                // Handle format validations
                if (prop.format) {
                    switch (prop.format) {
                        case 'email':
                            stringSchema = stringSchema.email();
                            break;
                        case 'url':
                        case 'uri':
                            stringSchema = stringSchema.url();
                            break;
                        case 'uuid':
                            stringSchema = stringSchema.uuid();
                            break;
                        case 'date':
                        case 'date-time':
                            stringSchema = stringSchema.datetime();
                            break;
                        default:
                            // Unknown format, keep as is
                            break;
                    }
                }
                
                // Handle enum
                if (prop.enum && Array.isArray(prop.enum)) {
                    zodType = z.enum(prop.enum);
                } else {
                    zodType = stringSchema;
                }
                break;
            }
            case 'number':
            case 'integer': {
                let numberSchema = z.number();
                
                if (prop.validation) {
                    if (prop.validation.minimum !== undefined) {
                        numberSchema = numberSchema.min(prop.validation.minimum);
                    }
                    if (prop.validation.maximum !== undefined) {
                        numberSchema = numberSchema.max(prop.validation.maximum);
                    }
                    if (prop.validation.exclusiveMinimum !== undefined) {
                        numberSchema = numberSchema.gt(prop.validation.exclusiveMinimum);
                    }
                    if (prop.validation.exclusiveMaximum !== undefined) {
                        numberSchema = numberSchema.lt(prop.validation.exclusiveMaximum);
                    }
                    if (prop.validation.multipleOf !== undefined) {
                        numberSchema = numberSchema.multipleOf(prop.validation.multipleOf);
                    }
                }
                
                // Also check top-level properties (standard JSON Schema)
                if (prop.minimum !== undefined) {
                    numberSchema = numberSchema.min(prop.minimum);
                }
                if (prop.maximum !== undefined) {
                    numberSchema = numberSchema.max(prop.maximum);
                }
                if (prop.exclusiveMinimum !== undefined) {
                    numberSchema = numberSchema.gt(prop.exclusiveMinimum);
                }
                if (prop.exclusiveMaximum !== undefined) {
                    numberSchema = numberSchema.lt(prop.exclusiveMaximum);
                }
                if (prop.multipleOf !== undefined) {
                    numberSchema = numberSchema.multipleOf(prop.multipleOf);
                }
                
                if (prop.type === 'integer') {
                    numberSchema = numberSchema.int();
                }
                
                zodType = numberSchema;
                break;
            }
            case 'boolean':
                zodType = z.boolean();
                break;
            case 'array': {
                let arraySchema: any;
                if (prop.items) {
                    const itemSchema = jsonSchemaToZod({ properties: { item: prop.items } });
                    arraySchema = z.array(itemSchema.shape.item);
                } else {
                    arraySchema = z.array(z.any());
                }
                
                // Array length validations
                if (prop.minItems !== undefined) {
                    arraySchema = arraySchema.min(prop.minItems);
                }
                if (prop.maxItems !== undefined) {
                    arraySchema = arraySchema.max(prop.maxItems);
                }
                
                zodType = arraySchema;
                break;
            }
            case 'object':
                if (prop.properties) {
                    zodType = jsonSchemaToZod(prop);
                } else {
                    zodType = z.object({}).passthrough();
                }
                break;
            default:
                zodType = z.any();
        }

        // Handle nullable
        if (prop.nullable === true) {
            zodType = zodType.nullable();
        }

        // Handle required (if not required, make optional)
        if (prop.required === false) {
            zodType = zodType.optional();
        }

        zodShape[key] = zodType;
    }

    // Handle top-level required array (standard JSON Schema)
    const requiredFields = jsonSchema.required || [];
    const finalShape: any = {};
    
    for (const [key, schema] of Object.entries(zodShape)) {
        const zodSchema = schema as any;
        if (requiredFields.includes(key)) {
            finalShape[key] = zodSchema;
        } else {
            // If not in required array and not already optional/nullable, make it optional
            const prop = properties[key];
            if (prop.required !== true && prop.nullable !== true) {
                finalShape[key] = zodSchema.optional();
            } else {
                finalShape[key] = zodSchema;
            }
        }
    }

    const finalSchema = z.object(finalShape);
    console.log('Generated Zod Schema:', JSON.stringify(finalSchema, null, 2));
    return finalSchema;
};

/**
 * Pure function that validates data against JSON schema
 */
export const validateDataAgainstJsonSchema = (data: any, jsonSchema: any): { success: boolean; errors?: any } => {
    try {
        const zodSchema = jsonSchemaToZod(jsonSchema);
        zodSchema.parse(data);
        return { success: true };
    } catch (error) {
        return { success: false, errors: error };
    }
};

/**
 * Pure function that validates a single row
 */
export const validateRow = (row: any, jsonSchema: any): { success: boolean; errors?: any } => {
    return validateDataAgainstJsonSchema(row, jsonSchema);
};

/**
 * Pure function that validates a single row against a pre-converted Zod schema
 */
export const validateRowWithZodSchema = (row: any, zodSchema: any): { success: boolean; errors?: any } => {
    try {
        zodSchema.parse(row);
        return { success: true };
    } catch (error) {
        return { success: false, errors: error };
    }
};

/**
 * Pure function that validates multiple rows against JSON schema
 */
export const validateRowsAgainstJsonSchema = (rows: any[], jsonSchema: any): { validRows: any[]; invalidRows: any[] } => {
    return rows.reduce((acc, row) => {
        const result = validateRow(row, jsonSchema);
        if (result.success) {
            acc.validRows.push(row);
        } else {
            acc.invalidRows.push({ row, errors: result.errors });
        }
        return acc;
    }, { validRows: [], invalidRows: [] });
};