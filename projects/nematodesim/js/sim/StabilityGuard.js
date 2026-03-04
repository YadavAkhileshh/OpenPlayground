// NematodeSim — Stability Guard
// Monitors each organism for numerical instability:
//   1. NaN / Infinity in node positions
//   2. Kinetic energy runaway (velocity explosion)
//   3. Node scatter (body spread too large)
// Returns true when a reset is needed.

import Config from '../sim/Config.js';

export class StabilityGuard {
    constructor() {
        this.maxAllowedKE = 5e5;     // Kinetic energy ceiling (x-px)^2 sum
        this.maxBodySpread = 800;     // Max distance between head and tail (px)
        this.resetCount = 0;       // Total resets triggered
    }

    /**
     * Check one organism for instability.
     * @param {NematodeOrganism} organism
     * @returns {boolean}  true if the organism needs a position reset
     */
    check(organism) {
        const world = organism.body.world;

        // Test 1: any NaN / Inf in node positions
        if (world.hasInvalidNodes()) {
            this.resetCount++;
            this._fixNaN(world.nodes);
            return true;
        }

        // Test 2: kinetic energy explosion
        const ke = world.kineticEnergy();
        if (ke > this.maxAllowedKE) {
            this.resetCount++;
            world.resetVelocities();
            return false;   // Reset velocities but not position
        }

        // Test 3: body has scattered (constraints totally violated)
        const head = organism.body.head;
        const tail = organism.body.tail;
        const dx = head.x - tail.x;
        const dy = head.y - tail.y;
        const spread = Math.sqrt(dx * dx + dy * dy);
        if (spread > this.maxBodySpread) {
            this.resetCount++;
            return true;  // Trigger full positional respawn
        }

        return false;
    }

    /**
     * Replace NaN/Inf node positions with the last valid neighbour.
     * @param {Node[]} nodes
     */
    _fixNaN(nodes) {
        for (let i = 0; i < nodes.length; i++) {
            const nd = nodes[i];
            if (!isFinite(nd.x) || !isFinite(nd.y)) {
                // Inherit from previous node if possible
                if (i > 0) {
                    nd.x = nodes[i - 1].x + (Math.random() - 0.5) * 5;
                    nd.y = nodes[i - 1].y + (Math.random() - 0.5) * 5;
                } else {
                    nd.x = 100 + Math.random() * 200;
                    nd.y = 100 + Math.random() * 200;
                }
                nd.px = nd.x;
                nd.py = nd.y;
            }
        }
    }

    /** Check if velocity limit exceeded and clamp all nodes. */
    clampVelocities(nodes, dt) {
        const maxDisp = Config.MAX_SPEED_LIMIT * dt;
        for (let i = 0; i < nodes.length; i++) {
            nodes[i].clampDisplacement(maxDisp);
        }
    }
}

export default StabilityGuard;
