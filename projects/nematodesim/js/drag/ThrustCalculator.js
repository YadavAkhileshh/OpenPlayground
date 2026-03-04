// NematodeSim — Thrust Calculator
// Estimates the net forward thrust each organism generates per frame.
// In real nematodes, thrust emerges from anisotropic drag asymmetry:
// transverse drag (γ_n) > longitudinal drag (γ_t), so lateral body waves
// produce a net rearward push on the fluid => forward propulsion.

export class ThrustCalculator {
    constructor() {
        // Running averages (exponential smoothing)
        this.thrustX = 0;
        this.thrustY = 0;
        this.thrustMag = 0;
        this._alpha = 0.12;  // Smoothing factor
        // Head-direction unit vector (for decomposition)
        this._headDirX = 1;
        this._headDirY = 0;
    }

    /**
     * Update head direction from the first two body nodes.
     * @param {Node} head  First node
     * @param {Node} neck  Second node
     */
    updateHeadDirection(head, neck) {
        const dx = neck.x - head.x;
        const dy = neck.y - head.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 1e-6) {
            this._headDirX = -dx / len;   // Forward = opposite of head→neck
            this._headDirY = -dy / len;
        }
    }

    /**
     * Compute instantaneous thrust from node velocities.
     * Thrust is the component of mass-centre velocity along the head direction.
     * @param {Node[]} nodes
     * @param {number} dt
     * @returns {number}  Signed thrust magnitude
     */
    computeInstantaneous(nodes, dt) {
        if (nodes.length < 2) return 0;

        this.updateHeadDirection(nodes[0], nodes[1]);

        const invDt = dt > 0 ? 1.0 / dt : 0;
        let vx = 0;
        let vy = 0;

        const n = nodes.length;
        for (let i = 0; i < n; i++) {
            vx += (nodes[i].x - nodes[i].px) * invDt;
            vy += (nodes[i].y - nodes[i].py) * invDt;
        }
        vx /= n;
        vy /= n;

        return vx * this._headDirX + vy * this._headDirY;
    }

    /**
     * Update smoothed thrust estimate using exponential moving average.
     * @param {Node[]} nodes
     * @param {number} dt
     */
    update(nodes, dt) {
        const inst = this.computeInstantaneous(nodes, dt);
        const a = this._alpha;
        this.thrustX = this.thrustX * (1 - a) + this._headDirX * inst * a;
        this.thrustY = this.thrustY * (1 - a) + this._headDirY * inst * a;
        this.thrustMag = Math.sqrt(this.thrustX * this.thrustX + this.thrustY * this.thrustY);
    }

    /** Signed forward velocity (positive = moving in head direction). */
    forwardSpeed() {
        return Math.sqrt(this.thrustX * this.thrustX + this.thrustY * this.thrustY);
    }

    /** Reset smoothed values (called on respawn / reset). */
    reset() {
        this.thrustX = 0;
        this.thrustY = 0;
        this.thrustMag = 0;
    }
}

export default ThrustCalculator;
