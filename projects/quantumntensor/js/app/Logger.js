/**
 * js/app/Logger.js
 * Custom visual terminal log that mirror the real-time math
 * onto the DOM for the "expert" feel.
 */

class Logger {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.messages = [];
        this.maxLines = 50;
    }

    log(msg) {
        this._write(`[SYS] ${msg}`, 'log-info');
    }

    error(msg) {
        this._write(`[ERR] ${msg}`, 'log-error');
    }

    warn(msg) {
        this._write(`[WRN] ${msg}`, 'log-warn');
    }

    _write(text, className) {
        if (!this.container) return;

        let el = document.createElement('div');
        el.className = `log-line ${className}`;
        el.innerText = text;
        this.container.appendChild(el);
        this.messages.push(el);

        if (this.messages.length > this.maxLines) {
            let removed = this.messages.shift();
            removed.remove();
        }

        // Auto-scroll
        this.container.scrollTop = this.container.scrollHeight;

        if (window.AppConfig && window.AppConfig.ENABLE_DEBUG_LOGS) {
            console.log(text);
        }
    }
}

// Global logger instance will be created in main.js, but
// we expose a static hook since Math uses it directly gracefully via window.AppLogger.
window.LoggerClass = Logger;
