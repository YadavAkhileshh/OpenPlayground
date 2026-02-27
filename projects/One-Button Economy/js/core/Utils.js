/**
 * Utils.js
 * 
 * A collection of utility functions for math, random generation, and other common tasks.
 */

export class Utils {
    /**
     * Generates a random integer between min and max (inclusive).
     * @param {number} min - The minimum value.
     * @param {number} max - The maximum value.
     * @returns {number} The random integer.
     */
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Generates a random float between min and max.
     * @param {number} min - The minimum value.
     * @param {number} max - The maximum value.
     * @returns {number} The random float.
     */
    static randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Clamps a number between a minimum and maximum value.
     * @param {number} value - The value to clamp.
     * @param {number} min - The minimum allowed value.
     * @param {number} max - The maximum allowed value.
     * @returns {number} The clamped value.
     */
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * Calculates the distance between two points (x1, y1) and (x2, y2).
     * @param {number} x1 - X coordinate of the first point.
     * @param {number} y1 - Y coordinate of the first point.
     * @param {number} x2 - X coordinate of the second point.
     * @param {number} y2 - Y coordinate of the second point.
     * @returns {number} The distance between the points.
     */
    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Measures distance squared (faster than distance as it avoids sqrt).
     * Useful for comparison.
     * @param {number} x1 
     * @param {number} y1 
     * @param {number} x2 
     * @param {number} y2 
     * @returns {number} distance squared
     */
    static distanceSquared(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return dx * dx + dy * dy;
    }

    /**
     * Linearly interpolates between start and end by amount t.
     * @param {number} start - The start value.
     * @param {number} end - The end value.
     * @param {number} t - The interpolation amount (0.0 to 1.0).
     * @returns {number} The interpolated value.
     */
    static lerp(start, end, t) {
        return start * (1 - t) + end * t;
    }

    /**
     * Generates a unique ID (UUID v4 style).
     * @returns {string} A unique identifier string.
     */
    static generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Converts degrees to radians.
     * @param {number} degrees 
     * @returns {number} radians
     */
    static degToRad(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Converts radians to degrees.
     * @param {number} radians 
     * @returns {number} degrees
     */
    static radToDeg(radians) {
        return radians * (180 / Math.PI);
    }

    /**
     * Picks a random element from an array.
     * @param {Array} array 
     * @returns {*} Random element
     */
    static randomArrayElement(array) {
        if (!array || array.length === 0) return null;
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Checks if two rectangles overlap (AABB collision).
     * @param {Object} rect1 - {x, y, width, height}
     * @param {Object} rect2 - {x, y, width, height}
     * @returns {boolean} True if overlapping
     */
    static rectIntersect(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    /**
     * Simple circle collision check.
     * @param {Object} c1 - {x, y, radius}
     * @param {Object} c2 - {x, y, radius}
     * @returns {boolean}
     */
    static circleIntersect(c1, c2) {
        const d = Utils.distance(c1.x, c1.y, c2.x, c2.y);
        return d < (c1.radius + c2.radius);
    }
}
