// NematodeSim — Angle Constraint
// Maintains a target bending angle between three consecutive body nodes.
// Provides structural resistance to over-bending (body rigidity).

import { Constraint } from './Constraint.js';
import Config from '../sim/Config.js';

export class AngleConstraint {
    /**
     * @param {Node}   nodeA     Previous node (upstream)
     * @param {Node}   nodeB     Middle (pivot) node
     * @param {Node}   nodeC     Next node (downstream)
     * @param {number} restAngle Target angle in radians (default: Math.PI = straight)
     */
    constructor(nodeA, nodeB, nodeC, restAngle = Math.PI) {
        this.nodeA = nodeA;
        this.nodeB = nodeB;
        this.nodeC = nodeC;
        this.restAngle = restAngle;
        this.stiffness = Config.ANGLE_STIFFNESS;
        this.active = true;
        this.debugColor = '#ffee33';
    }

    /** @param {number} _dt */
    solve(_dt) {
        if (!this.active) return;

        const a = this.nodeA;
        const b = this.nodeB;
        const c = this.nodeC;

        // Vectors: b→a and b→c
        const bax = a.x - b.x;
        const bay = a.y - b.y;
        const bcx = c.x - b.x;
        const bcy = c.y - b.y;

        const lenBA = Math.sqrt(bax * bax + bay * bay);
        const lenBC = Math.sqrt(bcx * bcx + bcy * bcy);

        if (lenBA < 1e-8 || lenBC < 1e-8) return;

        // Cosine of current angle via dot product
        const dot = (bax * bcx + bay * bcy) / (lenBA * lenBC);
        const cosReal = Math.max(-1.0, Math.min(1.0, dot));
        const angle = Math.acos(cosReal);

        const err = angle - this.restAngle;
        if (Math.abs(err) < 1e-6) return;

        // Cross product (2D → scalar z): sign of rotation
        const cross = bax * bcy - bay * bcx;
        const sign = cross < 0 ? -1.0 : 1.0;

        const k = this.stiffness;
        const cor = sign * err * k * 0.5;

        // Correction perpendicular to each arm
        const perp = 0.3; // fraction applied to pivot neighbours
        if (!a.pinned) {
            a.x -= cor * bay * perp / lenBA;
            a.y += cor * bax * perp / lenBA;
        }
        if (!b.pinned) {
            b.x += cor * bay * perp / lenBA;
            b.y -= cor * bax * perp / lenBA;
            b.x += cor * bcy * perp / lenBC;
            b.y -= cor * bcx * perp / lenBC;
        }
        if (!c.pinned) {
            c.x -= cor * bcy * perp / lenBC;
            c.y += cor * bcx * perp / lenBC;
        }
    }

    /** Current angle between the three nodes (radians). */
    currentAngle() {
        const bax = this.nodeA.x - this.nodeB.x;
        const bay = this.nodeA.y - this.nodeB.y;
        const bcx = this.nodeC.x - this.nodeB.x;
        const bcy = this.nodeC.y - this.nodeB.y;
        const lenBA = Math.sqrt(bax * bax + bay * bay);
        const lenBC = Math.sqrt(bcx * bcx + bcy * bcy);
        if (lenBA < 1e-8 || lenBC < 1e-8) return this.restAngle;
        const dot = (bax * bcx + bay * bcy) / (lenBA * lenBC);
        return Math.acos(Math.max(-1, Math.min(1, dot)));
    }

    /** Angular error from rest angle (radians). */
    error() {
        return Math.abs(this.currentAngle() - this.restAngle);
    }

    enable() { this.active = true; return this; }
    disable() { this.active = false; return this; }
    isActive() { return this.active; }
}

export default AngleConstraint;
