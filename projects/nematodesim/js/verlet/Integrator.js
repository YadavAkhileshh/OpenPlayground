// NematodeSim — Verlet Integrator
// Core explicit Verlet integration step.
// x_new = 2*x - x_prev + (F/m)*dt²
// Handles force → acceleration → position update for each node.

import Config from '../sim/Config.js';

export class Integrator {
    /**
     * @param {number} damping  Velocity damping factor ∈ (0, 1]
     */
    constructor(damping = Config.DAMPING) {
        this.damping = damping;
    }

    /**
     * Integrate a single node forward by dt seconds using Verlet.
     * Reads fx,fy as accumulated force; writes x,y and stores old x,y in px,py.
     * @param {Node}   node
     * @param {number} dt    Sub-step timestep (seconds)
     */
    integrateNode(node, dt) {
        if (node.pinned) return;

        const ax = node.fx * node.invMass;
        const ay = node.fy * node.invMass;

        const dt2 = dt * dt;

        // Standard Verlet position update
        const nextX = node.x + (node.x - node.px) * this.damping + ax * dt2;
        const nextY = node.y + (node.y - node.py) * this.damping + ay * dt2;

        node.px = node.x;
        node.py = node.y;
        node.x = nextX;
        node.y = nextY;
    }

    /**
     * Integrate all nodes in an array.
     * @param {Node[]} nodes
     * @param {number} dt
     */
    integrateAll(nodes, dt) {
        const n = nodes.length;
        for (let i = 0; i < n; i++) {
            this.integrateNode(nodes[i], dt);
        }
    }

    /**
     * Update cached velocity for all nodes after integration.
     * Must be called after integrateAll() with the same dt.
     * @param {Node[]} nodes
     * @param {number} dt
     */
    updateVelocities(nodes, dt) {
        const n = nodes.length;
        for (let i = 0; i < n; i++) {
            nodes[i].computeVelocity(dt);
        }
    }

    /**
     * Apply velocity clamping to prevent energetic explosions.
     * Scales the displacement vector (x - px) to maxDisp if over limit.
     * @param {Node[]} nodes
     * @param {number} maxDisp  Maximum allowed displacement per step
     */
    clampAll(nodes, maxDisp) {
        const n = nodes.length;
        for (let i = 0; i < n; i++) {
            nodes[i].clampDisplacement(maxDisp);
        }
    }

    /** Adjust damping coefficient (called from viscosity slider). */
    setDamping(d) {
        this.damping = Math.max(0.8, Math.min(1.0, d));
    }
}

export default Integrator;
