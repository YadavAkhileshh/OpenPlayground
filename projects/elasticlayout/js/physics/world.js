import { Particle } from './particle.js';
import { Constraint } from './constraint.js';

/**
 * PhysicsWorld manages the simulation.
 * It holds lists of particles and constraints and controls time steps.
 */
export class PhysicsWorld {
    constructor() {
        this.particles = [];
        this.constraints = [];
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // Solver iterations for stability
        this.iterations = 5;

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
    }

    addParticle(x, y, mass, isPinned) {
        const p = new Particle(x, y, mass, isPinned);
        this.particles.push(p);
        return p;
    }

    addConstraint(p1, p2, length, stiffness) {
        const c = new Constraint(p1, p2, length, stiffness);
        this.constraints.push(c);
        return c;
    }

    update() {
        // Update particles (Integration)
        for (const p of this.particles) {
            p.update();
            p.constrainToBounds(this.width, this.height);
        }

        // Solve Constraints
        // Multiple iterations make the simulation stiffer and more stable
        for (let i = 0; i < this.iterations; i++) {
            for (const c of this.constraints) {
                c.resolve();
            }
        }
    }

    // Check if point is inside a particle (for mouse interaction)
    findParticleNear(x, y, range = 30) {
        return this.particles.find(p => {
            const dx = p.pos.x - x;
            const dy = p.pos.y - y;
            return (dx * dx + dy * dy) < (range * range + p.radius * p.radius);
        });
    }

    clear() {
        this.particles = [];
        this.constraints = [];
    }
}
