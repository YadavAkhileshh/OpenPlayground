/**
 * QuadCompress Logger Utility
 * 
 * A robust wrapper around console methods to provide consistent, styled output
 * for debugging and user information. Supports different log levels and 
 * optional timestamping.
 * 
 * @module Logger
 */

import { CONFIG } from '../config.js';

const STYLES = {
    info: 'color: #7fdbff; font-weight: bold;',
    success: 'color: #2ecc40; font-weight: bold;',
    warn: 'color: #ffdc00; font-weight: bold; background: #333; padding: 2px 4px; border-radius: 2px;',
    error: 'color: #ff4136; font-weight: bold; background: #2a0000; padding: 2px 4px; border-radius: 2px;',
    system: 'color: #b10dc9; font-weight: bold;'
};

export class Logger {

    /**
     * Internal method to format current time
     * @returns {string} [HH:MM:SS.ms]
     */
    static _getTimestamp() {
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', { hour12: false });
        const ms = String(now.getMilliseconds()).padStart(3, '0');
        return `[${time}.${ms}]`;
    }

    /**
     * Standard info log
     * @param {string} visualLabel - Short tag for the log source
     * @param {any} message - The content to log
     */
    static info(visualLabel, message) {
        if (!CONFIG.DEBUG_MODE) return;
        console.log(
            `%c${this._getTimestamp()} [INFO] [${visualLabel}]`,
            STYLES.info,
            message
        );
    }

    /**
     * Success info log
     * @param {string} visualLabel 
     * @param {any} message 
     */
    static success(visualLabel, message) {
        console.log(
            `%c${this._getTimestamp()} [SUCCESS] [${visualLabel}]`,
            STYLES.success,
            message
        );
    }

    /**
     * Warning log
     * @param {string} visualLabel 
     * @param {any} message 
     */
    static warn(visualLabel, message) {
        console.warn(
            `%c${this._getTimestamp()} [WARN] [${visualLabel}]`,
            STYLES.warn,
            message
        );
    }

    /**
     * Error log - Always shown regardless of debug mode
     * @param {string} visualLabel 
     * @param {Error|string} error 
     */
    static error(visualLabel, error) {
        console.error(
            `%c${this._getTimestamp()} [ERROR] [${visualLabel}]`,
            STYLES.error,
            error
        );
        // In a real app, this might send telemetry
    }

    /**
     * System level event log
     * @param {string} message 
     */
    static system(message) {
        console.log(
            `%c${this._getTimestamp()} [SYSTEM] >>>`,
            STYLES.system,
            message
        );
    }

    /**
     * Logs table data
     * @param {string} label 
     * @param {Object} data 
     */
    static table(label, data) {
        if (!CONFIG.DEBUG_MODE) return;
        console.group(`[${label}] Data Table`);
        console.table(data);
        console.groupEnd();
    }
}
