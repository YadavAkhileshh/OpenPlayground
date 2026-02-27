/**
 * Canvas Controller Module
 * 
 * Manages the HTML5 Canvas element:
 * - Initialization
 * - Resizing logic (keeping aspect ratio or filling screen)
 * - Exposing the 2D Context
 */

export class CanvasController {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`Canvas element with ID '${canvasId}' not found.`);
            return;
        }
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

        // Internal resolution (actual pixel count) vs CSS size
        this.resolution = { width: 640, height: 480 };

        this.init();
    }

    init() {
        window.addEventListener('resize', () => this.handleResize());
        this.handleResize();
    }

    /**
     * Resize handler.
     * Strategies:
     * 1. Fit to container (css handles display size, we set logical size).
     * 2. Monitor container size and update logical size if needed.
     * 
     * For retro vibe, we might want a fixed low resolution scaled up by CSS 'pixelated'.
     * However, to support webcam properly, we should match the source resolution
     * or a target fixed resolution like 640x480 or 800x600.
     */
    handleResize() {
        const parent = this.canvas.parentElement;
        if (!parent) return;

        // Visual size matches parent container
        const rect = parent.getBoundingClientRect();

        // We actually want to keep the canvas internal resolution fixed or matching source,
        // but for now let's maximize it to the container for sharpness,
        // then the style 'image-rendering: pixelated' will handle the aesthetic if we scale down.
        // BUT, pixel manipulation on 4k screens is slow strictly in JS.
        // So we should cap resolution for performance.

        const MAX_WIDTH = 800;
        const aspectRatio = rect.width / rect.height;

        let targetWidth = rect.width;
        let targetHeight = rect.height;

        // Downscale if too large for JS performance
        if (targetWidth > MAX_WIDTH) {
            targetWidth = MAX_WIDTH;
            targetHeight = targetWidth / aspectRatio;
        }

        this.canvas.width = Math.floor(targetWidth);
        this.canvas.height = Math.floor(targetHeight);

        // Notify any listeners if we add them, or simply update state if needed.
    }

    /**
     * Set explicit resolution (e.g., matching webcam input).
     * @param {number} width 
     * @param {number} height 
     */
    setResolution(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.resolution = { width, height };
    }

    getContext() {
        return this.ctx;
    }

    clear() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
