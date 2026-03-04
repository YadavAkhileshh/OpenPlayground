/**
 * Window Draggable Behavior
 */
class Draggable {
    constructor(element, handle) {
        this.element = element;
        this.handle = handle || element;
        this.isDragging = false;

        this.offsetX = 0;
        this.offsetY = 0;

        this.boundStart = this.onDragStart.bind(this);
        this.boundMove = this.onDragMove.bind(this);
        this.boundEnd = this.onDragEnd.bind(this);

        this.handle.addEventListener('mousedown', this.boundStart);
    }

    onDragStart(e) {
        if (e.target.tagName === 'BUTTON' || e.target.classList.contains('no-drag')) return;
        if (this.element.classList.contains('maximized')) return;

        this.isDragging = true;

        EventBus.emit(CONSTANTS.EVENTS.UI_WINDOW_FOCUS, this.element.id);

        const rect = this.element.getBoundingClientRect();
        this.offsetX = e.clientX - rect.left;
        this.offsetY = e.clientY - rect.top;

        document.addEventListener('mousemove', this.boundMove);
        document.addEventListener('mouseup', this.boundEnd);
    }

    onDragMove(e) {
        if (!this.isDragging) return;

        let newX = e.clientX - this.offsetX;
        let newY = e.clientY - this.offsetY;

        // Boundaries
        newY = Math.max(0, newY);
        // Dont let window go completely off screen
        newX = Math.max(-this.element.offsetWidth + 50, Math.min(window.innerWidth - 50, newX));
        newY = Math.min(window.innerHeight - CONSTANTS.TASKBAR_HEIGHT - 30, newY);

        this.element.style.left = `${newX}px`;
        this.element.style.top = `${newY}px`;
        this.element.style.transform = `none`; // Clear any centered transforms
    }

    onDragEnd() {
        this.isDragging = false;
        document.removeEventListener('mousemove', this.boundMove);
        document.removeEventListener('mouseup', this.boundEnd);
    }

    destroy() {
        this.handle.removeEventListener('mousedown', this.boundStart);
    }
}

window.Draggable = Draggable;
