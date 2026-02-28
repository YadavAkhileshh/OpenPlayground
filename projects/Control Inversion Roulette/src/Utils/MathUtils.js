/**
 * Math Utilities
 * 
 * A collection of helper functions for common mathematical operations
 * used in game development, such as vector math, random number generation,
 * and collision detection helpers.
 */

export class MathUtils {

    /**
     * Generates a random floating-point number between min (inclusive) and max (exclusive).
     * @param {number} min 
     * @param {number} max 
     * @returns {number}
     */
    static randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Generates a random integer between min (inclusive) and max (inclusive).
     * @param {number} min 
     * @param {number} max 
     * @returns {number}
     */
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Clamps a value between a minimum and maximum value.
     * @param {number} value 
     * @param {number} min 
     * @param {number} max 
     * @returns {number}
     */
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * Calculates the distance between two points (x1, y1) and (x2, y2).
     * @param {number} x1 
     * @param {number} y1 
     * @param {number} x2 
     * @param {number} y2 
     * @returns {number}
     */
    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calculates the angle in radians between two points.
     * @param {number} x1 
     * @param {number} y1 
     * @param {number} x2 
     * @param {number} y2 
     * @returns {number} Angle in radians
     */
    static angleBetween(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }

    /**
     * Linear interpolation between start and end values.
     * @param {number} start 
     * @param {number} end 
     * @param {number} t Interpolation factor (0-1)
     * @returns {number}
     */
    static lerp(start, end, t) {
        return start * (1 - t) + end * t;
    }

    /**
     * Converts degrees to radians.
     * @param {number} degrees 
     * @returns {number}
     */
    static degToRad(degrees) {
        return degrees * Math.PI / 180;
    }

    /**
     * Converts radians to degrees.
     * @param {number} radians 
     * @returns {number}
     */
    static radToDeg(radians) {
        return radians * 180 / Math.PI;
    }

    /**
     * Checks if two circles intersect.
     * @param {Object} c1 Circle 1 {x, y, radius}
     * @param {Object} c2 Circle 2 {x, y, radius}
     * @returns {boolean}
     */
    static circleIntersect(c1, c2) {
        const dist = MathUtils.distance(c1.x, c1.y, c2.x, c2.y);
        return dist < (c1.radius + c2.radius);
    }

    /**
     * Returns a random element from an array.
     * @param {Array} array 
     * @returns {*}
     */
    static randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
}
