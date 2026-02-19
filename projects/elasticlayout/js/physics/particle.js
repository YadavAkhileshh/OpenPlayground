import { Vector } from '../math/vector.js';

/**
 * Particle represents a point mass in the physics world.
 * It uses Verlet integration for time-corrected position updates.
 */
export class Particle {
    constructor(x, y, mass = 1, isPinned = false) {
        this.pos = new Vector(x, y);
        this.oldPos = new Vector(x, y); // For Verlet integration
        this.acc = new Vector(0, 0);
        this.mass = mass;
        this.baseMass = mass; // To restore after interactions
        this.isPinned = isPinned;
        this.radius = 10; // Collision radius, default
        this.friction = 0.96; // Damping factor
        this.gravity = new Vector(0, 0.5); // Default gravity

        // Optional user data (e.g., linked DOM element)
        this.userData = null;
    }

    applyForce(force) {
        if (this.isPinned) return;
        // f = ma => a = f/m
        this.acc.addMut(force.div(this.mass));
    }

    update() {
        if (this.isPinned) return;

        // Apply Gravity
        this.applyForce(this.gravity.mult(this.mass));

        const vel = this.pos.sub(this.oldPos);

        // Apply friction
        vel.multMut(this.friction);

        // Update old position
        this.oldPos = this.pos.copy();

        // Perform Verlet integration
        // pos = pos + vel + acc
        this.pos.addMut(vel).addMut(this.acc);

        // Reset acceleration
        this.acc.multMut(0);
    }

    constrainToBounds(width, height) {
        const vel = this.pos.sub(this.oldPos);
        let bounced = false;

        // Right
        if (this.pos.x > width - this.radius) {
            this.pos.x = width - this.radius;
            this.oldPos.x = this.pos.x + vel.x * 0.8; // Bounce with damping
            bounced = true;
        }
        // Left
        else if (this.pos.x < this.radius) {
            this.pos.x = this.radius;
            this.oldPos.x = this.pos.x + vel.x * 0.8;
            bounced = true;
        }

        // Bottom
        if (this.pos.y > height - this.radius) {
            this.pos.y = height - this.radius;
            this.oldPos.y = this.pos.y + vel.y * 0.8;
            bounced = true;
        }
        // Top
        else if (this.pos.y < this.radius) {
            this.pos.y = this.radius;
            this.oldPos.y = this.pos.y + vel.y * 0.8;
            bounced = true;
        }
    }
}
