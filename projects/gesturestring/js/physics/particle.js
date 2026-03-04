/**
 * Particle Class
 * Represents a point mass in the physics simulation.
 */
import { Vector3 } from '../math/vector3.js';

export class Particle {
    constructor(x, y, z, mass = 1.0) {
        this.position = new Vector3(x, y, z);
        this.prevPosition = new Vector3(x, y, z); // For Verlet if needed
        this.velocity = new Vector3(0, 0, 0);
        this.acceleration = new Vector3(0, 0, 0);
        this.mass = mass;
        this.invMass = mass !== 0 ? 1.0 / mass : 0;
        this.damping = 0.96; // Air resistance
        this.radius = 2;
        this.color = { r: 255, g: 255, b: 255, a: 1.0 };
        this.isLocked = false;

        // Ribbon specific properties
        this.life = 1.0;
        this.decayRate = 0.005;
        this.age = 0;
    }

    /**
     * Applies a force to the particle.
     * @param {Vector3} force 
     */
    applyForce(force) {
        if (this.isLocked) return;

        // f = ma => a = f/m
        const f = force.clone().multiplyScalar(this.invMass);
        this.acceleration.add(f);
    }

    /**
     * Updates the particle state.
     * @param {number} dt - Time step in seconds.
     */
    update(dt) {
        if (this.isLocked) return;

        // Semi-implicit Euler Integration
        this.velocity.add(this.acceleration.multiplyScalar(dt));
        this.velocity.multiplyScalar(this.damping);

        this.position.add(this.velocity.clone().multiplyScalar(dt));

        // Reset acceleration
        this.acceleration.set(0, 0, 0);

        // Update life
        this.life -= this.decayRate;
        this.age += dt;
    }
}
