export class ConsoleWindow {
    constructor(container) {
        this.container = container;
        this.output = container.querySelector('#console-output');
        this.btnToggle = container.querySelector('#btn-toggle-console');
        this.header = container.querySelector('.console-header');

        this.bindEvents();
    }

    bindEvents() {
        this.header.addEventListener('click', () => {
            this.container.classList.toggle('minimized');
        });
    }

    log(message, type = 'info') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;

        let msgStr = typeof message === 'object' ? JSON.stringify(message, null, 2) : String(message);

        const time = new Date().toLocaleTimeString();
        entry.textContent = `[${time}] ${msgStr}`;

        this.output.appendChild(entry);
        this.output.scrollTop = this.output.scrollHeight;

        // Auto open if it's an error and we are minimized
        if (type === 'error' && this.container.classList.contains('minimized')) {
            this.container.classList.remove('minimized');
        }
    }

    clear() {
        this.output.innerHTML = '';
    }
}
