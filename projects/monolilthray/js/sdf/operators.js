/**
 * @file operators.js
 * @description Operations to combine and manipulate SDFs.
 */

const Ops = {
    /**
     * Union of two distances (min).
     */
    union: (d1, d2) => Math.min(d1, d2),

    /**
     * Subtraction (d2 - d1).
     */
    subtract: (d1, d2) => Math.max(-d1, d2),

    /**
     * Intersection (max).
     */
    intersect: (d1, d2) => Math.max(d1, d2),

    /**
     * Smooth union using polynomial mixing.
     * @param {number} d1 
     * @param {number} d2 
     * @param {number} k Smoothness factor
     */
    smoothUnion: (d1, d2, k) => {
        const h = Math.max(k - Math.abs(d1 - d2), 0.0) / k;
        return Math.min(d1, d2) - h * h * k * (1.0 / 4.0);
    },

    /**
     * Smooth subtraction.
     */
    smoothSubtract: (d1, d2, k) => {
        const h = Math.max(k - Math.abs(-d1 - d2), 0.0) / k;
        return Math.max(-d1, d2) + h * h * k * (1.0 / 4.0);
    },

    /**
     * Smooth intersection.
     */
    smoothIntersect: (d1, d2, k) => {
        const h = Math.max(k - Math.abs(d1 - d2), 0.0) / k;
        return Math.max(d1, d2) + h * h * k * (1.0 / 4.0);
    },

    /**
     * Domain Repetition (Infinite repetition in space).
     * @param {Vec3} p Point
     * @param {Vec3} c Spacing vector
     */
    repeat: (p, c) => {
        // (p % c) - 0.5 * c
        return new Vec3(
            MathUtils.mod(p.x + 0.5 * c.x, c.x) - 0.5 * c.x,
            MathUtils.mod(p.y + 0.5 * c.y, c.y) - 0.5 * c.y,
            MathUtils.mod(p.z + 0.5 * c.z, c.z) - 0.5 * c.z
        );
    },

    /**
     * Twist the domain around the Y axis.
     */
    twist: (p, k) => {
        const c = Math.cos(k * p.y);
        const s = Math.sin(k * p.y);
        const m = [
            c, -s,
            s, c
        ];
        // Rotate x and z
        return new Vec3(
            m[0] * p.x + m[1] * p.z,
            p.y,
            m[2] * p.x + m[3] * p.z
        );
    }
};

if (typeof self !== 'undefined') self.Ops = Ops;
