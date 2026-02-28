/**
 * LindenArboretum - Camera Module
 * Supports panning around the fractal and zooming in/out smoothly.
 */

export const camera = {
    x: 0,
    y: 0,
    zoom: 1.0,
    targetX: 0,
    targetY: 0,
    targetZoom: 1.0,

    // Smoothness interpolation
    lerpFactor: 0.1,

    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,

    init(canvasElement) {
        // Bind event listeners for panning and zooming
        canvasElement.addEventListener('mousedown', this.onMouseDown.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        canvasElement.addEventListener('wheel', this.onWheel.bind(this), { passive: false });

        // Touch support
        canvasElement.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
        window.addEventListener('touchend', this.onTouchEnd.bind(this));
        window.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    },

    update() {
        // Smooth interpolation towards targets
        this.x += (this.targetX - this.x) * this.lerpFactor;
        this.y += (this.targetY - this.y) * this.lerpFactor;
        this.zoom += (this.targetZoom - this.zoom) * this.lerpFactor;
    },

    applyTo(ctx) {
        // Context assumed to be scaled by DPR already from contextManager
        // Center zoom relative to screen center
        const w = window.innerWidth;
        const h = window.innerHeight;

        ctx.translate(w / 2, h / 2);
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(-w / 2 + this.x, -h / 2 + this.y);
    },

    resetToCenter() {
        this.targetX = 0;
        this.targetY = 0;
        this.targetZoom = 1.0;
    },

    /* --- Mouse Events --- */
    onMouseDown(e) {
        this.isDragging = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
    },

    onMouseUp(e) {
        this.isDragging = false;
    },

    onMouseMove(e) {
        if (!this.isDragging) return;

        const dx = (e.clientX - this.lastMouseX) / this.zoom;
        const dy = (e.clientY - this.lastMouseY) / this.zoom;

        this.targetX += dx;
        this.targetY += dy;

        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
    },

    onWheel(e) {
        e.preventDefault(); // Stop page scroll

        const zoomIntensity = 0.1;
        const wheel = e.deltaY < 0 ? 1 : -1;

        let newZoom = this.targetZoom * Math.exp(wheel * zoomIntensity);

        // Clamp zoom
        if (newZoom < 0.1) newZoom = 0.1;
        if (newZoom > 10.0) newZoom = 10.0;

        this.targetZoom = newZoom;
    },

    /* --- Touch Events --- */
    onTouchStart(e) {
        if (e.touches.length === 1) {
            this.isDragging = true;
            this.lastMouseX = e.touches[0].clientX;
            this.lastMouseY = e.touches[0].clientY;
        }
    },

    onTouchEnd(e) {
        this.isDragging = false;
    },

    onTouchMove(e) {
        if (!this.isDragging || e.touches.length !== 1) return;
        e.preventDefault();

        const dx = (e.touches[0].clientX - this.lastMouseX) / this.zoom;
        const dy = (e.touches[0].clientY - this.lastMouseY) / this.zoom;

        this.targetX += dx;
        this.targetY += dy;

        this.lastMouseX = e.touches[0].clientX;
        this.lastMouseY = e.touches[0].clientY;
    }
};
