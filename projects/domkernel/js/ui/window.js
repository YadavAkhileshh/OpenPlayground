/**
 * System Window Component
 */
class SystemWindow {
    constructor(options = {}) {
        this.id = 'win_' + Utils.generateUUID().substring(0, 8);
        this.title = options.title || 'Window';
        this.width = options.width || 600;
        this.height = options.height || 400;
        this.x = options.x || Math.floor(Math.random() * 100 + 50);
        this.y = options.y || Math.floor(Math.random() * 100 + 50);
        this.icon = options.icon || '';
        this.appClass = options.appClass || null;

        this.element = null;
        this.contentElement = null;

        this.isMaximized = false;
        this.preMaxRect = null;

        this.draggable = null;
        this.resizable = null;
        this.appInstance = null;

        this.render();
    }

    render() {
        this.element = document.createElement('div');
        this.element.id = this.id;
        this.element.className = 'window';
        this.element.style.width = this.width + 'px';
        this.element.style.height = this.height + 'px';
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';

        // Header
        const header = document.createElement('div');
        header.className = 'window-header draggable';

        const titleArea = document.createElement('div');
        titleArea.className = 'window-title';
        if (this.icon) {
            // Simplified icon inject
            titleArea.innerHTML = `<svg width="14" height="14" fill="var(--cyan)" viewBox="0 0 24 24"><path d="${this.icon}"/></svg>`;
        }
        const titleText = document.createElement('span');
        titleText.textContent = this.title;
        titleArea.appendChild(titleText);

        const controls = document.createElement('div');
        controls.className = 'window-controls';

        const btnMin = document.createElement('button');
        btnMin.className = 'win-btn btn-minimize';
        btnMin.onclick = (e) => { e.stopPropagation(); this.minimize(); };

        const btnMax = document.createElement('button');
        btnMax.className = 'win-btn btn-maximize';
        btnMax.onclick = (e) => { e.stopPropagation(); this.toggleMaximize(); };

        const btnClose = document.createElement('button');
        btnClose.className = 'win-btn btn-close';
        btnClose.onclick = (e) => { e.stopPropagation(); this.close(); };

        controls.appendChild(btnMin);
        controls.appendChild(btnMax);
        controls.appendChild(btnClose);

        header.appendChild(titleArea);
        header.appendChild(controls);

        header.ondblclick = () => this.toggleMaximize();

        // Content Area
        this.contentElement = document.createElement('div');
        this.contentElement.className = 'window-content';

        this.element.appendChild(header);
        this.element.appendChild(this.contentElement);

        // Behaviors
        this.draggable = new Draggable(this.element, header);
        this.resizable = new Resizable(this.element);

        // Focus click hook
        this.element.addEventListener('mousedown', () => {
            EventBus.emit(CONSTANTS.EVENTS.UI_WINDOW_FOCUS, this.id);
        });

        document.getElementById('window-manager').appendChild(this.element);
        EventBus.emit(CONSTANTS.EVENTS.UI_WINDOW_OPEN, this);
        EventBus.emit(CONSTANTS.EVENTS.UI_WINDOW_FOCUS, this.id);
    }

    mountApp(AppClass, args = []) {
        if (this.appInstance && this.appInstance.destroy) {
            this.appInstance.destroy();
        }
        this.appInstance = new AppClass(this, ...args);
    }

    toggleMaximize() {
        if (this.isMaximized) {
            this.element.classList.remove('maximized');
            this.isMaximized = false;
        } else {
            this.element.classList.add('maximized');
            this.isMaximized = true;
        }
        EventBus.emit('ui:window:resized', this.id);
    }

    minimize() {
        this.element.classList.add('hidden');
        EventBus.emit('ui:window:minimized', this.id);
    }

    restore() {
        this.element.classList.remove('hidden');
        EventBus.emit(CONSTANTS.EVENTS.UI_WINDOW_FOCUS, this.id);
    }

    close() {
        if (this.appInstance && this.appInstance.destroy) {
            this.appInstance.destroy();
        }
        this.draggable.destroy();
        this.resizable.destroy();
        this.element.remove();
        EventBus.emit(CONSTANTS.EVENTS.UI_WINDOW_CLOSE, this.id);
    }

    focus() {
        this.element.classList.add('focused');
    }

    blur() {
        this.element.classList.remove('focused');
    }
}

window.SystemWindow = SystemWindow;
