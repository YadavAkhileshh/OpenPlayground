/**
 * math.js
 * Common mathematical utilities for the AgingWeb engine.
 */

/**
 * Linear interpolation between two values.
 * @param {number} start 
 * @param {number} end 
 * @param {number} t - Factor between 0 and 1
 * @returns {number}
 */
export function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

/**
 * Clamps a value between a min and max.
 * @param {number} val 
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
export function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
}

/**
 * Maps a value from one range to another.
 * @param {number} value 
 * @param {number} inMin 
 * @param {number} inMax 
 * @param {number} outMin 
 * @param {number} outMax 
 * @returns {number}
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

/**
 * Generates a random float between min and max.
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
export function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Generates a random integer between min and max.
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function dist(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}
