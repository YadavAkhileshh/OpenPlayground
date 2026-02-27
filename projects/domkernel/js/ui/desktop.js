/**
 * Desktop Environment Manager
 */
class Desktop {
    constructor() {
        this.container = document.getElementById('desktop-icons');
        this.mainContainer = document.getElementById('desktop');
        this.icons = [
            { name: 'Terminal', icon: 'M4 4h16v16H4V4zm2 4v2h2V8H6zm0 4v2h6v-2H6z', action: () => new TerminalApp() },
            { name: 'System Monitor', icon: 'M3 3v18h18v-2H5V3H3zm6 14l-2-4h2l2 4h-2zm4 0l-2-6h2l2 6h-2zm4 0l-2-8h2l2 8h-2z', action: () => new MonitorApp() },
            { name: 'File Explorer', icon: 'M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z', action: () => new ExplorerApp() }
        ];

        this.selectedIcon = null;

        EventBus.on(CONSTANTS.EVENTS.SYS_BOOT_DONE, () => this.init());
    }

    init() {
        this.renderIcons();

        this.mainContainer.addEventListener('mousedown', (e) => {
            if (e.target === this.container || e.target === this.mainContainer) {
                this.clearSelection();
            }
        });
    }

    renderIcons() {
        this.container.innerHTML = '';
        this.icons.forEach(item => {
            const el = document.createElement('div');
            el.className = 'desktop-icon';

            const svg = `<svg class="d-icon-svg" viewBox="0 0 24 24"><path d="${item.icon}"/></svg>`;

            el.innerHTML = `${svg}<span>${item.name}</span>`;

            el.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                this.selectIcon(el);
            });

            el.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                item.action();
                this.clearSelection();
            });

            this.container.appendChild(el);
        });
    }

    selectIcon(el) {
        this.clearSelection();
        this.selectedIcon = el;
        el.classList.add('selected');
    }

    clearSelection() {
        if (this.selectedIcon) {
            this.selectedIcon.classList.remove('selected');
            this.selectedIcon = null;
        }
    }
}

window.DesktopManager = new Desktop();
