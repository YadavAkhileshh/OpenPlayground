/**
 * @file renderer.js
 * @description High-performance canvas renderer for the cell grid.
 */

import { PostProcessor } from './filters.js';

export class CanvasRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false });

        this.cellColor = '#00ff9f';
        this.bgColor = '#000000';

        this.postProcessor = new PostProcessor();

        // Internal buffer for rendering
        this.bufferCanvas = document.createElement('canvas');
        this.bufferCtx = this.bufferCanvas.getContext('2d', { alpha: false });
    }

    /**
     * Set display colors.
     */
    setColors(cell, bg) {
        this.cellColor = cell;
        this.bgColor = bg;
    }

    /**
     * Renders the grid efficiently by drawing to an offscreen buffer first.
     * @param {Uint8Array} grid
     * @param {number} width
     * @param {number} height
     */
    render(grid, width, height, filterOptions = {}) {
        if (this.bufferCanvas.width !== width || this.bufferCanvas.height !== height) {
            this.bufferCanvas.width = width;
            this.bufferCanvas.height = height;
        }

        const imgData = this.bufferCtx.createImageData(width, height);
        const data = imgData.data;

        // Extract RGB components for faster filling
        const cellRGB = this.hexToRgb(this.cellColor);
        const bgRGB = this.hexToRgb(this.bgColor);

        for (let i = 0; i < grid.length; i++) {
            const isAlive = grid[i] === 1;
            const targetRGB = isAlive ? cellRGB : bgRGB;
            const d = i * 4;

            data[d] = targetRGB.r;     // R
            data[d + 1] = targetRGB.g; // G
            data[d + 2] = targetRGB.b; // B
            data[d + 3] = 255;         // A
        }

        this.bufferCtx.putImageData(imgData, 0, 0);

        // Apply Post-Processing
        const filteredCanvas = this.postProcessor.apply(this.bufferCanvas, filterOptions);

        // Draw internal buffer to main canvas
        // This allows the CSS to handle scaling while maintaining "pixelated" rendering
        const displayWidth = this.canvas.width;
        const displayHeight = this.canvas.height;

        if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
        }

        this.ctx.imageSmoothingEnabled = false;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Maintain aspect ratio while drawing
        const scale = Math.min(this.canvas.width / width, this.canvas.height / height);
        const xOffset = (this.canvas.width - width * scale) / 2;
        const yOffset = (this.canvas.height - height * scale) / 2;

        this.ctx.drawImage(
            filteredCanvas,
            0, 0, width, height,
            xOffset, yOffset, width * scale, height * scale
        );

        // Add subtle bloom/glow if needed via globalCompositeOperation
        // For performance, we keep it simple but can add an "overlay" pass
    }

    /**
     * Helper to convert HEX to RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }
}
