/**
 * Utility class providing static helper methods for mathematics and geometry.
 * Essential for physics calculations, interpolation, and intersection detection.
 */
class Utils {
    /**
     * Linear Interpolation
     * Returns a value between A and B based on parameter t.
     * @param {number} A - Start value
     * @param {number} B - End value
     * @param {number} t - Interpolation factor (0 to 1)
     * @returns {number} Interpolated value
     */
    static lerp(A, B, t) {
        return A + (B - A) * t;
    }

    /**
     * Calculates the intersection point between two line segments.
     * Segment 1: A to B
     * Segment 2: C to D
     * 
     * Uses vector cross product implementation.
     * 
     * @param {Object} A - Start of segment 1 {x, y}
     * @param {Object} B - End of segment 1 {x, y}
     * @param {Object} C - Start of segment 2 {x, y}
     * @param {Object} D - End of segment 2 {x, y}
     * @returns {Object|null} Intersection point {x, y, offset} or null if no intersection
     */
    static getIntersection(A, B, C, D) {
        const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
        const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
        const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

        if (bottom != 0) {
            const t = tTop / bottom;
            const u = uTop / bottom;
            if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
                return {
                    x: Utils.lerp(A.x, B.x, t),
                    y: Utils.lerp(A.y, B.y, t),
                    offset: t
                }
            }
        }

        return null;
    }

    /**
     * Checks if two polygons intersect.
     * Polygons are defined as arrays of points {x, y}.
     * 
     * @param {Array<Object>} poly1 - First polygon points
     * @param {Array<Object>} poly2 - Second polygon points
     * @returns {boolean} True if polygons intersect
     */
    static polysIntersect(poly1, poly2) {
        for (let i = 0; i < poly1.length; i++) {
            for (let j = 0; j < poly2.length; j++) {
                const touch = Utils.getIntersection(
                    poly1[i],
                    poly1[(i + 1) % poly1.length],
                    poly2[j],
                    poly2[(j + 1) % poly2.length]
                );
                if (touch) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Converts a numeric value to an RGBA color string.
     * Positive values are blue/black (visualized as inactive/active logic elsewhere),
     * Negative values are yellow/red (depending on implementation context).
     * Here: 
     * - Positive -> Blue channel (Black to Blue)
     * - Negative -> Red channel (Black to Red) for generic heatmaps.
     * Actually currently implements:
     * - Val < 0 -> Yellow/Red mix logic?
     * Let's clarify:
     * Current Logic:
     * Alpha = abs(value)
     * R = value < 0 ? 0 : 255 -> If pos, R=255. If neg, R=0.
     * G = R -> If pos, G=255. If neg, G=0.
     * B = value > 0 ? 0 : 255 -> If pos, B=0. If neg, B=255.
     * 
     * Result:
     * Positive: R=255, G=255, B=0 (Yellow)
     * Negative: R=0, G=0, B=255 (Blue)
     * 
     * @param {number} value - Input value (-1 to 1 usually)
     * @returns {string} RGBA string
     */
    static getRGBA(value) {
        const alpha = Math.abs(value);
        const R = value < 0 ? 0 : 255;
        const G = R;
        const B = value > 0 ? 0 : 255;
        return "rgba(" + R + "," + G + "," + B + "," + alpha + ")";
    }

    /**
     * Generates a random number between min and max.
     * @param {number} min 
     * @param {number} max 
     * @returns {number}
     */
    static random(min, max) {
        return Math.random() * (max - min) + min;
    }
}
