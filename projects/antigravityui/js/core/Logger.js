// js/core/Logger.js

export class Logger {
    static DEBUG = false;

    static log(...args) {
        if (Logger.DEBUG) {
            console.log('[AntiGravityUI]', ...args);
        }
    }

    static warn(...args) {
        console.warn('[AntiGravityUI WARN]', ...args);
    }

    static error(...args) {
        console.error('[AntiGravityUI ERROR]', ...args);
    }

    static enableDebug() {
        Logger.DEBUG = true;
    }
}
