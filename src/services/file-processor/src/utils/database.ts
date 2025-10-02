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
 * Create upload session in database
 * Pure function that creates a new upload session
 */
export const createUploadSession = async (
    pool: Pool,
    session: any
): Promise<{ success: boolean; data?: any; error?: string }> => {
    const client = await pool.connect();
    try {
        // Check if a record with the same orgId, sourceId, and timestamp already exists
        const checkQuery = `
      SELECT id FROM uploadsession 
      WHERE orgid = $1 AND sourceid = $2 AND timestamp = $3
    `;
        const checkResult = await client.query(checkQuery, [
            session.orgid,
            session.sourceid,
            session.timestamp
        ]);
        
        if (checkResult.rows.length > 0) {
            return {
                success: false,
                error: `Upload session already exists for orgid: ${session.orgid}, sourceid: ${session.sourceid}, timestamp: ${session.timestamp}`
            };
        }
        
        // Create new upload session
        const insertQuery = `
      INSERT INTO uploadsession (
        id, orgid, sourceid, filename, timestamp, totalrows, validrows, 
        invalidrows, fileprocessingstatus, validationstatus, 
        transformationstatus, overallstatus, mimetype, createdat, updatedat
      ) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING *
    `;
        const result = await client.query(insertQuery, [
            session.orgid,
            session.sourceid,
            session.filename,
            session.timestamp,
            session.totalrows || 0,
            session.validrows || 0,
            session.invalidrows || 0,
            session.fileprocessingstatus,
            session.validationstatus,
            session.transformationstatus,
            session.overallstatus,
            session.mimetype || null
        ]);
        
        const createdSession = result.rows[0];
        
        logInfo('Created new upload session', {
            sessionId: createdSession.id,
            orgid: createdSession.orgid,
            sourceid: createdSession.sourceid
        });
        
        return {
            success: true,
            data: {
                id: createdSession.id,
                orgid: createdSession.orgid,
                sourceid: createdSession.sourceid,
                filename: createdSession.filename,
                timestamp: createdSession.timestamp,
                totalrows: createdSession.totalrows,
                validrows: createdSession.validrows,
                invalidrows: createdSession.invalidrows,
                mimetype: createdSession.mimetype,
                fileprocessingstatus: createdSession.fileprocessingstatus,
                validationstatus: createdSession.validationstatus,
                transformationstatus: createdSession.transformationstatus,
                overallstatus: createdSession.overallstatus,
                createdat: createdSession.createdat,
                updatedat: createdSession.updatedat,
                completedat: createdSession.completedat
            }
        };
    } catch (error) {
        logError('Failed to create upload session', error, {
            orgid: session.orgid,
            sourceid: session.sourceid,
            timestamp: session.timestamp
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
 * Get existing upload session
 * Pure function that retrieves an upload session
 */
export const getUploadSession = async (
    pool: Pool,
    orgId: string,
    sourceId: string,
    timestamp: number
): Promise<{ success: boolean; data?: any; error?: string }> => {
    const client = await pool.connect();
    try {
        const query = `
      SELECT * FROM uploadsession 
      WHERE orgid = $1 AND sourceid = $2 AND timestamp = $3
    `;
        const result = await client.query(query, [orgId, sourceId, timestamp]);
        
        if (result.rows.length === 0) {
            return {
                success: true,
                data: undefined
            };
        }
        
        const session = result.rows[0];
        return {
            success: true,
            data: {
                id: session.id,
                orgid: session.orgid,
                sourceid: session.sourceid,
                filename: session.filename,
                timestamp: session.timestamp,
                totalrows: session.totalrows,
                validrows: session.validrows,
                invalidrows: session.invalidrows,
                mimetype: session.mimetype,
                fileprocessingstatus: session.fileprocessingstatus,
                validationstatus: session.validationstatus,
                transformationstatus: session.transformationstatus,
                overallstatus: session.overallstatus,
                createdat: session.createdat,
                updatedat: session.updatedat,
                completedat: session.completedat
            }
        };
    } catch (error) {
        logError('Failed to get upload session', error, {
            orgId,
            sourceId,
            timestamp
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
 * Update upload session
 * Pure function that updates an upload session
 */
export const updateUploadSession = async (
    pool: Pool,
    sessionId: string,
    updates: any
): Promise<{ success: boolean; data?: any; error?: string }> => {
    const client = await pool.connect();
    try {
        const updateFields = Object.keys(updates).map((key, index) => {
            const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            return `${dbKey} = $${index + 2}`;
        }).join(', ');
        
        const values = Object.values(updates);
        const query = `
      UPDATE uploadsession 
      SET ${updateFields}, updatedat = NOW()
      WHERE id = $1
      RETURNING *
    `;
        
        const result = await client.query(query, [sessionId, ...values]);
        
        if (result.rows.length === 0) {
            return {
                success: false,
                error: `Upload session with ID ${sessionId} not found`
            };
        }
        
        const session = result.rows[0];
        
        logInfo('Updated upload session', {
            sessionId,
            updates: Object.keys(updates)
        });
        
        return {
            success: true,
            data: {
                id: session.id,
                orgid: session.orgid,
                sourceid: session.sourceid,
                filename: session.filename,
                timestamp: session.timestamp,
                totalrows: session.totalrows,
                validrows: session.validrows,
                invalidrows: session.invalidrows,
                mimetype: session.mimetype,
                fileprocessingstatus: session.fileprocessingstatus,
                validationstatus: session.validationstatus,
                transformationstatus: session.transformationstatus,
                overallstatus: session.overallstatus,
                createdat: session.createdat,
                updatedat: session.updatedat,
                completedat: session.completedat
            }
        };
    } catch (error) {
        logError('Failed to update upload session', error, {
            sessionId,
            updates: Object.keys(updates)
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
