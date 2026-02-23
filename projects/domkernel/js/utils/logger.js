/**
 * System Logger
 */
class LoggerBase {
    constructor() {
        this.logs = [];
        this.logLevel = 3; // 0=NONE, 1=ERR, 2=WARN, 3=INFO, 4=DEBUG
        this.bootOutput = null; // Bound late during boot
    }

    setBootOutput(element) {
        this.bootOutput = element;
    }

    _write(level, tag, message) {
        const timestamp = new Date().toISOString().substring(11, 23);
        const line = `[${timestamp}] [${tag}] ${message}`;
        this.logs.push({ level, line });

        if (this.bootOutput) {
            const span = document.createElement('div');
            span.className = 'boot-log-line';
            span.textContent = line;
            if (level === 'ERROR') span.style.color = 'var(--danger)';
            if (level === 'WARN') span.style.color = 'var(--warning)';
            this.bootOutput.appendChild(span);
            this.bootOutput.scrollTop = this.bootOutput.scrollHeight;
        }

        switch (level) {
            case 'ERROR': console.error(line); break;
            case 'WARN': console.warn(line); break;
            case 'INFO': console.info(line); break;
            case 'DEBUG': console.debug(line); break;
        }
    }

    error(tag, message) {
        if (this.logLevel >= 1) this._write('ERROR', tag, message);
    }

    warn(tag, message) {
        if (this.logLevel >= 2) this._write('WARN', tag, message);
    }

    info(tag, message) {
        if (this.logLevel >= 3) this._write('INFO', tag, message);
    }

    debug(tag, message) {
        if (this.logLevel >= 4) this._write('DEBUG', tag, message);
    }
}

window.Logger = new LoggerBase();
