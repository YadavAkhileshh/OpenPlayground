/**
 * js/simulation/obstacle.js
 * Represents a static obstacle in the environment.
 */

import { Utils } from '../core/utils.js';

export class Obstacle {
    constructor(x, y, radius) {
        this.id = Utils.generateId();
        this.x = x;
        this.y = y;
        this.radius = radius;
        // Optimization: Pre-calculate squared radius for faster collisions
        this.radiusSq = radius * radius;
    }

    // Check if a point is inside this obstacle
    contains(px, py) {
        const dx = this.x - px;
        const dy = this.y - py;
        return (dx * dx + dy * dy) < this.radiusSq;
    }
}
