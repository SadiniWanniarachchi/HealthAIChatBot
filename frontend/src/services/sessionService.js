// Session service to save local chat sessions to MongoDB
import { diagnosisAPI } from './api.js';

class SessionService {
    constructor() {
        this.syncedSessions = new Set(JSON.parse(localStorage.getItem('syncedSessions') || '[]'));
    }

    // Save a completed local session to MongoDB
    async saveSessionToMongoDB(session) {
        try {
            // Check if user is authenticated
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                console.log('User not authenticated, keeping session local only');
                return false;
            }

            // Check if already synced
            if (this.syncedSessions.has(session.sessionId)) {
                return true;
            }

            // Transform local session to MongoDB format
            const diagnosisData = {
                sessionId: session.sessionId,
                age: session.userInfo?.age || 25,
                gender: session.userInfo?.gender || 'other',
                firstName: session.userInfo?.firstName || '',
                lastName: session.userInfo?.lastName || '',
                symptoms: session.symptoms || [],
                medicalHistory: session.medicalHistory || [],
                currentMedications: session.currentMedications || [],
                messages: session.messages || [],
                diagnosis: session.diagnosis,
                status: 'completed',
                completedAt: session.completedAt,
                userInfo: session.userInfo
            };

            // Start diagnosis session in MongoDB
            const startResponse = await diagnosisAPI.startDiagnosis({
                age: diagnosisData.age,
                gender: diagnosisData.gender,
                firstName: diagnosisData.firstName,
                lastName: diagnosisData.lastName
            });

            const mongoSessionId = startResponse.sessionId;

            // Add all chat messages to the session
            for (const message of diagnosisData.messages) {
                if (message.sender === 'user') {
                    await diagnosisAPI.sendMessage(mongoSessionId, {
                        message: message.message,
                        symptoms: []
                    });
                }
            }

            // Complete the diagnosis
            if (diagnosisData.diagnosis) {
                await diagnosisAPI.completeDiagnosis(mongoSessionId, {
                    medicalHistory: diagnosisData.medicalHistory,
                    currentMedications: diagnosisData.currentMedications
                });
            }

            // Mark as synced
            this.syncedSessions.add(session.sessionId);
            localStorage.setItem('syncedSessions', JSON.stringify([...this.syncedSessions]));

            console.log('Successfully synced session to MongoDB:', session.sessionId);
            return true;
        } catch (error) {
            console.error('Failed to sync session to MongoDB:', error);
            return false;
        }
    }

    // Sync all unsynced local sessions to MongoDB
    async syncAllLocalSessions() {
        const localSessions = JSON.parse(localStorage.getItem('completedSessions') || '[]');
        const completedSessions = localSessions.filter(session =>
            session.status === 'completed' && !this.syncedSessions.has(session.sessionId)
        );

        const results = [];
        for (const session of completedSessions) {
            const success = await this.saveSessionToMongoDB(session);
            results.push({ sessionId: session.sessionId, synced: success });
        }

        return results;
    }

    // Clear local sessions that have been synced to MongoDB
    async clearSyncedLocalSessions() {
        const localSessions = JSON.parse(localStorage.getItem('completedSessions') || '[]');
        const unsyncedSessions = localSessions.filter(session =>
            !this.syncedSessions.has(session.sessionId)
        );

        localStorage.setItem('completedSessions', JSON.stringify(unsyncedSessions));
        return unsyncedSessions.length;
    }

    // Check if a session is synced
    isSessionSynced(sessionId) {
        return this.syncedSessions.has(sessionId);
    }

    // Force sync on app startup (if authenticated)
    async initializeSync() {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            console.log('Initializing session sync with MongoDB...');
            const results = await this.syncAllLocalSessions();
            console.log('Sync results:', results);
            return results;
        }
        return [];
    }
}

export const sessionService = new SessionService();
