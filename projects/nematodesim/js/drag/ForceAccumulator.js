// NematodeSim — Force Accumulator
// Collects and applies external forces from multiple systems
// (CPG muscle forces, drag forces) to body nodes each frame.
// Acts as a force dispatcher before the Verlet integrator runs.

import Config from '../sim/Config.js';

export class ForceAccumulator {
    constructor() {
        this._pendingForces = [];  // Array of {nodeIndex, fx, fy}
        this.totalApplied = 0;   // Running total magnitude for monitoring
    }

    /**
     * Queue a force for a specific node by its index in the body chain.
     * Forces are batched here and flushed in apply().
     * @param {number} nodeIndex
     * @param {number} fx  Force x component
     * @param {number} fy  Force y component
     */
    queue(nodeIndex, fx, fy) {
        this._pendingForces.push({ nodeIndex, fx, fy });
    }

    /**
     * Apply all queued forces to the node array and clear the queue.
     * Forces are clamped to Config.MAX_FORCE_LIMIT before application.
     * @param {Node[]} nodes  Body node array
     */
    flush(nodes) {
        const pf = this._pendingForces;
        const len = pf.length;
        const maxF = Config.MAX_FORCE_LIMIT;
        let total = 0;

        for (let i = 0; i < len; i++) {
            const { nodeIndex, fx, fy } = pf[i];
            if (nodeIndex < 0 || nodeIndex >= nodes.length) continue;

            // Clamp force magnitude
            const mag = Math.sqrt(fx * fx + fy * fy);
            let cfx = fx;
            let cfy = fy;
            if (mag > maxF && mag > 0) {
                const scale = maxF / mag;
                cfx *= scale;
                cfy *= scale;
            }
            nodes[nodeIndex].addForce(cfx, cfy);
            total += mag;
        }

        this.totalApplied = total;
        this._pendingForces = [];
    }

    /**
     * Apply a force directly (bypasses queue, for hot path).
     * @param {Node}   node
     * @param {number} fx
     * @param {number} fy
     */
    applyDirect(node, fx, fy) {
        if (node.pinned) return;
        const maxF = Config.MAX_FORCE_LIMIT;
        const mag = Math.sqrt(fx * fx + fy * fy);
        if (mag > maxF && mag > 0) {
            const s = maxF / mag;
            fx *= s; fy *= s;
        }
        node.addForce(fx, fy);
    }

    /** Clear any pending queued forces without applying them. */
    clear() {
        this._pendingForces = [];
    }

    /** Number of forces currently queued. */
    pendingCount() {
        return this._pendingForces.length;
    }
}

export default ForceAccumulator;
