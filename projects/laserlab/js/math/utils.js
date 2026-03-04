/**
 * Math Utils
 * Geometric helpers and intersection logic.
 */
import { Vector } from './vector.js';

export const Utils = {
    /**
     * Checks intersection between two line segments.
     * @param {Vector} p1 Start of line 1
     * @param {Vector} p2 End of line 1
     * @param {Vector} p3 Start of line 2
     * @param {Vector} p4 End of line 2
     * @returns {Object|null} Intersection point {x, y, t} or null
     */
    lineIntersect: (p1, p2, p3, p4) => {
        const x1 = p1.x, y1 = p1.y;
        const x2 = p2.x, y2 = p2.y;
        const x3 = p3.x, y3 = p3.y;
        const x4 = p4.x, y4 = p4.y;

        const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
        if (denom === 0) return null; // Parallel

        const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
        const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

        if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
            return {
                x: x1 + ua * (x2 - x1),
                y: y1 + ua * (y2 - y1),
                t: ua // localized parameter on line 1
            };
        }
        return null;
    },

    /**
     * Point in polygon check (Ray Casting algorithm).
     * @param {Vector} point 
     * @param {Vector[]} vertices 
     * @returns {boolean}
     */
    pointInPolygon: (point, vertices) => {
        let inside = false;
        for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
            const xi = vertices[i].x, yi = vertices[i].y;
            const xj = vertices[j].x, yj = vertices[j].y;

            const intersect = ((yi > point.y) !== (yj > point.y))
                && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    },

    /**
     * Closest point on a line segment to a point.
     * @param {Vector} p Point
     * @param {Vector} a Line start
     * @param {Vector} b Line end
     * @returns {Vector}
     */
    closestPointOnSegment: (p, a, b) => {
        const ap = p.sub(a);
        const ab = b.sub(a);
        let t = ap.dot(ab) / ab.dot(ab);
        t = Math.max(0, Math.min(1, t));
        return a.add(ab.mult(t));
    },

    /**
     * Converts degrees to radians.
     * @param {number} deg 
     * @returns {number}
     */
    degToRad: (deg) => deg * (Math.PI / 180),

    /**
     * Converts radians to degrees.
     * @param {number} rad 
     * @returns {number}
     */
    radToDeg: (rad) => rad * (180 / Math.PI),

    /**
     * Clamps a value between min and max.
     * @param {number} val 
     * @param {number} min 
     * @param {number} max 
     * @returns {number}
     */
    clamp: (val, min, max) => Math.min(Math.max(val, min), max)
};
