import * as admin from 'firebase-admin';
import { logInfo, logError } from './logger';

let db: admin.firestore.Firestore;

/**
 * Initialize Firebase Admin SDK with Firestore
 */
export function initializeFirebase(serviceAccountJson: string, projectId: string): void {
    try {
        const serviceAccount = JSON.parse(serviceAccountJson);
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: projectId
        });
        
        db = admin.firestore();
        
        logInfo('Firebase Firestore initialized successfully', { projectId });
    } catch (error) {
        logError('Failed to initialize Firebase', error, { projectId });
        throw error;
    }
}

/**
 * Write progress update to Firestore
 * Updates the progress/{orgId}/jobs/{jobId} document
 */
export async function writeProgressUpdate(
    orgId: string,
    jobId: string,
    serviceName: string,
    progressData: {
        percentage: number;
        processedCount: number;
        totalRows: number;
        isComplete: boolean;
    },
    metadata?: {
        fileName?: string;
        uploadedBy?: string;
    }
): Promise<{ success: boolean; error?: string }> {
    try {
        if (!db) {
            throw new Error('Firebase not initialized');
        }

        const docRef = db
            .collection('progress')
            .doc(orgId)
            .collection('jobs')
            .doc(jobId);

        // Determine which field to update based on service name
        const updateData: any = {
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        };

        if (serviceName === 'validation') {
            updateData.validation = {
                status: progressData.isComplete ? 'completed' : 'processing',
                percentage: progressData.percentage,
                processedCount: progressData.processedCount,
                totalRows: progressData.totalRows
            };
        } else if (serviceName === 'transformation') {
            updateData.transformation = {
                status: progressData.isComplete ? 'completed' : 'processing',
                percentage: progressData.percentage,
                processedCount: progressData.processedCount,
                totalRows: progressData.totalRows
            };
        }

        // Add metadata on first write (if provided)
        if (metadata) {
            if (metadata.fileName) {
                updateData.fileName = metadata.fileName;
            }
            if (metadata.uploadedBy) {
                updateData.uploadedBy = metadata.uploadedBy;
            }
            // Only set startedAt if it doesn't exist
            const doc = await docRef.get();
            if (!doc.exists) {
                updateData.startedAt = admin.firestore.FieldValue.serverTimestamp();
            }
        }

        // Use merge to avoid overwriting other fields
        await docRef.set(updateData, { merge: true });

        logInfo('Progress written to Firestore', {
            orgId,
            jobId,
            serviceName,
            percentage: progressData.percentage,
            isComplete: progressData.isComplete
        });

        return { success: true };
    } catch (error) {
        logError('Failed to write progress to Firestore', error, {
            orgId,
            jobId,
            serviceName
        });
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Write job completion to Firestore
 */
export async function writeJobCompletion(
    orgId: string,
    jobId: string,
    overallPercentage: number,
    completedServices: string[]
): Promise<{ success: boolean; error?: string }> {
    try {
        if (!db) {
            throw new Error('Firebase not initialized');
        }

        const docRef = db
            .collection('progress')
            .doc(orgId)
            .collection('jobs')
            .doc(jobId);

        // Build update object dynamically based on completed services
        const updateData: any = {
            overallPercentage: overallPercentage,
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        };

        if (completedServices.includes('validation')) {
            updateData.validation = {
                status: 'completed'
            };
        }
        
        if (completedServices.includes('transformation')) {
            updateData.transformation = {
                status: 'completed'
            };
        }

        await docRef.set(updateData, { merge: true });

        logInfo('Job completion written to Firestore', {
            orgId,
            jobId,
            overallPercentage,
            completedServices
        });
        return { success: true };
    } catch (error) {
        logError('Failed to write job completion to Firestore', error, {
            orgId,
            jobId
        });
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Get Firestore instance (for advanced queries if needed)
 */
export function getFirestore(): admin.firestore.Firestore {
    if (!db) {
        throw new Error('Firebase not initialized');
    }
    return db;
}