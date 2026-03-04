// NematodeSim — Distance Constraint
// Maintains the rest length between two adjacent body nodes.
// Uses position-based dynamics (PBD) correction.

import { Constraint } from './Constraint.js';

export class DistanceConstraint extends Constraint {
    /**
     * @param {Node}   nodeA       First node
     * @param {Node}   nodeB       Second node
     * @param {number} restLength  Target rest distance (px)
     */
    constructor(nodeA, nodeB, restLength) {
        super(nodeA, nodeB);
        this.restLength = restLength;
        this.stiffness = 1.0;
        this.debugColor = '#00ffaa';
    }

    /**
     * Solve the distance constraint.
     * Moves both nodes along the separation vector to satisfy |AB| == restLength.
     * Uses mass-weighted correction so heavier nodes move less.
     * @param {number} _dt  Timestep (unused for simple PBD, used in XPBD extension)
     */
    solve(_dt) {
        if (!this.active) return;

        const a = this.nodeA;
        const b = this.nodeB;

        const dx = b.x - a.x;
        const dy = b.y - a.y;

        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1e-8) return;   // Degenerate — nodes coincident

        const diff = (dist - this.restLength) / dist;
        const k = this.stiffness;

        const totalInvMass = a.invMass + b.invMass;
        if (totalInvMass < 1e-12) return;

        const correctionX = diff * dx * k;
        const correctionY = diff * dy * k;

        const wA = a.invMass / totalInvMass;
        const wB = b.invMass / totalInvMass;

        if (!a.pinned) {
            a.x += correctionX * wA;
            a.y += correctionY * wA;
        }
        if (!b.pinned) {
            b.x -= correctionX * wB;
            b.y -= correctionY * wB;
        }
    }

    /**
     * Absolute difference between current distance and rest length.
     * @returns {number}
     */
    error() {
        const dx = this.nodeB.x - this.nodeA.x;
        const dy = this.nodeB.y - this.nodeA.y;
        return Math.abs(Math.sqrt(dx * dx + dy * dy) - this.restLength);
    }

    /**
     * Update the rest length dynamically (used by muscle contraction engine).
     * @param {number} delta  Signed deviation applied to rest length
     */
    setRestLengthDelta(delta) {
        this.restLength += delta;
    }

    /**
     * Clamp rest length so it never collapses to zero or stretches unrealistically.
     * @param {number} minLen  Minimum allowed rest length
     * @param {number} maxLen  Maximum allowed rest length
     */
    clampRestLength(minLen, maxLen) {
        this.restLength = Math.max(minLen, Math.min(maxLen, this.restLength));
    }
}

export default DistanceConstraint;
