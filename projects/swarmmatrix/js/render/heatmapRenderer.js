/**
 * js/render/heatmapRenderer.js
 * High performance pheromone visualization using ImageData.
 */

import { PheromoneTypes } from '../simulation/pheromoneTypes.js';
import { CONFIG } from '../core/config.js';

export class HeatmapRenderer {
    constructor() {
        this.imageData = null;
        this.offscreenCanvas = null;
        this.offscreenCtx = null;
    }

    render(ctx, grid) {
        const { cols, rows, resolution, density } = grid;
        const width = cols;
        const height = rows;

        // Initialize or resize buffers
        if (!this.imageData || this.imageData.width !== width || this.imageData.height !== height) {
            this.offscreenCanvas = document.createElement('canvas');
            this.offscreenCanvas.width = width;
            this.offscreenCanvas.height = height;
            this.offscreenCtx = this.offscreenCanvas.getContext('2d', { alpha: true });
            this.imageData = this.offscreenCtx.createImageData(width, height);
        }

        const data = this.imageData.data;
        const homeData = density[PheromoneTypes.TO_HOME];
        const foodData = density[PheromoneTypes.TO_FOOD];

        // Cache color values
        const hR = CONFIG.COLOR_PHERO_HOME[0];
        const hG = CONFIG.COLOR_PHERO_HOME[1];
        const hB = CONFIG.COLOR_PHERO_HOME[2];

        const fR = CONFIG.COLOR_PHERO_FOOD[0];
        const fG = CONFIG.COLOR_PHERO_FOOD[1];
        const fB = CONFIG.COLOR_PHERO_FOOD[2];

        // Direct pixel buffer manipulation for maximum speed
        for (let i = 0; i < homeData.length; i++) {
            const hVal = homeData[i];
            const fVal = foodData[i];

            const pxIdx = i * 4;

            if (hVal > 1 || fVal > 1) {
                // Determine dominant color or blend
                // Normalizing to 0-1 range based on a visual max threshold
                const visMax = CONFIG.PH_MAX_VALUE * 0.5;
                const hRatio = Math.min(1, hVal / visMax);
                const fRatio = Math.min(1, fVal / visMax);

                // Additive blend approximation for speed
                data[pxIdx] = hR * hRatio + fR * fRatio;     // R
                data[pxIdx + 1] = hG * hRatio + fG * fRatio;     // G
                data[pxIdx + 2] = hB * hRatio + fB * fRatio;     // B

                // Alpha is based on the strongest signal
                const maxAlpha = Math.max(hRatio, fRatio);
                // Reduce alpha slightly for background aesthetics (max 0.7)
                data[pxIdx + 3] = Math.floor(maxAlpha * 180);    // A
            } else {
                // Transparent
                data[pxIdx + 3] = 0;
            }
        }

        // Put data to offscreen canvas
        this.offscreenCtx.putImageData(this.imageData, 0, 0);

        // Draw offscreen canvas to main canvas, scaled up by resolution
        // Use image smoothing false for sharp pixel look, or true for smooth gradient
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(this.offscreenCanvas, 0, 0, width * resolution, height * resolution);
    }
}
