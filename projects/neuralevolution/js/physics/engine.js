import { Vector } from '../math/vector.js';

/**
 * Represents a point mass in the physics simulation.
 * Uses Verlet integration for stability.
 */
export class Particle {
    /**
     * Create a new Particle.
     * @param {number} x - Initial X position
     * @param {number} y - Initial Y position
     * @param {boolean} fixed - Whether the particle is static
     */
    constructor(x, y, fixed = false) {
        this.pos = new Vector(x, y);
        this.oldPos = new Vector(x, y);
        this.acc = new Vector(0, 0);
        this.mass = 1.0;
        this.fixed = fixed;
        this.radius = 5;
        this.friction = 0.98;
        this.groundFriction = 0.7;
    }

    /**
     * Update position based on Verlet integration.
     * @param {number} dt - Time step
     */
    update(dt) {
        if (this.fixed) return;

        // Verlet Integration
        const vel = Vector.sub(this.pos, this.oldPos);
        vel.mult(this.friction); // Air resistance

        this.oldPos.x = this.pos.x;
        this.oldPos.y = this.pos.y;

        this.pos.add(vel);
        this.pos.add(Vector.mult(this.acc, dt * dt));

        this.acc.mult(0); // Reset acceleration
    }

    /**
     * Apply a force to the particle.
     * @param {Vector} force 
     */
    applyForce(force) {
        if (this.fixed) return;
        this.acc.add(new Vector(force.x / this.mass, force.y / this.mass));
    }

    /**
     * Constrain particle to world bounds and ground.
     * @param {number} width 
     * @param {number} height 
     * @param {Function} groundHeightFunc 
     */
    constrain(width, height, groundHeightFunc) {
        if (this.fixed) return;

        // Ground Collision
        const groundY = groundHeightFunc(this.pos.x);
        if (this.pos.y > groundY - this.radius) {
            const depth = (this.pos.y + this.radius) - groundY; // Simplified

            // Simple projection out of ground
            this.pos.y = groundY - this.radius;

            // Apply friction on ground contact
            const vel = Vector.sub(this.pos, this.oldPos);
            vel.x *= this.groundFriction;

            // Re-calculate oldPos based on new filtered velocity
            this.oldPos.x = this.pos.x - vel.x;
            this.oldPos.y = this.pos.y - vel.y;
        }
    }
}

/**
 * A constraint connecting two particles (distance joint or spring).
 */
export class Constraint {
    /**
     * Create a constraint.
     * @param {Particle} p1 - First particle
     * @param {Particle} p2 - Second particle
     * @param {number} length - Resting length
     * @param {number} stiffness - Spring stiffness (0.0 - 1.0)
     * @param {boolean} isMuscle - Is this an active muscle?
     */
    constructor(p1, p2, length, stiffness = 1.0, isMuscle = false) {
        this.p1 = p1;
        this.p2 = p2;
        this.restLength = length;
        this.currentLength = length; // For muscles, this changes
        this.stiffness = stiffness;
        this.isMuscle = isMuscle;
        this.muscleAmplitude = 0; // 0 to 1, how much it can contract/expand
        this.baseLength = length;
    }

    /**
     * Resolve the constraint by moving particles.
     */
    update() {
        const dx = this.p2.pos.x - this.p1.pos.x;
        const dy = this.p2.pos.y - this.p1.pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist === 0) return; // Prevent division by zero

        const diff = (dist - this.currentLength) / dist;
        const correction = diff * 0.5 * this.stiffness;

        const offsetX = dx * correction;
        const offsetY = dy * correction;

        if (!this.p1.fixed) {
            this.p1.pos.x += offsetX;
            this.p1.pos.y += offsetY;
        }
        if (!this.p2.fixed) {
            this.p2.pos.x -= offsetX;
            this.p2.pos.y -= offsetY;
        }
    }

    /**
     * Contract or expand the muscle.
     * @param {number} signal - Control signal (-1 to 1)
     */
    contract(signal) {
        if (!this.isMuscle) return;

        // Clamp signal
        signal = Math.max(-1, Math.min(1, signal));

        // Simple linear muscle model
        // contracting shortens length, expanding increases it
        const targetLen = this.baseLength * (1 + signal * 0.3); // +/- 30% range

        // Soften the change (lerp)
        this.currentLength = this.currentLength * 0.9 + targetLen * 0.1;
    }
}

/**
 * Manages the physics simulation.
 */
export class PhysicsWorld {
    constructor() {
        this.particles = [];
        this.constraints = [];
        this.gravity = new Vector(0, 9.81 * 20); // Scaled gravity
        this.groundLevel = 0;
    }

    addParticle(p) {
        this.particles.push(p);
    }

    addConstraint(c) {
        this.constraints.push(c);
    }

    /**
     * Step the physics simulation.
     * @param {number} dt 
     */
    update(dt) {
        // Apply gravity
        for (const p of this.particles) {
            p.applyForce(this.gravity);
        }

        // Integrate
        for (const p of this.particles) {
            p.update(dt);
        }

        // Constraint relaxation (multiple iterations for stability)
        const iterations = 5;
        for (let i = 0; i < iterations; i++) {
            for (const c of this.constraints) {
                c.update();
            }

            // Constrain to world bounds/ground
            for (const p of this.particles) {
                p.constrain(100000, 100000, this.getGroundHeight.bind(this));
            }
        }
    }

    /**
     * Get the ground Y coordinate at a given X.
     * @param {number} x 
     */
    getGroundHeight(x) {
        // Feature 4: Variable Terrain
        // Simple composition of sines for "hills"
        // Flat start
        if (x < 500) return 600;

        const base = 600;
        const amp1 = 50;
        const freq1 = 0.005;
        const amp2 = 20;
        const freq2 = 0.01;

        return base - (Math.sin(x * freq1) * amp1 + Math.sin(x * freq2) * amp2) + Math.abs(x * 0.02); // Slight uphill trend? No, keep it level-ish but bumpy.
    }

    /**
     * Clear all logic.
     */
    clear() {
        this.particles = [];
        this.constraints = [];
    }
}
