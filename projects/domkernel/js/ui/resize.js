/**
 * Window Resizable Behavior
 */
class Resizable {
    constructor(element) {
        this.element = element;
        this.isResizing = false;
        this.currentHandle = null;

        this.startX = 0;
        this.startY = 0;
        this.startW = 0;
        this.startH = 0;
        this.startL = 0;
        this.startT = 0;

        this.boundStart = this.onResizeStart.bind(this);
        this.boundMove = this.onResizeMove.bind(this);
        this.boundEnd = this.onResizeEnd.bind(this);

        this.handles = {};
        this.createHandles();
    }

    createHandles() {
        const directions = ['n', 'e', 's', 'w', 'nw', 'ne', 'se', 'sw'];
        directions.forEach(dir => {
            const h = document.createElement('div');
            h.className = `resize-handle resize-handle-${dir}`;
            h.dataset.dir = dir;
            h.addEventListener('mousedown', this.boundStart);
            this.element.appendChild(h);
            this.handles[dir] = h;
        });
    }

    onResizeStart(e) {
        if (this.element.classList.contains('maximized')) return;

        this.isResizing = true;
        this.currentHandle = e.target.dataset.dir;

        EventBus.emit(CONSTANTS.EVENTS.UI_WINDOW_FOCUS, this.element.id);

        const rect = this.element.getBoundingClientRect();
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.startW = rect.width;
        this.startH = rect.height;
        this.startL = rect.left;
        this.startT = rect.top;

        document.addEventListener('mousemove', this.boundMove);
        document.addEventListener('mouseup', this.boundEnd);

        // Prevent iframe/inner selections while resizing
        document.body.style.userSelect = 'none';
    }

    onResizeMove(e) {
        if (!this.isResizing) return;

        const dx = e.clientX - this.startX;
        const dy = e.clientY - this.startY;

        const dir = this.currentHandle;

        const minW = parseInt(window.getComputedStyle(this.element).minWidth) || 200;
        const minH = parseInt(window.getComputedStyle(this.element).minHeight) || 100;

        let newW = this.startW;
        let newH = this.startH;
        let newL = this.startL;
        let newT = this.startT;

        if (dir.includes('e')) newW = this.startW + dx;
        if (dir.includes('s')) newH = this.startH + dy;

        if (dir.includes('w')) {
            newW = this.startW - dx;
            if (newW >= minW) newL = this.startL + dx;
        }

        if (dir.includes('n')) {
            newH = this.startH - dy;
            if (newH >= minH) newT = this.startT + dy;
        }

        // Apply constraints iteratively to prevent strange jumps
        if (newW >= minW) {
            this.element.style.width = `${newW}px`;
            this.element.style.left = `${newL}px`;
        }

        if (newH >= minH) {
            this.element.style.height = `${newH}px`;
            this.element.style.top = `${newT}px`;
        }
    }

    onResizeEnd() {
        this.isResizing = false;
        document.removeEventListener('mousemove', this.boundMove);
        document.removeEventListener('mouseup', this.boundEnd);
        document.body.style.userSelect = '';
        EventBus.emit('ui:window:resized', this.element.id);
    }

    destroy() {
        Object.values(this.handles).forEach(h => {
            h.removeEventListener('mousedown', this.boundStart);
            h.remove();
        });
    }
}

window.Resizable = Resizable;
