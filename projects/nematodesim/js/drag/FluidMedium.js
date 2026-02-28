// NematodeSim — Fluid Medium
// Represents the physical properties of the surrounding fluid.
// Acts as a shared parameter bag that drag systems query.

import Config from '../sim/Config.js';

export class FluidMedium {
    /**
     * @param {number} viscosity  Normalized viscosity [0, 1]
     * @param {number} density    Fluid density (arb units, default 1.0)
     */
    constructor(viscosity = Config.VISCOSITY_DEFAULT, density = 1.0) {
        this.viscosity = viscosity;
        this.density = density;
        this.temperature = 293;   // Kelvin (room temperature, 20 °C)
        this.flowVelocityX = 0;     // Bulk flow of the medium (px/s)
        this.flowVelocityY = 0;
        this._listeners = [];
    }

    /** Effective dynamic viscosity µ in simulation units. */
    dynamicViscosity() {
        return 0.08 + this.viscosity * this.viscosity * 10.0;
    }

    /** Kinematic viscosity ν = µ / ρ. */
    kinematicViscosity() {
        return this.dynamicViscosity() / Math.max(this.density, 1e-6);
    }

    /**
     * Velocity of the fluid at a given position (accounts for bulk flow).
     * Can be extended to spatially varying flow fields.
     * @param {number} _x  World X (unused in uniform flow)
     * @param {number} _y  World Y
     * @returns {{ vx: number, vy: number }}
     */
    flowAt(_x, _y) {
        return { vx: this.flowVelocityX, vy: this.flowVelocityY };
    }

    /**
     * Relative velocity of a body node with respect to the fluid.
     * @param {Node}   node
     * @param {number} dt
     * @returns {{ vx: number, vy: number }}
     */
    relativeVelocity(node, dt) {
        const invDt = dt > 0 ? 1.0 / dt : 0;
        const nvx = (node.x - node.px) * invDt;
        const nvy = (node.y - node.py) * invDt;
        const flow = this.flowAt(node.x, node.y);
        return { vx: nvx - flow.vx, vy: nvy - flow.vy };
    }

    /**
     * Set viscosity and notify listeners.
     * @param {number} v  Normalized [0, 1]
     */
    setViscosity(v) {
        this.viscosity = Math.max(Config.VISCOSITY_MIN, Math.min(Config.VISCOSITY_MAX, v));
        this._listeners.forEach(fn => fn(this.viscosity));
    }

    /** Register a change listener. */
    onChange(fn) { this._listeners.push(fn); }

    /** Deregister. */
    removeListener(fn) {
        this._listeners = this._listeners.filter(l => l !== fn);
    }

    /**
     * Add a gentle background horizontal flow.
     * @param {number} vx  Flow speed (px/s)
     */
    setFlow(vx, vy = 0) {
        this.flowVelocityX = vx;
        this.flowVelocityY = vy;
    }
}

export default FluidMedium;
