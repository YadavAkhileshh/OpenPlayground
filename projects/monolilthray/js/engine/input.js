/**
 * @file input.js
 * @description Handles mouse and keyboard input for the camera.
 */

class Input {
    constructor(element) {
        this.element = element;

        // State
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;

        this.deltaX = 0;
        this.deltaY = 0;

        this.zoom = 0;

        this.initListeners();
    }

    initListeners() {
        this.element.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastX = e.clientX;
            this.lastY = e.clientY;
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;

            this.deltaX = e.clientX - this.lastX;
            this.deltaY = e.clientY - this.lastY;

            this.lastX = e.clientX;
            this.lastY = e.clientY;
        });

        this.element.addEventListener('wheel', (e) => {
            this.zoom += e.deltaY * 0.01;
        });
    }

    /**
     * Consumes the current deltas and resets them.
     */
    getDelta() {
        const d = { x: this.deltaX, y: this.deltaY, zoom: this.zoom };
        this.deltaX = 0;
        this.deltaY = 0;
        this.zoom = 0;
        return d;
    }
}
