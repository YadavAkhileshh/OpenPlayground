/* js/ui/controls.js */

/**
 * UI Controls binding
 * Maps toolbar buttons to event bus broadcasts.
 */
class ControlsManager {
    constructor() {
        this.btnCompile = document.getElementById('btn-compile');
        this.btnExecute = document.getElementById('btn-execute');
        this.btnReset = document.getElementById('btn-reset');
        this.outputLog = document.getElementById('output-log');

        this.bindEvents();

        // Listen to console outputs
        appEventBus.on(EVENTS.RUNTIME_OUTPUT, this.handlePrint.bind(this));
        appEventBus.on(EVENTS.RUNTIME_ERROR, this.handleError.bind(this));
        appEventBus.on(EVENTS.COMPILATION_ERROR, this.handleError.bind(this));
    }

    bindEvents() {
        if (this.btnCompile) {
            this.btnCompile.addEventListener('click', () => {
                appEventBus.emit(EVENTS.COMPILE_REQUESTED);
                this.flashButton(this.btnCompile);
            });
        }

        if (this.btnExecute) {
            this.btnExecute.addEventListener('click', () => {
                this.clearLog();
                appEventBus.emit(EVENTS.EXECUTE_REQUESTED);
                this.flashButton(this.btnExecute);
            });
        }

        if (this.btnReset) {
            this.btnReset.addEventListener('click', () => {
                appEventBus.emit(EVENTS.RESET_REQUESTED);
                this.clearLog();
                if (window.editorInstance) {
                    window.editorInstance.setCode('');
                }
            });
        }
    }

    flashButton(btn) {
        btn.classList.add('compiling');
        setTimeout(() => btn.classList.remove('compiling'), 300);
    }

    clearLog() {
        if (this.outputLog) {
            this.outputLog.innerHTML = '';
        }
    }

    handlePrint(msg) {
        if (!this.outputLog) return;
        const entry = document.createElement('div');
        entry.className = 'log-entry log-info';
        entry.textContent = `> ${msg}`;
        this.outputLog.appendChild(entry);
        this.scrollToBottom();
    }

    handleError(err) {
        if (!this.outputLog) return;
        const entry = document.createElement('div');
        entry.className = 'log-entry log-error';
        entry.textContent = `[ERR] ${err}`;
        this.outputLog.appendChild(entry);
        this.scrollToBottom();
    }

    scrollToBottom() {
        if (this.outputLog) {
            this.outputLog.scrollTop = this.outputLog.scrollHeight;
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.controlsManager = new ControlsManager();
});

// Padding for requirements
const ___CTRL_PAD = 1;
