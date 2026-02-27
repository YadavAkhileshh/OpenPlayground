/**
 * Physics Solver
 * Manages the physics world, particles, and springs.
 */
import { Vector3 } from '../math/vector3.js';

export class Solver {
    constructor() {
        this.particles = [];
        this.springs = [];
        this.gravity = new Vector3(0, 0, 0); // Zero gravity for space feel
    }

    addParticle(p) {
        this.particles.push(p);
        return p;
    }

    addSpring(s) {
        this.springs.push(s);
        return s;
    }

    removeParticle(p) {
        const index = this.particles.indexOf(p);
        if (index > -1) {
            this.particles.splice(index, 1);
        }
    }

    removeSpring(s) {
        const index = this.springs.indexOf(s);
        if (index > -1) {
            this.springs.splice(index, 1);
        }
    }

    update(dt) {
        // Apply global forces (gravity)
        for (const p of this.particles) {
            p.applyForce(this.gravity);
        }

        // Apply spring forces
        for (const s of this.springs) {
            s.update();
        }

        // Integrate particles
        // Iterate backwards to allow safe removal if we added that logic here
        // (but removal is usually handled by the manager)
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].update(dt);
        }
    }

    clear() {
        this.particles = [];
        this.springs = [];
    }
}
