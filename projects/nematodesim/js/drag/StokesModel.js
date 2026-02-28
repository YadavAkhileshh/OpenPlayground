// NematodeSim — Stokes Drag Model
// Implements linear Stokes drag for low Reynolds-number (Re << 1) flow.
// At the microscale of nematodes, viscous forces dominate inertia completely.
// F_drag = -6π * μ * r * v  (Stokes law for spheres; adapted for rod segments)

import Config from '../sim/Config.js';

export class StokesModel {
    /**
     * @param {number} viscosity  Normalized viscosity [0, 1]
     * @param {number} radius     Effective node radius (px) for drag area
     */
    constructor(viscosity = Config.VISCOSITY_DEFAULT, radius = 4.0) {
        this._viscosity = viscosity;
        this._radius = radius;
        this._mu = this._scaledMu(viscosity);   // Effective dynamic viscosity
    }

    /** Normalized → physical viscosity scale (arbitrary units). */
    _scaledMu(v) {
        // Smooth mapping: low v = water-like, high v = glycerol-like
        return 0.1 + v * v * 12.0;
    }

    /**
     * Compute Stokes drag force components for a node moving at (vx, vy).
     * Returns {fx, fy} — the drag force vector (always opposed to motion).
     * @param {number} vx  Node velocity x
     * @param {number} vy  Node velocity y
     * @returns {{ fx: number, fy: number }}
     */
    dragForce(vx, vy) {
        const c = 6 * Math.PI * this._mu * this._radius;
        return { fx: -c * vx, fy: -c * vy };
    }

    /**
     * Compute scalar drag coefficient at current settings.
     * @returns {number}
     */
    dragCoefficient() {
        return 6 * Math.PI * this._mu * this._radius;
    }

    /**
     * Update viscosity from UI slider value ∈ [0, 1].
     * @param {number} v
     */
    setViscosity(v) {
        this._viscosity = Math.max(Config.VISCOSITY_MIN, Math.min(Config.VISCOSITY_MAX, v));
        this._mu = this._scaledMu(this._viscosity);
    }

    /** Current normalized viscosity. */
    getViscosity() { return this._viscosity; }

    /**
     * Apply isotropic Stokes drag directly to a node's force accumulator.
     * @param {Node}   node
     * @param {number} dt   Sub-step timestep (for velocity derivation)
     */
    applyToNode(node, dt) {
        if (node.pinned) return;
        const invDt = dt > 0 ? 1.0 / dt : 0;
        const vx = (node.x - node.px) * invDt;
        const vy = (node.y - node.py) * invDt;
        const { fx, fy } = this.dragForce(vx, vy);
        node.addForce(fx, fy);
    }

    /**
     * Apply isotropic drag to every node in array.
     * @param {Node[]} nodes
     * @param {number} dt
     */
    applyToAll(nodes, dt) {
        for (let i = 0; i < nodes.length; i++) {
            this.applyToNode(nodes[i], dt);
        }
    }
}

export default StokesModel;
