// NematodeSim — Contraction Engine
// Applies CPG muscle force vectors to body nodes each physics frame.
// For each segment, the body normal (perpendicular to local tangent) is
// computed from adjacent nodes, then the CPG's lateral force is applied.

import Config from '../sim/Config.js';

export class ContractionEngine {
    /**
     * @param {CPG} cpg  The organism's central pattern generator
     */
    constructor(cpg) {
        this.cpg = cpg;
        this._forceScale = 1.0;   // Global force multiplier (from amplitude slider)
        this.enabled = true;
    }

    /**
     * Apply all muscle contraction forces to the body node chain.
     * Called after CPG.update() and before VerletSolver.step().
     * @param {Node[]} nodes  Ordered body node array
     * @param {number} dt     Sub-step timestep (seconds)
     */
    apply(nodes, dt) {
        if (!this.enabled) return;

        const n = nodes.length;
        for (let i = 1; i < n - 1; i++) {
            // Local body tangent from node i-1 → i+1
            const tx = nodes[i + 1].x - nodes[i - 1].x;
            const ty = nodes[i + 1].y - nodes[i - 1].y;
            const len = Math.sqrt(tx * tx + ty * ty);
            if (len < 1e-8) continue;

            // Perpendicular (normal) to body axis — the lateral direction
            const nx = -ty / len;
            const ny = tx / len;

            // Get CPG lateral force at this segment
            const { fx, fy } = this.cpg.lateralForceAt(i, nx, ny);

            // Apply to this node
            nodes[i].addForce(fx * this._forceScale, fy * this._forceScale);
        }

        // Head node (i=0): use tangent from node0→node1
        if (n > 1) {
            const tx = nodes[1].x - nodes[0].x;
            const ty = nodes[1].y - nodes[0].y;
            const len = Math.sqrt(tx * tx + ty * ty);
            if (len > 1e-8) {
                const nx = -ty / len;
                const ny = tx / len;
                const { fx, fy } = this.cpg.lateralForceAt(0, nx, ny);
                nodes[0].addForce(fx * this._forceScale * 0.5, fy * this._forceScale * 0.5);
            }
        }

        // Tail node: half force, same tangent direction
        if (n > 1) {
            const i = n - 1;
            const tx = nodes[i].x - nodes[i - 1].x;
            const ty = nodes[i].y - nodes[i - 1].y;
            const len = Math.sqrt(tx * tx + ty * ty);
            if (len > 1e-8) {
                const nx = -ty / len;
                const ny = tx / len;
                const { fx, fy } = this.cpg.lateralForceAt(i, nx, ny);
                nodes[i].addForce(fx * this._forceScale * 0.4, fy * this._forceScale * 0.4);
            }
        }
    }

    /** Adjust global force scale (used by amplitude control). */
    setForceScale(s) {
        this._forceScale = Math.max(0.1, Math.min(5.0, s));
    }

    /** Disable all muscle activity. */
    disable() { this.enabled = false; }
    enable() { this.enabled = true; }
}

export default ContractionEngine;
