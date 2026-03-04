/**
 * @file road.js
 * @description Defines the circular road geometry.
 */

import { CONFIG } from '../utils/constants.js';

export class Road {
    constructor() {
        this.radius = CONFIG.ROAD_RADIUS;
        this.width = CONFIG.ROAD_WIDTH;
        this.circumference = 2 * Math.PI * this.radius;
    }

    /**
     * Converts a linear position (distance along the road) to Cartesian coordinates.
     * @param {number} position - Distance along the track (0 to circumference).
     * @param {number} offset - Lateral offset from center (optional).
     * @returns {Object} {x, y, angle}
     */
    getCoordinates(position, offset = 0) {
        // Normalize position to 0..circumference
        let pos = position % this.circumference;
        if (pos < 0) pos += this.circumference;

        // Calculate angle (0 is right, increasing clockwise or counter-clockwise depending on coord system)
        // Let's go clockwise, starting from 3 o'clock (0 radians)
        const angle = (pos / this.circumference) * Math.PI * 2;

        const r = this.radius + offset;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;

        return { x, y, angle };
    }
}
