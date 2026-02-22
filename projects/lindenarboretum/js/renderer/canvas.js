/**
 * LindenArboretum - Canvas Setup Module
 * Handles canvas DOM attachment, resizing, and pixel density scaling.
 */

export const canvasManager = {
    /** @type {HTMLCanvasElement} */
    canvas: null,
    width: 0,
    height: 0,
    dpr: 1, // Device Pixel Ratio for sharp rendering on high-DPI screens

    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) throw new Error("Canvas element not found");

        // Window resize binding
        window.addEventListener('resize', this.onResize.bind(this));

        // Initial setup
        this.onResize();

        return this.canvas;
    },

    onResize() {
        if (!this.canvas) return;

        this.dpr = window.devicePixelRatio || 1;

        // We use innerWidth / innerHeight because our canvas is fullscreen
        const w = window.innerWidth;
        const h = window.innerHeight;

        this.width = w;
        this.height = h;

        // Scale canvas visual size
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';

        // Scale internal rendering resolution
        this.canvas.width = w * this.dpr;
        this.canvas.height = h * this.dpr;
    },

    /**
     * Returns the center coordinate of the screen.
     * @returns {{x: number, y: number}}
     */
    getCenter() {
        return {
            x: this.width / 2,
            y: this.height / 2
        };
    },

    /**
     * Returns a suggested root planting position (bottom center).
     */
    getRootPosition() {
        return {
            x: this.width / 2,
            y: this.height - 100 // 100px padding from the bottom
        };
    }
};
