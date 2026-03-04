/**
 * @file math.js
 * @description Mathematical utility functions for signal processing and geometry.
 */

/**
 * Linearly interpolate between two values.
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolant (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(a, b, t) {
    return a * (1 - t) + b * t;
}

/**
 * Clamp a value between min and max.
 * @param {number} x - Value
 * @param {number} min - Minimum
 * @param {number} max - Maximum
 * @returns {number} Clamped value
 */
export function clamp(x, min, max) {
    return Math.max(min, Math.min(max, x));
}

/**
 * Map a value from one range to another.
 * @param {number} x - Value
 * @param {number} in_min 
 * @param {number} in_max 
 * @param {number} out_min 
 * @param {number} out_max 
 * @returns {number} Mapped value
 */
export function map(x, in_min, in_max, out_min, out_max) {
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

/**
 * Generate a NACA00xx 4-digit series airfoil coordinate.
 * @param {number} x - Normalized x coordinate (0-1)
 * @param {number} t - Thickness (e.g. 0.12 for NACA0012)
 * @returns {number} Half-thickness at x (y coordinate)
 */
export function naca4(x, t) {
    const a0 = 0.2969;
    const a1 = -0.1260;
    const a2 = -0.3516;
    const a3 = 0.2843;
    const a4 = -0.1015;

    return 5 * t * (
        a0 * Math.sqrt(x) +
        a1 * x +
        a2 * Math.pow(x, 2) +
        a3 * Math.pow(x, 3) +
        a4 * Math.pow(x, 4)
    );
}
