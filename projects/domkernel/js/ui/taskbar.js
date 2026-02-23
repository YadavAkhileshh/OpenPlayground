/**
 * Taskbar & Start Menu Manager
 */
class Taskbar {
    constructor() {
        this.appContainer = document.getElementById('taskbar-apps');
        this.timeDisplay = document.getElementById('tray-time');
        this.startBtn = document.getElementById('start-button');
        this.startMenu = document.getElementById('start-menu');
        this.appsList = document.getElementById('start-app-list');

        this.openWindows = new Map(); // id -> button element

        this.bindEvents();
        this.updateTime();
        setInterval(() => this.updateTime(), 60000);
    }

    bindEvents() {
        EventBus.on(CONSTANTS.EVENTS.UI_WINDOW_OPEN, (win) => this.addApp(win));
        EventBus.on(CONSTANTS.EVENTS.UI_WINDOW_CLOSE, (id) => this.removeApp(id));
        EventBus.on(CONSTANTS.EVENTS.UI_WINDOW_FOCUS, (id) => this.setActiveApp(id));

        this.startBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.startMenu.classList.toggle('hidden');
        });

        document.addEventListener('mousedown', (e) => {
            if (!this.startMenu.contains(e.target) && !this.startBtn.contains(e.target)) {
                this.startMenu.classList.add('hidden');
            }
        });

        // Populate Start Menu
        const apps = [
            { name: 'Terminal', icon: 'M4 4h16v16H4V4zm2 4v2h2V8H6zm0 4v2h6v-2H6z', action: () => new TerminalApp() },
            { name: 'System Monitor', icon: 'M3 3v18h18v-2H5V3H3zm6 14l-2-4h2l2 4h-2zm4 0l-2-6h2l2 6h-2zm4 0l-2-8h2l2 8h-2z', action: () => new MonitorApp() },
            { name: 'File Explorer', icon: 'M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z', action: () => new ExplorerApp() }
        ];

        apps.forEach(app => {
            const li = document.createElement('li');
            li.innerHTML = `<svg class="start-app-icon" viewBox="0 0 24 24"><path d="${app.icon}"/></svg><span>${app.name}</span>`;
            li.onclick = () => {
                this.startMenu.classList.add('hidden');
                app.action();
            };
            this.appsList.appendChild(li);
        });
    }

    updateTime() {
        const now = new Date();
        let hours = now.getHours();
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const mins = now.getMinutes().toString().padStart(2, '0');

        this.timeDisplay.textContent = `${hours}:${mins} ${ampm}`;
    }

    addApp(win) {
        const btn = document.createElement('button');
        btn.className = 'taskbar-app';
        btn.textContent = win.title.length > 15 ? win.title.substring(0, 15) + '...' : win.title;
        btn.title = win.title;

        btn.onclick = () => {
            if (btn.classList.contains('active')) {
                win.minimize();
                btn.classList.remove('active');
            } else {
                win.restore();
            }
        };

        this.appContainer.appendChild(btn);
        this.openWindows.set(win.id, btn);
        this.setActiveApp(win.id);
    }

    removeApp(id) {
        const btn = this.openWindows.get(id);
        if (btn) {
            btn.remove();
            this.openWindows.delete(id);
        }
    }

    setActiveApp(id) {
        this.openWindows.forEach((btn, activeId) => {
            if (activeId === id) {
                btn.classList.add('active');
                const winEl = document.getElementById(activeId);
                if (winEl) {
                    winEl.classList.add('focused');
                    winEl.style.zIndex = ++window.SystemWindowManager.highestZ;
                }
            } else {
                btn.classList.remove('active');
                const winEl = document.getElementById(activeId);
                if (winEl) winEl.classList.remove('focused');
            }
        });
    }
}

// Simple Window Depth Tracker
window.SystemWindowManager = {
    highestZ: CONSTANTS?.Z_WINDOW_BASE || 10
};

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    window.TaskbarManager = new Taskbar();
});
