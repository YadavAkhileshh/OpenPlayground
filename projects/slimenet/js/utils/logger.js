/**
 * SlimeNet - Logger
 * 
 * Simple wrapper for console logging with project-specific formatting.
 */

const Logger = {
    enabled: true,

    /**
     * Logs an informational message.
     * @param {string} module 
     * @param {string} message 
     * @param  {...any} args 
     */
    info: (module, message, ...args) => {
        if (!Logger.enabled) return;
        console.log(`%c[${module}]%c ${message}`, 'color: #00ffaa; font-weight: bold;', 'color: #e0e0e0;', ...args);
    },

    /**
     * Logs a warning message.
     * @param {string} module 
     * @param {string} message 
     * @param  {...any} args 
     */
    warn: (module, message, ...args) => {
        if (!Logger.enabled) return;
        console.warn(`%c[${module}]%c ${message}`, 'color: #ffaa00; font-weight: bold;', 'color: #e0e0e0;', ...args);
    },

    /**
     * Logs an error message.
     * @param {string} module 
     * @param {string} message 
     * @param  {...any} args 
     */
    error: (module, message, ...args) => {
        console.error(`%c[${module}]%c ${message}`, 'color: #ff3333; font-weight: bold;', 'color: #e0e0e0;', ...args);
    }
};

window.Logger = Logger;
