import { Particle } from './particle.js';
import { Constraint } from './constraint.js';

/**
 * Composite represents a complex physics object made of multiple connected particles.
 * Examples: A Chain, A Cloth, A Box, A SoftBody text.
 */
export class Composite {
    constructor() {
        this.particles = [];
        this.constraints = [];
    }

    addParticle(p) {
        this.particles.push(p);
        return p;
    }

    addConstraint(c) {
        this.constraints.push(c);
        return c;
    }

    /**
     * Creates a rectangular soft body grid.
     * @param {number} x Starting X
     * @param {number} y Starting Y
     * @param {number} cols Number of columns
     * @param {number} rows Number of rows
     * @param {number} gap Spacing
     */
    static createCloth(world, x, y, cols, rows, gap, stiffness = 0.5) {
        const composite = new Composite();
        const particles = [];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const p = world.addParticle(x + c * gap, y + r * gap, 1, false);
                particles.push(p);
                composite.addParticle(p);

                // Connect to left
                if (c > 0) {
                    const left = particles[particles.length - 2];
                    const cons = world.addConstraint(left, p, gap, stiffness);
                    composite.addConstraint(cons);
                }

                // Connect to top
                if (r > 0) {
                    const top = particles[particles.length - 1 - cols];
                    const cons = world.addConstraint(top, p, gap, stiffness);
                    composite.addConstraint(cons);
                }
            }
        }
        return composite;
    }
}
