import { Pool } from 'pg';
import { getEnvironmentConfig } from './environment';
import { logInfo, logError } from './logger';

/**
 * Create database configuration from environment
 * Pure function that creates database config
 */
export const createDatabaseConfig = (): any => {
    const env = getEnvironmentConfig();
    return {
        host: env.postgresHost,
        database: env.postgresDatabase,
        user: env.postgresClientId,
        password: env.postgresClientSecret,
        port: 5432,
        ssl: true,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    };
};

/**
 * Create database connection pool
 * Pure function that creates a new pool
 */
export const createDatabasePool = (config: any): Pool => {
    return new Pool(config);
};

/**
 * Get schema definition by orgId and sourceId
 * Pure function that retrieves schema definition
 */
export const getSchemaDefinition = async (pool: Pool, orgId: string, sourceId: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> => {
    const client = await pool.connect();
    try {
        const query = `
      SELECT id, orgid, label, schema, createddate, updateddate
      FROM schemadef 
      WHERE orgid = $1 AND id = $2
      ORDER BY updateddate DESC
      LIMIT 1
    `;
        const result = await client.query(query, [orgId, sourceId]);
        console.log('result : ', result);
        
        if (result.rows.length === 0) {
            return {
                success: false,
                error: `No schema definition found for orgId: ${orgId}, sourceId: ${sourceId}`
            };
        }

        const row = result.rows[0];
        console.log('row : ', row);
        const schemaDefinition = {
            id: row.id,
            orgId: row.orgid,
            label: row.label,
            schema: row.schema,
            createdDate: row.createddate,
            updatedDate: row.updateddate
        };

        logInfo('Retrieved schema definition', {
            schemaId: schemaDefinition.id,
            orgId,
            sourceId,
            fieldCount: schemaDefinition.schema?.fields?.length || 0
        });

        return {
            success: true,
            data: schemaDefinition
        };
    } catch (error) {
        logError('Failed to get schema definition', error, {
            orgId,
            sourceId
        });
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    } finally {
        client.release();
    }
};

/**
 * Update upload session validation status
 * Pure function that updates validation status
 */
export const updateValidationStatus = async (
    pool: Pool,
    sessionId: string,
    validRows: number,
    invalidRows: number,
    status: string
): Promise<{ success: boolean; error?: string }> => {
    const client = await pool.connect();
    try {
        const query = `
      UPDATE uploadsession 
      SET validrows = $1, invalidrows = $2, validationstatus = $3, updatedat = NOW()
      WHERE id = $4
    `;
        await client.query(query, [validRows, invalidRows, status, sessionId]);
        
        logInfo('Updated validation status', {
            sessionId,
            validRows,
            invalidRows,
            status
        });
        
        return {
            success: true
        };
    } catch (error) {
        logError('Failed to update validation status', error, {
            sessionId,
            validRows,
            invalidRows,
            status
        });
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    } finally {
        client.release();
    }
};

/**
 * Close database pool
 * Pure function that closes the database connection
 */
export const closeDatabasePool = async (pool: Pool): Promise<void> => {
    try {
        await pool.end();
        logInfo('Database pool closed successfully');
    } catch (error) {
        logError('Failed to close database pool', error);
    }
};
