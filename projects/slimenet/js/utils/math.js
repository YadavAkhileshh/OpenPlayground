/**
 * SlimeNet - Math Utilities
 * 
 * Collection of helper functions for geometry, randomness, and data manipulation.
 */

const MathUtils = {
    PI: Math.PI,
    TWO_PI: Math.PI * 2,
    HALF_PI: Math.PI / 2,
    DEG_TO_RAD: Math.PI / 180,

    /**
     * Clamps a number between min and max.
     * @param {number} value 
     * @param {number} min 
     * @param {number} max 
     * @returns {number}
     */
    clamp: (value, min, max) => {
        return Math.min(Math.max(value, min), max);
    },

    /**
     * Linear interpolation between two values.
     * @param {number} start 
     * @param {number} end 
     * @param {number} amt 
     * @returns {number}
     */
    lerp: (start, end, amt) => {
        return (1 - amt) * start + amt * end;
    },

    /**
     * Returns a random float between min (inclusive) and max (exclusive).
     * @param {number} min 
     * @param {number} max 
     * @returns {number}
     */
    random: (min, max) => {
        return Math.random() * (max - min) + min;
    },

    /**
     * Returns a random integer between min (inclusive) and max (inclusive).
     * @param {number} min 
     * @param {number} max 
     * @returns {number}
     */
    randomInt: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Maps a value from one range to another.
     * @param {number} value 
     * @param {number} start1 
     * @param {number} stop1 
     * @param {number} start2 
     * @param {number} stop2 
     * @returns {number}
     */
    map: (value, start1, stop1, start2, stop2) => {
        return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
    },

    /**
     * Calculates the distance between two points.
     * @param {number} x1 
     * @param {number} y1 
     * @param {number} x2 
     * @param {number} y2 
     * @returns {number}
     */
    dist: (x1, y1, x2, y2) => {
        const dx = x1 - x2;
        const dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Calculates the squared distance between two points (faster than dist).
     * @param {number} x1 
     * @param {number} y1 
     * @param {number} x2 
     * @param {number} y2 
     * @returns {number}
     */
    distSq: (x1, y1, x2, y2) => {
        const dx = x1 - x2;
        const dy = y1 - y2;
        return dx * dx + dy * dy;
    },

    /**
     * Converts an angle in degrees to radians.
     * @param {number} degrees 
     * @returns {number}
     */
    toRadians: (degrees) => {
        return degrees * (Math.PI / 180);
    },

    /**
     * Helper to get a random point within a circle.
     * @param {number} cx Center X
     * @param {number} cy Center Y
     * @param {number} radius 
     * @returns {{x: number, y: number}}
     */
    randomPointInCircle: (cx, cy, radius) => {
        const a = Math.random() * 2 * Math.PI;
        const r = radius * Math.sqrt(Math.random());
        return {
            x: cx + r * Math.cos(a),
            y: cy + r * Math.sin(a)
        };
    }
};

// Global export for vanilla JS without modules
window.MathUtils = MathUtils;
