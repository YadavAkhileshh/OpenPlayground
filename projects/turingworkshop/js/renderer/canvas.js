/**
 * Canvas management module.
 * 
 * This class handles the low-level interaction with the HTML Canvas element.
 * It manages context retrieval, resizing logic, and buffer access.
 * 
 * @module Renderer/Canvas
 */

export class CanvasManager {
    /**
     * @param {string} canvasId - The ID of the canvas element in the DOM.
     * @param {number} width - The internal resolution width.
     * @param {number} height - The internal resolution height.
     */
    constructor(canvasId, width, height) {
        this.canvas = document.getElementById(canvasId);
        // Alpha false for slight performance gain as we don't need transparency
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.width = width;
        this.height = height;

        // Set internal resolution matches the simulation grid
        this.canvas.width = width;
        this.canvas.height = height;

        // Handle window resizing
        // Note: We keep internal resolution fixed, but CSS scales it up.
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    /**
     * Handles browser resize events.
     * Currently a placeholder for future dynamic resolution scaling.
     */
    resize() {
        // The internal resolution remains fixed (for the simulation grid)
        // But we want it to fit the viewport container logic is in CSS
        // This method can be expanded if we support dynamic grid resizing
    }

    /**
     * Creates and returns a new ImageData object.
     * @returns {ImageData}
     */
    getImageData() {
        return this.ctx.createImageData(this.width, this.height);
    }

    /**
     * Pushes the pixel data buffer to the canvas.
     * @param {ImageData} imageData 
     */
    putImageData(imageData) {
        this.ctx.putImageData(imageData, 0, 0);
    }
}
