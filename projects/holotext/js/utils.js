/**
 * Utility functions for HoloText
 * Provides common math helpers, DOM queries, and random generators.
 */

const Utils = {
    /**
     * Clamps a value between a minimum and maximum.
     * Useful for restricting values within a safe range.
     * @param {number} value - The input value.
     * @param {number} min - The lower bound.
     * @param {number} max - The upper bound.
     * @returns {number} The clamped value.
     */
    clamp: (value, min, max) => Math.min(Math.max(value, min), max),

    /**
     * Linearly interpolates between two values.
     * Used for smooth animation and transitions.
     * @param {number} start - The starting value.
     * @param {number} end - The target value.
     * @param {number} amt - The interpolation factor (0.0 to 1.0).
     * @returns {number} The interpolated value.
     */
    lerp: (start, end, amt) => (1 - amt) * start + amt * end,

    /**
     * Maps a value from one range to another.
     * Similar to Arduino's map() function.
     * @param {number} value - The input value.
     * @param {number} inMin - The input range minimum.
     * @param {number} inMax - The input range maximum.
     * @param {number} outMin - The output range minimum.
     * @param {number} outMax - The output range maximum.
     * @returns {number} The mapped value.
     */
    mapRange: (value, inMin, inMax, outMin, outMax) => {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    },

    /**
     * Generates a random integer between min and max (inclusive).
     * @param {number} min - The minimum integer.
     * @param {number} max - The maximum integer.
     * @returns {number} A random integer.
     */
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1) + min),

    /**
     * Generates a random float between min and max.
     * @param {number} min - The minimum value.
     * @param {number} max - The maximum value.
     * @returns {number} A random float.
     */
    randomFloat: (min, max) => Math.random() * (max - min) + min,

    /**
     * Queries a single DOM element.
     * Acts as a shorthand for document.querySelector.
     * @param {string} selector - The CSS selector string.
     * @returns {HTMLElement|null} The matching element or null.
     */
    qs: (selector) => document.querySelector(selector),

    /**
     * Queries multiple DOM elements.
     * Acts as a shorthand for document.querySelectorAll.
     * @param {string} selector - The CSS selector string.
     * @returns {NodeListOf<HTMLElement>} A list of matching elements.
     */
    qsa: (selector) => document.querySelectorAll(selector),

    /**
     * Converts degrees to radians.
     * @param {number} deg - Angle in degrees.
     * @returns {number} Angle in radians.
     */
    degToRad: (deg) => deg * (Math.PI / 180),

    /**
     * Converts radians to degrees.
     * @param {number} rad - Angle in radians.
     * @returns {number} Angle in degrees.
     */
    radToDeg: (rad) => rad * (180 / Math.PI)
};
