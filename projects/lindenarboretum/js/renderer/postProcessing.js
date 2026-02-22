/**
 * LindenArboretum - Post Processing Module
 * Currently implemented mostly via CSS overlays (`#scanline-overlay`),
 * but this module reserves the ability to do Canvas ImageData manipulation
 * if Chromatic Aberration or specific CRT blurring is desired.
 */

import { canvasManager } from './canvas.js';
import { contextManager } from './context.js';

export const postProcessor = {
    enabled: false, // Turned off by default for performance
    blurAmount: 2,

    /**
     * Applies post processing to the canvas (e.g., chromatic aberration).
     * Note: Direct pixel manipulation is slow and heavily caps max L-System depths.
     * We favor CSS solutions, but this is here for the true "alien" feel if needed.
     */
    applyFilters() {
        if (!this.enabled) return;
        if (!contextManager.ctx) return;

        const w = canvasManager.canvas.width;
        const h = canvasManager.canvas.height;
        const ctx = contextManager.ctx;

        // Optional: we can draw a slight radial vignette over the context
        const gradient = ctx.createRadialGradient(
            w / 2, h / 2, h * 0.1,
            w / 2, h / 2, h
        );
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.8)');

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform to cover exact screen
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
    }
};
