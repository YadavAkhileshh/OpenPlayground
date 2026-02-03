/**
 * @fileoverview Diagnostic logger for the Newton's Cradle simulation.
 * Handles performance tracking and physics state reporting.
 */

export class Logger {
    /**
     * Initialize the logger with a specific level.
     * @param {string} level - 'info', 'warn', 'error', or 'debug'.
     */
    constructor(level = 'info') {
        this.level = level;
        this.history = [];
        this.maxHistory = 1000;

        console.log(`[NewtonCradle] Logger initialized at level: ${level}`);
    }

    /**
     * Log a general information message.
     * @param {string} message - The message to log.
     * @param {any} data - Optional data to attach.
     */
    info(message, data = null) {
        this._log('info', message, data);
    }

    /**
     * Log a debug message for physics internals.
     * @param {string} message - The message to log.
     * @param {any} data - Optional data to attach.
     */
    debug(message, data = null) {
        if (this.level === 'debug') {
            this._log('debug', message, data);
        }
    }

    /**
     * Log a warning about potential instability.
     * @param {string} message - The message to log.
     * @param {any} data - Optional data to attach.
     */
    warn(message, data = null) {
        this._log('warn', message, data);
    }

    /**
     * Log a critical error.
     * @param {string} message - The message to log.
     * @param {any} data - Optional data to attach.
     */
    error(message, data = null) {
        this._log('error', message, data);
    }

    /**
     * Internal logging method.
     * @private
     */
    _log(type, message, data) {
        const timestamp = new Date().toISOString();
        const entry = { timestamp, type, message, data };

        this.history.push(entry);
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }

        const logMsg = `[${type.toUpperCase()}] ${message}`;
        if (data) {
            console[type](logMsg, data);
        } else {
            console[type](logMsg);
        }
    }

    /**
     * Export log history as a string.
     * Useful for debugging complex collision chains.
     */
    exportLogs() {
        return JSON.stringify(this.history, null, 2);
    }

    /**
     * Clear the log history.
     */
    clear() {
        this.history = [];
    }
}

// Global instance for convenience
export const logger = new Logger('debug');
