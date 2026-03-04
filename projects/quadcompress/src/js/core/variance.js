/**
 * QuadCompress Variance Calculator
 * 
 * Provides static methods to calculate the "error" or "variance" of a specific
 * rectangular region of pixels. This is the core heuristic that determines 
 * if a node should split or not.
 * 
 * @module Variance
 */

import { getAverageColor } from '../utils/colorUtils.js';

export class VarianceCalculator {

    /**
     * Calculates the Color Variance (Mean Squared Error) of a region.
     * 1. Finds the average color of the block.
     * 2. Sums the difference of every pixel from that average.
     * 3. Normalizes the score.
     * 
     * @param {ImageData} imageDataFull - The full source image data
     * @param {number} x - Region start X
     * @param {number} y - Region start Y
     * @param {number} w - Region width
     * @param {number} h - Region height
     * @param {Object} [precalcAvg] - Optional optimization: pass avg color if already known
     * @returns {Object} { score: number, avgColor: {r,g,b} }
     */
    static calculate(imageDataFull, x, y, w, h, precalcAvg = null) {
        const data = imageDataFull.data;
        const stride = imageDataFull.width;

        // 1. Get Average Color if not provided
        const avg = precalcAvg || getAverageColor(data, x, y, w, h, stride);

        // 2. Calculate Total Error (Sum of Squared Differences)
        let totalError = 0;
        let count = 0;

        const endX = x + w;
        const endY = y + h;

        for (let cy = y; cy < endY; cy++) {
            const rowOffset = cy * stride * 4;
            for (let cx = x; cx < endX; cx++) {
                const i = rowOffset + (cx * 4);

                // RGB distances
                const dr = data[i] - avg.r;
                const dg = data[i + 1] - avg.g;
                const db = data[i + 2] - avg.b;

                // Add weighted distance to error
                // Simple Euclidean distance squared
                totalError += (dr * dr + dg * dg + db * db);
                count++;
            }
        }

        if (count === 0) return { score: 0, avgColor: avg };

        // 3. Normalize
        // Mean Squared Error per channel roughly
        // Sqrt brings it back to linear color space range (0-255 approx)
        const mse = totalError / count;
        const score = Math.sqrt(mse);

        return {
            score: score,
            avgColor: avg
        };
    }
}
