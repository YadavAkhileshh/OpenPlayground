/**
 * Obstacle.js
 * Hazards on the path.
 */

import { Entity } from './Entity.js';

export class Obstacle extends Entity {
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.type = 'Obstacle';
        this.physicsEnabled = false; // Static usually
    }

    // Additional logic for different obstacle types (spikes, gaps, etc.)
}
