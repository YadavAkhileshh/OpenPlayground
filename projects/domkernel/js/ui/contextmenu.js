/**
 * System-Wide Context Menu
 */
class ContextMenu {
    constructor() {
        this.menu = document.getElementById('context-menu');
        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('contextmenu', (e) => {
            // Prevent default browser menu
            e.preventDefault();

            // Check context target
            if (e.target.closest('.window-content') && !e.target.closest('.desktop-icons')) {
                // If it's inside an app, we might want to delegate or just hide
                this.hide();
                return;
            }

            this.showDesktopMenu(e.clientX, e.clientY);
        });

        document.addEventListener('mousedown', (e) => {
            if (!this.menu.contains(e.target)) {
                this.hide();
            }
        });
    }

    showDesktopMenu(x, y) {
        this.menu.innerHTML = '';

        const items = [
            { label: 'New Terminal', action: () => new TerminalApp() },
            { label: 'New Explorer', action: () => new ExplorerApp() },
            { separator: true },
            { label: 'Refresh', action: () => location.reload() },
            { label: 'System Properties', shortcut: 'Win+Pause', disabled: true }
        ];

        items.forEach(item => {
            if (item.separator) {
                const sep = document.createElement('div');
                sep.className = 'context-separator';
                this.menu.appendChild(sep);
                return;
            }

            const el = document.createElement('div');
            el.className = 'context-item';
            if (item.disabled) el.classList.add('disabled');

            el.innerHTML = `<span>${item.label}</span>`;
            if (item.shortcut) el.innerHTML += `<span class="context-shortcut">${item.shortcut}</span>`;

            if (!item.disabled) {
                el.onclick = (e) => {
                    e.stopPropagation();
                    this.hide();
                    if (item.action) item.action();
                };
            }

            this.menu.appendChild(el);
        });

        this.menu.classList.remove('hidden');

        // Adjust bounds
        const rect = this.menu.getBoundingClientRect();
        let posX = x;
        let posY = y;

        if (x + rect.width > window.innerWidth) posX = window.innerWidth - rect.width - 5;
        if (y + rect.height > window.innerHeight) posY = window.innerHeight - rect.height - 5;

        this.menu.style.left = posX + 'px';
        this.menu.style.top = posY + 'px';
    }

    hide() {
        this.menu.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.ContextMenuManager = new ContextMenu();
});
