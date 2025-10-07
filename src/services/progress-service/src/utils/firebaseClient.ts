import * as admin from 'firebase-admin';
import { logInfo, logError } from './logger';

let firebaseApp: admin.app.App;

export function initializeFirebase(serviceAccount: any) {
    firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://your-project-id.firebaseio.com'
    });
    
    logInfo('Firebase initialized');
}

export async function sendProgressUpdate(orgId: string, jobId: string, progressData: any) {
    try {
        const db = admin.database();
        const ref = db.ref(`progress/${orgId}/${jobId}`);
        
        await ref.set({
            ...progressData,
            timestamp: admin.database.ServerValue.TIMESTAMP
        });
        
        logInfo('Progress updated in Firebase', { orgId, jobId });
        return { success: true };
    } catch (error) {
        logError('Failed to update Firebase', error, { orgId, jobId });
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}