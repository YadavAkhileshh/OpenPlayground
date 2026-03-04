/**
 * @file heatmap.js
 * @description Logic for generating heatmap colors based on speed/density.
 */

import { hsl } from '../utils/math.js';

export class Heatmap {
    constructor() {
        // Gradient stops
        this.stops = [
            { t: 0, h: 0, s: 100, l: 50 },   // Red (Stopped)
            { t: 0.5, h: 60, s: 100, l: 50 }, // Yellow (Slow)
            { t: 1, h: 120, s: 100, l: 50 }   // Green (Fast)
        ];
    }

    /**
     * Get color for a normalized value (0-1).
     * @param {number} t - Normalized value (0 = slow, 1 = fast).
     * @returns {string} CSS color string.
     */
    getColor(t) {
        // Clamp
        t = Math.max(0, Math.min(1, t));

        // Find segment
        /*
           Simple linear interpolation between HSL values.
           For 0->1 mapping to 0->120 hue is often enough.
        */
        const hue = t * 120;
        return hsl(hue, 100, 50);
    }
}
