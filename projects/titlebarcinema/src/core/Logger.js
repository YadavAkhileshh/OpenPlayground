/**
 * TitleBarCinema - Logger.js
 * 
 * A specialized logging utility that provides formatted console 
 * output for the game engine. This helps in debugging state 
 * transitions and timing issues without polluting the global 
 * console namespace directly.
 *
 * @project TitleBarCinema
 * @version 1.0.0
 * @author Antigravity
 */

export class Logger {
    /**
     * @param {string} moduleName - The name of the module using the logger.
     * @param {boolean} enabled - Whether logging is active.
     */
    constructor(moduleName, enabled = true) {
        this.moduleName = moduleName;
        this.enabled = enabled;
        this.prefix = `[${this.moduleName}]`;
        this.colors = {
            info: '#6366f1',
            warn: '#f59e0b',
            error: '#ef4444',
            success: '#22c55e'
        };
    }

    /**
     * Log a standard information message.
     * @param {string} message - The content to log.
     * @param {any} [data] - Additional diagnostic data.
     */
    info(message, data = null) {
        if (!this.enabled) return;
        this._log('info', message, data);
    }

    /**
     * Log a warning message.
     * @param {string} message - The content to log.
     */
    warn(message) {
        if (!this.enabled) return;
        this._log('warn', message);
    }

    /**
     * Log an error message.
     * @param {string} message - The content to log.
     */
    error(message) {
        if (!this.enabled) return;
        this._log('error', message);
    }

    /**
     * Log a success message.
     * @param {string} message - The content to log.
     */
    success(message) {
        if (!this.enabled) return;
        this._log('success', message);
    }

    /**
     * Internal formatting logic for logs.
     * @private
     */
    _log(type, message, data) {
        const timestamp = new Date().toLocaleTimeString();
        const style = `color: ${this.colors[type]}; font-weight: bold;`;

        if (data) {
            console.log(`%c${this.prefix} [${timestamp}] ${message}`, style, data);
        } else {
            console.log(`%c${this.prefix} [${timestamp}] ${message}`, style);
        }
    }

    /**
     * Enables logging dynamically.
     */
    enable() {
        this.enabled = true;
    }

    /**
     * Disables logging dynamically.
     */
    disable() {
        this.enabled = false;
    }
}
