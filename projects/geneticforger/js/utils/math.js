/**
 * Math utility functions for the GeneticForger engine.
 * Provides helper functions for random number generation, clamping, and interpolation.
 * 
 * @module Utils/Math
 * @author GeneticForger Team
 */

/**
 * Generates a random integer between min and max (inclusive).
 * Uses Math.floor(Math.random()) internally.
 * 
 * @example
 * const val = randomInt(5, 10); // Returns 5, 6, 7, 8, 9, or 10
 * 
 * @param {number} min - Minimum value of the range.
 * @param {number} max - Maximum value of the range.
 * @returns {number} Random integer between min and max.
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random float between min and max.
 * Use this for continuous value generation like coordinates or opacity.
 * 
 * @example
 * const alpha = randomFloat(0.1, 0.5);
 * 
 * @param {number} min - Minimum value.
 * @param {number} max - Maximum value.
 * @returns {number} Random floating point number.
 */
export function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Clamps a number between a minimum and maximum value.
 * Essential for keeping polygon vertices within the unit square (0-1)
 * and color values within valid ranges (0-255).
 * 
 * @example
 * const visible = clamp(-0.5, 0, 1); // Returns 0
 * 
 * @param {number} value - The input value to clamp.
 * @param {number} min - The lower bound.
 * @param {number} max - The upper bound.
 * @returns {number} The clamped value.
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Linearly interpolates between two values based on a factor t.
 * Useful for animations or smooth transitions.
 * 
 * @param {number} start - The start value.
 * @param {number} end - The end value.
 * @param {number} t - The interpolation factor (usually 0.0 to 1.0).
 * @returns {number} The interpolated value.
 */
export function lerp(start, end, t) {
    return start + (end - start) * t;
}
