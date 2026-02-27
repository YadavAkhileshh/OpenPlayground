/**
 * QuadCompress Math Utilities
 * 
 * General purpose mathematical helper functions.
 * 
 * @module MathUtils
 */

/**
 * Clamps a number between min and max
 * @param {number} val 
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
export function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
}

/**
 * Linear interpolation
 * @param {number} start 
 * @param {number} end 
 * @param {number} t (0-1)
 * @returns {number}
 */
export function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

/**
 * Maps a value from one range to another
 * @param {number} value 
 * @param {number} inMin 
 * @param {number} inMax 
 * @param {number} outMin 
 * @param {number} outMax 
 * @returns {number}
 */
export function map(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}
