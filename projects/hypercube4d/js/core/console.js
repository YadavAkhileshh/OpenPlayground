/**
 * @file console.js
 * @description A scientific system console for logging events.
 */

export class ScientificConsole {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        this.maxLines = 50;
        this.queue = [];

        if (!this.element) {
            console.warn(`Console element #${elementId} not found.`);
        } else {
            this.log("SYSTEM CONSOLE INITIALIZED");
        }
    }

    log(message) {
        this.addEntry(message, 'info');
    }

    warn(message) {
        this.addEntry(message, 'warn');
    }

    system(message) {
        this.addEntry(message, 'system');
    }

    addEntry(message, type = 'info') {
        if (!this.element) return;

        const entry = document.createElement('div');
        entry.className = `console-entry ${type}`;

        const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
        entry.innerHTML = `<span class="timestamp">[${timestamp}]</span> <span class="msg">${message}</span>`;

        this.element.appendChild(entry);

        // Auto scroll
        this.element.scrollTop = this.element.scrollHeight;

        // Prune
        while (this.element.children.length > this.maxLines) {
            this.element.removeChild(this.element.firstChild);
        }
    }
}

export const sysConsole = new ScientificConsole('sci-console');
