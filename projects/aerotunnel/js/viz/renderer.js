/**
 * @file renderer.js
 * @description Handles canvas rendering for the LBM simulation.
 */

import { generateColormap } from './colormap.js';

export class FlowRenderer {
    /**
     * @param {HTMLCanvasElement} canvas 
     * @param {LBMSolver} solver 
     */
    constructor(canvas, solver) {
        this.canvas = canvas;
        this.solver = solver;
        this.ctx = canvas.getContext('2d', { alpha: false });

        // Image Data buffer
        this.imageData = this.ctx.createImageData(solver.width, solver.height);
        this.pixels = this.imageData.data; // Uint8ClampedArray

        // Colormap
        this.activeColormap = 'jet';
        this.colormap = generateColormap(this.activeColormap);

        // Contrast/Speed scale factor
        this.contrast = 1.0;

        // Resize canvas to match grid size (CSS handles scaling)
        this.canvas.width = solver.width;
        this.canvas.height = solver.height;
    }

    /**
     * Update the colormap.
     * @param {string} name 
     */
    setColormap(name) {
        this.activeColormap = name;
        this.colormap = generateColormap(name);
    }

    /**
     * set visualization contrast (max speed mapping)
     * @param {number} val 
     */
    setContrast(val) {
        this.contrast = val;
    }

    /**
     * Render the current state of the solver.
     */
    render() {
        const { width, height, ux, uy, obstacles } = this.solver;
        const size = width * height;
        const pixels = this.pixels;
        const colormap = this.colormap;
        // Pre-compute scale
        // Max speed expected is usually around 0.1-0.2 depending on inlet
        // We normalize speed / (0.15 * contrast) -> 0..1
        const maxSpeed = 0.1;
        const scale = 1.0 / (maxSpeed * this.contrast);

        for (let i = 0; i < size; i++) {
            const pIdx = i * 4;

            if (obstacles[i]) {
                // Draw obstacles
                pixels[pIdx] = 50;  // R
                pixels[pIdx + 1] = 50;  // G
                pixels[pIdx + 2] = 50;  // B
                pixels[pIdx + 3] = 255; // Alpha
            } else {
                // Compute speed magnitude
                const vx = ux[i];
                const vy = uy[i];
                const speed = Math.sqrt(vx * vx + vy * vy);

                // Map to 0-255 colormap index
                let idx = Math.floor(speed * scale * 255);
                if (idx > 255) idx = 255;
                if (idx < 0) idx = 0;

                // Look up color
                const cIdx = idx * 4;
                pixels[pIdx] = colormap[cIdx];
                pixels[pIdx + 1] = colormap[cIdx + 1];
                pixels[pIdx + 2] = colormap[cIdx + 2];
                pixels[pIdx + 3] = 255;
            }
        }

        // Put image data to canvas
        this.ctx.putImageData(this.imageData, 0, 0);
    }
}
