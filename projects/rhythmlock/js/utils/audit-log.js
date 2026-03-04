/**
 * RhythmLock - Audit Log
 * ----------------------
 * Maintains a local history of authentication attempts.
 * Simulates a secure logging facility.
 */

export class AuditLog {
    constructor() {
        this.logs = [];
        this.maxLogs = 50;
    }

    /**
     * Log an authentication attempt.
     * @param {string} type 'SUCCESS' | 'FAILURE' | 'ENROLLMENT'
     * @param {string} message 
     * @param {object} metadata 
     */
    log(type, message, metadata = {}) {
        const entry = {
            id: this.generateLogId(),
            timestamp: new Date().toISOString(),
            type: type,
            message: message,
            metadata: metadata,
            hash: this.generateHash(message + Date.now())
        };

        this.logs.unshift(entry);

        if (this.logs.length > this.maxLogs) {
            this.logs.pop();
        }

        console.log(`[AUDIT] [${type}] ${message}`, metadata);
        return entry;
    }

    generateLogId() {
        return 'LOG-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    generateHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }

    /**
     * Returns all logs.
     */
    getLogs() {
        return [...this.logs];
    }

    /**
     * Exports logs to JSON (simulated).
     */
    exportLogs() {
        return JSON.stringify(this.logs, null, 2);
    }
}
