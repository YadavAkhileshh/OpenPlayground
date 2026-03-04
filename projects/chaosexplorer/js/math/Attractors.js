/**
 * Attractors.js
 * Definitions for various strange attractors.
 * 
 * Each attractor defines a system of differential equations
 * that govern the motion of a point in 3D space.
 */

import { Vector3 } from './Vector3.js';

/**
 * Base class for all attractors.
 * Ensures a consistent interface for the Integrator and Renderer.
 */
class BaseAttractor {
    constructor() {
        this.params = {};
        this.defaults = {}; // Store defaults for reset
        this.startPoint = new Vector3(0.1, 0, 0);
        this.scale = 1.0; // Visual scale factor for rendering
    }

    /**
     * Resets parameters to their default values.
     */
    resetParams() {
        this.params = { ...this.defaults };
    }

    /**
     * Calculates the derivative (velocity) at a given point `v`.
     * Must be implemented by subclasses.
     * @param {Vector3} v - Current position
     * @returns {Vector3} - Derivative vector (dx/dt, dy/dt, dz/dt)
     */
    getDerivative(v) {
        return new Vector3(0, 0, 0);
    }
}

/**
 * Lorenz Attractor
 * The classic butterfly effect system.
 * dx/dt = sigma * (y - x)
 * dy/dt = x * (rho - z) - y
 * dz/dt = x * y - beta * z
 */
export class LorenzAttractor extends BaseAttractor {
    constructor() {
        super();
        this.defaults = {
            sigma: 10,
            rho: 28,
            beta: 8 / 3
        };
        this.params = { ...this.defaults };
        this.startPoint = new Vector3(0.1, 0.1, 0.1);
        this.scale = 4.0;
    }

    getDerivative(v) {
        const { x, y, z } = v;
        const { sigma, rho, beta } = this.params;
        return new Vector3(
            sigma * (y - x),
            x * (rho - z) - y,
            x * y - beta * z
        );
    }
}

/**
 * Aizawa Attractor
 * A beautiful sphere-like attractor with a tube down the center.
 */
export class AizawaAttractor extends BaseAttractor {
    constructor() {
        super();
        this.defaults = {
            a: 0.95,
            b: 0.7,
            c: 0.6,
            d: 3.5,
            e: 0.25,
            f: 0.1
        };
        this.params = { ...this.defaults };
        this.startPoint = new Vector3(0.1, 0, 0);
        this.scale = 80.0;
    }

    getDerivative(v) {
        const { x, y, z } = v;
        const { a, b, c, d, e, f } = this.params;

        const dx = (z - b) * x - d * y;
        const dy = d * x + (z - b) * y;
        const dz = c + a * z - (z * z * z) / 3 - (x * x + y * y) * (1 + e * z) + f * z * x * x * x;

        return new Vector3(dx, dy, dz);
    }
}

/**
 * Thomas Attractor
 * A cyclically symmetric attractor.
 */
export class ThomasAttractor extends BaseAttractor {
    constructor() {
        super();
        this.defaults = {
            b: 0.208186
        };
        this.params = { ...this.defaults };
        this.startPoint = new Vector3(1.1, 1.1, 1.1);
        this.scale = 12.0;
    }

    getDerivative(v) {
        const { x, y, z } = v;
        const { b } = this.params;

        return new Vector3(
            Math.sin(y) - b * x,
            Math.sin(z) - b * y,
            Math.sin(x) - b * z
        );
    }
}

/**
 * Rössler Attractor
 * Simpler than Lorenz, effectively a folded band.
 */
export class RosslerAttractor extends BaseAttractor {
    constructor() {
        super();
        this.defaults = {
            a: 0.2,
            b: 0.2,
            c: 5.7
        };
        this.params = { ...this.defaults };
        this.startPoint = new Vector3(1, 1, 1);
        this.scale = 6.0;
    }

    getDerivative(v) {
        const { x, y, z } = v;
        const { a, b, c } = this.params;

        return new Vector3(
            -y - z,
            x + a * y,
            b + z * (x - c)
        );
    }
}

/**
 * Halvorsen Attractor
 * Can behave like a strange torus.
 */
export class HalvorsenAttractor extends BaseAttractor {
    constructor() {
        super();
        this.defaults = { a: 1.4 };
        this.params = { ...this.defaults };
        this.startPoint = new Vector3(1, 0, 0);
        this.scale = 15.0;
    }
    getDerivative(v) {
        const { x, y, z } = v;
        const { a } = this.params;
        return new Vector3(
            -a * x - 4 * y - 4 * z - y * y,
            -a * y - 4 * z - 4 * x - z * z,
            -a * z - 4 * x - 4 * y - x * x
        );
    }
}

/**
 * Chen Attractor
 * Similar to Lorenz but more complex.
 */
export class ChenAttractor extends BaseAttractor {
    constructor() {
        super();
        this.defaults = { a: 35, b: 3, c: 28 };
        this.params = { ...this.defaults };
        this.startPoint = new Vector3(-10, 0, 30);
        this.scale = 2.0;
    }
    getDerivative(v) {
        const { x, y, z } = v;
        const { a, b, c } = this.params;
        return new Vector3(
            a * (y - x),
            (c - a) * x - x * z + c * y,
            x * y - b * z
        );
    }
}

/**
 * Dadras Attractor
 */
export class DadrasAttractor extends BaseAttractor {
    constructor() {
        super();
        this.defaults = { p: 3, q: 2.7, r: 1.7, s: 2, e: 9 };
        this.params = { ...this.defaults };
        this.startPoint = new Vector3(1, 1, 1);
        this.scale = 15.0;
    }
    getDerivative(v) {
        const { x, y, z } = v;
        const { p, q, r, s, e } = this.params;
        return new Vector3(
            y - p * x + q * y * z,
            r * y - x * z + z,
            s * x * y - e * z
        );
    }
}

/**
 * Sprott Attractor (Case A)
 */
export class SprottAttractor extends BaseAttractor {
    constructor() {
        super();
        this.defaults = { a: 2.07, b: 1.79 };
        this.params = { ...this.defaults };
        this.startPoint = new Vector3(0.6, 0.2, 0.5);
        this.scale = 25.0;
    }
    getDerivative(v) {
        const { x, y, z } = v;
        const { a, b } = this.params;
        return new Vector3(
            y + a * x * y + x * z,
            1 - b * x * x + y * z,
            x - x * x - y * y
        );
    }
}

/**
 * Four-Wing Attractor
 */
export class FourWingAttractor extends BaseAttractor {
    constructor() {
        super();
        this.defaults = { a: 0.2, b: 0.01, c: -0.4 };
        this.params = { ...this.defaults };
        this.startPoint = new Vector3(1, 1, 1);
        this.scale = 5.0;
    }
    getDerivative(v) {
        const { x, y, z } = v;
        const { a, b, c } = this.params;
        return new Vector3(
            a * x + y * z,
            b * x + c * y - x * z,
            -z - x * y
        );
    }
}


export class AttractorFactory {
    static create(type) {
        switch (type) {
            case 'lorenz': return new LorenzAttractor();
            case 'aizawa': return new AizawaAttractor();
            case 'thomas': return new ThomasAttractor();
            case 'rossler': return new RosslerAttractor();
            case 'halvorsen': return new HalvorsenAttractor();
            case 'chen': return new ChenAttractor();
            case 'dadras': return new DadrasAttractor();
            case 'sprott': return new SprottAttractor();
            case 'fourwing': return new FourWingAttractor();
            default: return new LorenzAttractor();
        }
    }
}
