/**
 * InkStroke.js
 * Represents a drawn line that acts as a platform.
 */

import { Entity } from './Entity.js';
import { Settings } from '../core/Settings.js';

export class InkStroke extends Entity {
    constructor(x, y, width) {
        super(x, y, width, Settings.INK_THICKNESS); // Set thickness
        this.type = 'InkStroke';
        this.physicsEnabled = false; // Static
        this.color = Settings.INK_COLOR;
        this.opacity = 1.0;
        this.age = 0;
    }

    update(dt) {
        this.age += dt;
        // Optionally fade out old ink if far behind camera?
    }
}
