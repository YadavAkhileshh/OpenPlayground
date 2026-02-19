/**
 * Particle.js
 * Visual effect particle.
 */

import { Entity } from './Entity.js';

export class Particle extends Entity {
    constructor(x, y, color) {
        super(x, y, 5, 5);
        this.color = color;
        this.life = 1.0; // Seconds
        this.vx = (Math.random() - 0.5) * 200;
        this.vy = (Math.random() - 0.5) * 200;
        this.physicsEnabled = true;
    }

    update(dt) {
        this.life -= dt;
        if (this.life <= 0) {
            this.isAlive = false;
        }

        // Simple gravity
        this.vy += 500 * dt;

        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }
}
