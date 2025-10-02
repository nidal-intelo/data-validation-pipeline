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
 * Get upload session by ID
 * Pure function that retrieves an upload session
 */
export const getUploadSession = async (pool: Pool, sessionId: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> => {
    const client = await pool.connect();
    try {
        const query = `
      SELECT * FROM uploadsession 
      WHERE id = $1
    `;
        const result = await client.query(query, [sessionId]);
        
        if (result.rows.length === 0) {
            return {
                success: false,
                error: `Upload session with ID ${sessionId} not found`
            };
        }
        
        const session = result.rows[0];
        const uploadSession = {
            id: session.id,
            orgId: session.orgid,
            sourceId: session.sourceid,
            fileName: session.filename,
            timestamp: session.timestamp,
            totalRows: session.totalrows,
            validRows: session.validrows,
            invalidRows: session.invalidrows,
            mimeType: session.mimetype,
            fileProcessingStatus: session.fileprocessingstatus,
            validationStatus: session.validationstatus,
            transformationStatus: session.transformationstatus,
            overallStatus: session.overallstatus,
            createdAt: session.createdat,
            updatedAt: session.updatedat,
            completedAt: session.completedat
        };
        
        logInfo('Retrieved upload session', {
            sessionId,
            orgId: uploadSession.orgId,
            sourceId: uploadSession.sourceId,
            overallStatus: uploadSession.overallStatus
        });
        
        return {
            success: true,
            data: uploadSession
        };
    } catch (error) {
        logError('Failed to get upload session', error, {
            sessionId
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
 * Update upload session overall status
 * Pure function that updates overall status
 */
export const updateOverallStatus = async (
    pool: Pool,
    sessionId: string,
    status: string
): Promise<{ success: boolean; error?: string }> => {
    const client = await pool.connect();
    try {
        const query = `
      UPDATE uploadsession 
      SET overallstatus = $1, updatedat = NOW()
      WHERE id = $2
    `;
        await client.query(query, [status, sessionId]);
        
        logInfo('Updated overall status', {
            sessionId,
            status
        });
        
        return {
            success: true
        };
    } catch (error) {
        logError('Failed to update overall status', error, {
            sessionId,
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
