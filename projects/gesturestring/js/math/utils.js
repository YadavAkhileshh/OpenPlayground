/**
 * Math Utilities for GestureStrings
 * Provides common mathematical functions and constants.
 * @module MathUtils
 */

export const PI = Math.PI;
export const TWO_PI = Math.PI * 2;
export const HALF_PI = Math.PI / 2;

/**
 * Clamps a value between a minimum and maximum.
 * @param {number} value - The value to clamp.
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} The clamped value.
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Linearly interpolates between two values.
 * @param {number} start - The start value.
 * @param {number} end - The end value.
 * @param {number} t - The interpolation factor (0-1).
 * @returns {number} The interpolated value.
 */
export function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

/**
 * Maps a value from one range to another.
 * @param {number} value - The value to map.
 * @param {number} inMin - The start of the input range.
 * @param {number} inMax - The end of the input range.
 * @param {number} outMin - The start of the output range.
 * @param {number} outMax - The end of the output range.
 * @returns {number} The mapped value.
 */
export function map(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

/**
 * Generates a random float between min and max.
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} A random float.
 */
export function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Generates a random integer between min and max.
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} A random integer.
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Converts degrees to radians.
 * @param {number} degrees - The angle in degrees.
 * @returns {number} The angle in radians.
 */
export function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Converts radians to degrees.
 * @param {number} radians - The angle in radians.
 * @returns {number} The angle in degrees.
 */
export function radToDeg(radians) {
    return radians * (180 / Math.PI);
}

/**
 * Calculates the distance between two 2D points.
 * @param {number} x1 - X coordinate of first point.
 * @param {number} y1 - Y coordinate of first point.
 * @param {number} x2 - X coordinate of second point.
 * @param {number} y2 - Y coordinate of second point.
 * @returns {number} The distance.
 */
export function dist(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}
