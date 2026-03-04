/**
 * @file input.js
 * @description Handles user input (Mouse, Touch) for interacting with the 4D object.
 * Maps 2D screen gestures to 4D rotation parameters.
 */

export class Input {
    constructor(canvas) {
        this.canvas = canvas;

        // State
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;
        this.deltaX = 0;
        this.deltaY = 0;

        this.sensitivity = 0.01;

        // Event Listeners
        this.initListeners();
    }

    initListeners() {
        // Mouse Events
        this.canvas.addEventListener('mousedown', (e) => this.onStart(e.clientX, e.clientY));
        window.addEventListener('mousemove', (e) => this.onMove(e.clientX, e.clientY));
        window.addEventListener('mouseup', () => this.onEnd());

        // Touch Events
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) this.onStart(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) this.onMove(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: false });

        window.addEventListener('touchend', () => this.onEnd());
    }

    onStart(x, y) {
        this.isDragging = true;
        this.lastX = x;
        this.lastY = y;
        this.deltaX = 0;
        this.deltaY = 0;
    }

    onMove(x, y) {
        if (!this.isDragging) return;

        this.deltaX = (x - this.lastX) * this.sensitivity;
        this.deltaY = (y - this.lastY) * this.sensitivity;

        this.lastX = x;
        this.lastY = y;
    }

    onEnd() {
        this.isDragging = false;
        // Damping could be added here later
        this.deltaX = 0;
        this.deltaY = 0;
    }

    /**
     * Returns the current rotation deltas and resets them (if not continuous).
     * For now, we act on immediate deltas.
     */
    getDeltas() {
        return { x: this.deltaX, y: this.deltaY };
    }
}
