// NematodeSim — Verlet Physics Node
// Represents a single mass point in the body chain.
// Stores current position, previous position (for Verlet),
// accumulated forces, and cached velocity.

import Config from '../sim/Config.js';

export class Node {
    /**
     * @param {number} x  Initial X position (px)
     * @param {number} y  Initial Y position (px)
     * @param {number} [mass]  Node mass (default from Config)
     */
    constructor(x, y, mass = Config.NODE_MASS) {
        this.x = x; this.y = y;
        this.px = x; this.py = y;  // Verlet previous position
        this.fx = 0; this.fy = 0;  // Accumulated forces
        this.mass = mass;
        this.invMass = mass > 0 ? 1.0 / mass : 0.0;
        this.pinned = false;
        this.radius = 4.0;
        this.vx = 0; this.vy = 0;  // Cached velocity
        this.index = 0;          // Chain index
    }

    /** Accumulate an external force onto this node. */
    addForce(fx, fy) {
        if (this.pinned) return;
        this.fx += fx;
        this.fy += fy;
    }

    /** Zero force accumulators at the start of each sub-step. */
    clearForces() {
        this.fx = 0;
        this.fy = 0;
    }

    /**
     * Derive velocity from Verlet displacement.
     * Must be called after integration with the correct dt.
     * @param {number} dt  Timestep in seconds
     */
    computeVelocity(dt) {
        const invDt = dt > 0.0 ? 1.0 / dt : 0.0;
        this.vx = (this.x - this.px) * invDt;
        this.vy = (this.y - this.py) * invDt;
    }

    /** Scalar speed derived from cached velocity. */
    speed() {
        return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    }

    /**
     * Clamp the implicit velocity (x - px) to maxSpeed * dt.
     * Prevents energetic explosions without altering direction.
     * @param {number} maxDisp  Maximum displacement magnitude per step
     */
    clampDisplacement(maxDisp) {
        const dx = this.x - this.px;
        const dy = this.y - this.py;
        const mag = Math.sqrt(dx * dx + dy * dy);
        if (mag > maxDisp && mag > 0) {
            const scale = maxDisp / mag;
            const cx = (this.x + this.px) * 0.5;
            const cy = (this.y + this.py) * 0.5;
            this.x = cx + dx * scale * 0.5;
            this.y = cy + dy * scale * 0.5;
            this.px = cx - dx * scale * 0.5;
            this.py = cy - dy * scale * 0.5;
        }
    }

    /** Returns false if position or previous position contains NaN or Infinity. */
    isValid() {
        return (
            isFinite(this.x) && isFinite(this.y) &&
            isFinite(this.px) && isFinite(this.py)
        );
    }

    /** Euclidean distance to another Node. */
    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /** Copy state from another node (used in snapshot / reset). */
    copyFrom(src) {
        this.x = src.x; this.y = src.y;
        this.px = src.px; this.py = src.py;
        this.fx = src.fx; this.fy = src.fy;
        this.vx = src.vx; this.vy = src.vy;
    }
}

export default Node;
