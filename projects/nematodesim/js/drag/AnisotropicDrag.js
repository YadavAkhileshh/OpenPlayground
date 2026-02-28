// NematodeSim — Anisotropic Drag (Slender Body Theory)
// The key physics engine for nematode locomotion.
// In viscous fluid, resistance differs along vs. transverse to the body axis:
//   F_normal     = -γ_n * v_n  (transverse: ~2× tangential)
//   F_tangential = -γ_t * v_t  (along body axis)
// This asymmetry converts lateral oscillation into net forward thrust.

import Config from '../sim/Config.js';

export class AnisotropicDrag {
    /**
     * @param {number} viscosity    Normalized viscosity [0, 1]
     * @param {number} gammaT       Tangential drag coefficient (along body)
     * @param {number} gammaN       Normal drag coefficient (transverse to body)
     */
    constructor(
        viscosity = Config.VISCOSITY_DEFAULT,
        gammaT = Config.DRAG_TANGENTIAL,
        gammaN = Config.DRAG_NORMAL
    ) {
        this._viscosity = viscosity;
        this._gammaT = gammaT;
        this._gammaN = gammaN;
        this._mu = this._toMu(viscosity);
        // Storage for last computed drag vectors (for visualisation)
        this.lastDrags = [];
    }

    _toMu(v) { return 0.08 + v * v * 10.0; }

    /**
     * Apply anisotropic drag to two adjacent nodes, using the segment
     * between them to define the local body axis (tangent direction).
     *
     * @param {Node}   nodeA    Upstream node (i-1)
     * @param {Node}   nodeB    Downstream node (i)
     * @param {number} dt       Sub-step timestep
     * @param {number} nodeIdx  Index for storing drag data
     */
    applyToSegment(nodeA, nodeB, dt, nodeIdx = 0) {
        if (nodeA.pinned || nodeB.pinned) return;
        const invDt = dt > 0 ? 1.0 / dt : 0;
        const vx = (nodeB.x - nodeB.px) * invDt;
        const vy = (nodeB.y - nodeB.py) * invDt;
        // Tangent unit vector along segment AB
        let tx = nodeB.x - nodeA.x;
        let ty = nodeB.y - nodeA.y;
        const len = Math.sqrt(tx * tx + ty * ty);
        if (len < 1e-8) return;
        tx /= len; ty /= len;
        // Decompose velocity into tangential + normal
        const vDotT = vx * tx + vy * ty;
        const vtx = vDotT * tx; const vty = vDotT * ty;
        const vnx = vx - vtx; const vny = vy - vty;
        const mu = this._mu;
        const fx = -this._gammaT * mu * vtx + (-this._gammaN * mu * vnx);
        const fy = -this._gammaT * mu * vty + (-this._gammaN * mu * vny);
        nodeB.addForce(fx, fy);
        // Cache for drag visualiser
        if (nodeIdx >= this.lastDrags.length) {
            this.lastDrags.push({ fx, fy, nx: nodeB.x, ny: nodeB.y });
        } else {
            this.lastDrags[nodeIdx].fx = fx; this.lastDrags[nodeIdx].fy = fy;
            this.lastDrags[nodeIdx].nx = nodeB.x; this.lastDrags[nodeIdx].ny = nodeB.y;
        }
    }

    /**
     * Apply anisotropic drag to all segments in a node chain.
     * @param {Node[]} nodes  Ordered body node array
     * @param {number} dt     Sub-step timestep
     */
    applyToChain(nodes, dt) {
        const n = nodes.length;
        for (let i = 1; i < n; i++) {
            this.applyToSegment(nodes[i - 1], nodes[i], dt, i - 1);
        }
    }

    /** Update viscosity from slider value ∈ [0, 1]. */
    setViscosity(v) {
        this._viscosity = Math.max(Config.VISCOSITY_MIN, Math.min(Config.VISCOSITY_MAX, v));
        this._mu = this._toMu(this._viscosity);
    }

    getViscosity() { return this._viscosity; }
}

export default AnisotropicDrag;
