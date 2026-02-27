/**
 * @file particle.js
 * @description Defines the Particle class which extends the basic physics Body.
 * Particles are the fundamental units of the simulation, representing stars
 * or clusters of matter in the galaxies.
 * 
 * @module Physics
 */

import { Vector3 } from '../math/vector.js';

/**
 * Base physics body with mass and kinematic properties.
 */
export class Body {
    /**
     * Create a new physics body.
     * @param {number} mass - The mass of the body.
     * @param {Vector3} position - Initial position.
     * @param {Vector3} velocity - Initial velocity.
     */
    constructor(mass, position, velocity) {
        this.mass = mass;
        this.position = position || new Vector3();
        this.velocity = velocity || new Vector3();
        this.acceleration = new Vector3();
        this.force = new Vector3();

        // Unique identifier for debugging
        this.id = Math.random().toString(36).substr(2, 9);
    }

    /**
     * Apply a force to the body.
     * @param {Vector3} f - Force vector.
     */
    applyForce(f) {
        this.force.add(f);
    }

    /**
     * Reset force accumulators for the next time step.
     */
    resetForce() {
        this.force.zero();
    }

    /**
     * Update position and velocity using simple integration.
     * Note: The main integrator will likely handle this externally
     * for better control (Leapfrog/Verlet), but this is a fallback.
     * @param {number} dt - Time step.
     */
    update(dt) {
        // F = ma -> a = F/m
        if (this.mass > 0) {
            this.acceleration.set(
                this.force.x / this.mass,
                this.force.y / this.mass,
                this.force.z / this.mass
            );
        }

        // Symplectic Euler Integration (semi-implicit)
        // Update velocity
        this.velocity.x += this.acceleration.x * dt;
        this.velocity.y += this.acceleration.y * dt;
        this.velocity.z += this.acceleration.z * dt;

        // Update position
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
        this.position.z += this.velocity.z * dt;
    }
}

/**
 * Visual particle extension of Body.
 */
export class Particle extends Body {
    /**
     * Create a new particle.
     * @param {number} mass - Mass.
     * @param {Vector3} position - Position.
     * @param {Vector3} velocity - Velocity.
     * @param {string} color - CSS color string.
     * @param {number} size - Visual size.
     */
    constructor(mass, position, velocity, color = '#ffffff', size = 1) {
        super(mass, position, velocity);
        this.color = color;
        this.size = size;

        // Trail history for visual effect
        // Array of {x, y, z} positions
        this.trail = [];
        this.maxTrailLength = 0; // Configurable
    }

    /**
     * Update particle history for trails.
     */
    updateTrail() {
        if (this.maxTrailLength === 0) return;

        // Push current position (clone to avoid reference issues)
        this.trail.push({
            x: this.position.x,
            y: this.position.y,
            z: this.position.z
        });

        // Trim old positions
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
    }
}
