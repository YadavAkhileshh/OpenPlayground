/**
 * LindenArboretum - Context Wrapper
 * Exposes the standard CanvasRenderingContext2D.
 * Adds helpers to manage transformations handling DPI.
 */

import { canvasManager } from './canvas.js';

export const contextManager = {
    /** @type {CanvasRenderingContext2D} */
    ctx: null,

    init() {
        if (!canvasManager.canvas) throw new Error("Canvas not initialized first");

        const contextOptions = {
            alpha: false,       // Optimization: we will draw an opaque background anyway
            desynchronized: true // Hints to OS to reduce latency
        };

        this.ctx = canvasManager.canvas.getContext('2d', contextOptions);
        return this.ctx;
    },

    /**
     * Clears the screen with a deep void color based on css variables.
     */
    clearScreen() {
        if (!this.ctx) return;

        const w = canvasManager.canvas.width;
        const h = canvasManager.canvas.height;

        // Use CSS variable calculation via a quick DOM style read, or hardcode the void
        // Fetching CSS var every frame is slow so we assume a very dark gray/green
        // Or rely on colorProfile.js to dictate the background.

        // Let's grab the actual computed body bg color
        const bgColor = getComputedStyle(document.body).getPropertyValue('background-color');

        this.ctx.fillStyle = bgColor || '#010f08';
        this.ctx.fillRect(0, 0, w, h);
    },

    /**
     * Applies the global Device Pixel Ratio scale so all drawing commands
     * work in CSS coordinates but render sharply.
     */
    applyDPRScale() {
        this.ctx.scale(canvasManager.dpr, canvasManager.dpr);
    }
};
