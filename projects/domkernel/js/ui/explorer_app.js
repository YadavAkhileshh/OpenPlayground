/**
 * File Explorer Application
 */
class ExplorerApp {
    constructor(winRef = null) {
        if (!winRef) {
            this.window = new SystemWindow({
                title: 'File Explorer',
                width: 700,
                height: 500,
                icon: 'M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z'
            });
            this.window.mountApp(ExplorerApp, [this.window]);
            return this.window.appInstance;
        }

        this.window = winRef;
        this.currentPath = '/';
        this.history = ['/'];
        this.historyIdx = 0;

        this.container = null;
        this.mainArea = null;
        this.pathBar = null;

        this.iconsStore = {
            dir: 'M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z',
            file: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
            exec: 'M8 5v14l11-7z'
        };

        this.render();
        this.loadDirectory(this.currentPath);

        EventBus.on(CONSTANTS.EVENTS.FS_CREATED, () => this.refresh());
        EventBus.on(CONSTANTS.EVENTS.FS_DELETED, () => this.refresh());
    }

    render() {
        this.container = UIRenderer.h('div', { className: 'explorer-app' });

        // Toolbar
        const btnBack = UIRenderer.h('button', { className: 'exp-btn', title: 'Back', onclick: () => this.goBack() }, '←');
        const btnFwd = UIRenderer.h('button', { className: 'exp-btn', title: 'Forward', onclick: () => this.goForward() }, '→');
        const btnUp = UIRenderer.h('button', { className: 'exp-btn', title: 'Up', onclick: () => this.goUp() }, '↑');

        this.pathBar = UIRenderer.h('div', { className: 'exp-path-bar' }, this.currentPath);

        const toolbar = UIRenderer.h('div', { className: 'exp-toolbar' }, btnBack, btnFwd, btnUp, this.pathBar);

        // Content Area
        const content = UIRenderer.h('div', { className: 'exp-content' });

        // Sidebar (Quick Access)
        const sidebar = UIRenderer.h('div', { className: 'exp-sidebar' },
            this.createSidebarItem('Root', '/', 'dir'),
            this.createSidebarItem('Home', '/home/user', 'dir'),
            this.createSidebarItem('Binaries', '/bin', 'dir')
        );

        // Main view
        this.mainArea = UIRenderer.h('div', { className: 'exp-main' });

        content.appendChild(sidebar);
        content.appendChild(this.mainArea);

        this.container.appendChild(toolbar);
        this.container.appendChild(content);

        UIRenderer.mount(this.window.contentElement, this.container);
    }

    createSidebarItem(label, path, iconType) {
        return UIRenderer.h('div', {
            className: 'exp-side-item',
            onclick: () => this.navigateTo(path)
        },
            UIRenderer.h('svg', { viewBox: '0 0 24 24', width: '16', height: '16', fill: 'var(--cyan)' },
                UIRenderer.h('path', { d: this.iconsStore[iconType] })
            ),
            label);
    }

    async loadDirectory(path) {
        try {
            const stat = await window.VfsInstance.stat(path);
            if (stat.type !== CONSTANTS.FILE_TYPES.DIRECTORY) return;

            this.currentPath = path;
            this.pathBar.textContent = path;
            this.window.title = `Explorer - ${path}`;
            this.window.element.querySelector('.window-title span').textContent = this.window.title;

            this.mainArea.innerHTML = '';

            const entries = await window.VfsInstance.readdir(path);

            for (const entry of entries) {
                const entryPath = PathUtils.join(path, entry);
                const entryStat = await window.VfsInstance.stat(entryPath);

                let iconType = 'file';
                if (entryStat.type === CONSTANTS.FILE_TYPES.DIRECTORY) iconType = 'dir';
                else if (entryStat.type === CONSTANTS.FILE_TYPES.EXECUTABLE) iconType = 'exec';

                const itemEl = UIRenderer.h('div', { className: 'exp-item' },
                    UIRenderer.h('svg', { className: 'exp-icon', viewBox: '0 0 24 24' },
                        UIRenderer.h('path', { d: this.iconsStore[iconType] })
                    ),
                    UIRenderer.h('div', { className: 'exp-name' }, entry)
                );

                itemEl.ondblclick = () => {
                    if (iconType === 'dir') {
                        this.navigateTo(entryPath);
                    } else {
                        // Action for files
                        window.Logger.info('Explorer', `Open file: ${entryPath}`);
                    }
                };

                itemEl.onclick = () => {
                    // Selection logic
                    const siblings = this.mainArea.querySelectorAll('.exp-item');
                    siblings.forEach(s => s.classList.remove('selected'));
                    itemEl.classList.add('selected');
                };

                this.mainArea.appendChild(itemEl);
            }
        } catch (e) {
            window.Logger.error('Explorer', `Failed to load directory ${path}: ${e.message}`);
        }
    }

    navigateTo(path) {
        if (this.currentPath === path) return;

        // Truncate forward history if we navigated somewhere new
        this.history = this.history.slice(0, this.historyIdx + 1);
        this.history.push(path);
        this.historyIdx++;

        this.loadDirectory(path);
    }

    goBack() {
        if (this.historyIdx > 0) {
            this.historyIdx--;
            this.loadDirectory(this.history[this.historyIdx]);
        }
    }

    goForward() {
        if (this.historyIdx < this.history.length - 1) {
            this.historyIdx++;
            this.loadDirectory(this.history[this.historyIdx]);
        }
    }

    goUp() {
        if (this.currentPath !== '/') {
            const parent = PathUtils.dirname(this.currentPath);
            this.navigateTo(parent);
        }
    }

    refresh() {
        this.loadDirectory(this.currentPath);
    }

    destroy() {
        // Cleanup subscriptions conceptually
    }
}

window.ExplorerApp = ExplorerApp;
