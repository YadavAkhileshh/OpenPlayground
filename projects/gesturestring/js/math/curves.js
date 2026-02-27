/**
 * Bezier Curve Utilities
 */
import { Vector3 } from './vector3.js';

export class Curves {
    /**
     * Calculates a point on a cubic Bezier curve.
     * @param {Vector3} p0 - Start point.
     * @param {Vector3} p1 - Control point 1.
     * @param {Vector3} p2 - Control point 2.
     * @param {Vector3} p3 - End point.
     * @param {number} t - Interpolation factor (0-1).
     * @returns {Vector3} Point on the curve.
     */
    static cubicBezier(p0, p1, p2, p3, t) {
        const oneMinusT = 1 - t;
        const t2 = t * t;
        const t3 = t2 * t;
        const oneMinusT2 = oneMinusT * oneMinusT;
        const oneMinusT3 = oneMinusT2 * oneMinusT;

        const x = oneMinusT3 * p0.x + 3 * oneMinusT2 * t * p1.x + 3 * oneMinusT * t2 * p2.x + t3 * p3.x;
        const y = oneMinusT3 * p0.y + 3 * oneMinusT2 * t * p1.y + 3 * oneMinusT * t2 * p2.y + t3 * p3.y;
        const z = oneMinusT3 * p0.z + 3 * oneMinusT2 * t * p1.z + 3 * oneMinusT * t2 * p2.z + t3 * p3.z;

        return new Vector3(x, y, z);
    }

    /**
     * Calculates points for a catmull-rom spline (simplified) or just smooths a path.
     * For GestureStrings, we mostly need to smooth the mouse input.
     * We'll use a simple quadratic or cubic approach based on history.
     */
}
