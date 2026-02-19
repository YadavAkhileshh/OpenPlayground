/**
 * CanvasRenderer.js
 * 
 * High-performance procedural static noise generator for CRT simulation.
 * Optimized using Uint32Array for direct pixel manipulation.
 * 
 * FEATURES:
 * - Direct pixel access for 60fps noise generation
 * - Phosphor color tinting
 * - Glitch/Distortion effects
 * - Integration with advanced render filters (Ghosting, Hold)
 */

import { RenderFilters } from './filters.js';

export class CanvasRenderer {
    /**
     * @param {string} canvasId - Element ID of the target canvas
     */
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', {
            alpha: false,
            desynchronized: true // Performance hint
        });

        this.width = 0;
        this.height = 0;

        // Pixel buffers
        this.imageData = null;
        this.pixels = null;

        // Cache for ghosting
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');

        this.setupCanvas();
        window.addEventListener('resize', () => this.handleResize());
    }

    /**
     * Initializes the canvas resolution and pre-allocates buffers.
     */
    setupCanvas() {
        // We render at 50% resolution for that authentic lo-fi retro feel
        // and significant performance gains on high-DPI displays.
        const scale = 0.5;
        this.width = Math.floor(this.canvas.clientWidth * scale);
        this.height = Math.floor(this.canvas.clientHeight * scale);

        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.offscreenCanvas.width = this.width;
        this.offscreenCanvas.height = this.height;

        this.imageData = this.ctx.createImageData(this.width, this.height);
        this.pixels = new Uint32Array(this.imageData.data.buffer);

        // Clear initial state
        this.clear();
    }

    handleResize() {
        this.setupCanvas();
    }

    /**
     * Generates and draws a frame of static noise.
     * @param {Object} state - Current application state
     */
    render(state) {
        const { signalStrength, tuning, settings } = state;
        const len = this.pixels.length;

        // 1. Calculate base noise intensity based on signal strength
        // A signal strength of 1.0 means almost crystal clear image.
        const intensity = 1.0 - (signalStrength * 0.98);

        // 2. Select tint based on theme
        const tint = this.getThemeTint(settings.theme);

        // 3. Procedural Inner Loop (Hot Path)
        for (let i = 0; i < len; i++) {
            // Fast random grayscale
            const baseVal = Math.random() * 255 * intensity;

            // Apply signal clarity offset: as signal increases, 
            // the background becomes more deterministic/stable.
            const noiseVal = baseVal + (signalStrength * 10);

            // Compose ARGB (Little Endian: RRGGBBAA)
            // We use bitwise operations to pack the 32-bit pixel.
            let r = noiseVal * tint.r;
            let g = noiseVal * tint.g;
            let b = noiseVal * tint.b;

            // Contrast/Brightness adjustments
            r = (r - 128) * settings.contrast + 128 + (settings.brightness - 1) * 50;
            g = (g - 128) * settings.contrast + 128 + (settings.brightness - 1) * 50;
            b = (b - 128) * settings.contrast + 128 + (settings.brightness - 1) * 50;

            this.pixels[i] =
                (255 << 24) |            // Alpha
                ((b & 0xff) << 16) |
                ((g & 0xff) << 8) |
                (r & 0xff);
        }

        // 4. Update the main canvas
        this.ctx.putImageData(this.imageData, 0, 0);

        // 5. Apply Secondary Layer Filters
        if (settings.hHold !== 0) {
            RenderFilters.applyHorizontalHold(this.ctx, this.width, this.height, settings.hHold);
        }

        if (settings.vHold !== 0) {
            RenderFilters.applyVerticalHold(this.ctx, this.width, this.height, settings.vHold);
        }

        // Handle Ghosting (Persistence)
        if (settings.ghosting > 0) {
            RenderFilters.applyGhosting('ghost-layer', this.canvas, settings.ghosting);
        }
    }

    /**
     * Maps theme names to RGB multipliers.
     */
    getThemeTint(theme) {
        switch (theme) {
            case 'amber': return { r: 1.0, g: 0.8, b: 0.2 };
            case 'blue': return { r: 0.2, g: 0.7, b: 1.0 };
            case 'bw': return { r: 1.0, g: 1.0, b: 1.0 };
            case 'green':
            default: return { r: 0.4, g: 1.0, b: 0.4 };
        }
    }

    /**
     * Applies a non-linear glitch artifact.
     */
    applyGlitch(amount) {
        if (amount <= 0) return;

        const sliceCount = Math.floor(amount * 15);
        for (let i = 0; i < sliceCount; i++) {
            const h = Math.random() * (this.height * 0.1) + 1;
            const y = Math.random() * (this.height - h);
            const xShift = (Math.random() - 0.5) * amount * 100;

            this.ctx.drawImage(
                this.canvas,
                0, y, this.width, h,
                xShift, y, this.width, h
            );
        }
    }

    /**
     * Clears the screen to deep black.
     */
    clear() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
}
