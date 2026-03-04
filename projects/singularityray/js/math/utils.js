/**
 * SingularityRay JS - Math - Utils
 * Utility functions for clamping, smoothing, and randomness.
 */

import { PI } from './constants.js';

export const MathUtils = {
    /**
     * Clamp a number between min and max
     * @param {number} value
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    clamp: (value, min, max) => Math.max(min, Math.min(max, value)),

    /**
     * Linear interpolation
     * @param {number} a
     * @param {number} b
     * @param {number} t
     * @returns {number}
     */
    lerp: (a, b, t) => a + (b - a) * t,

    /**
     * Smoothstep function for smooth interpolation
     * @param {number} edge0
     * @param {number} edge1
     * @param {number} x
     * @returns {number}
     */
    smoothstep: (edge0, edge1, x) => {
        const t = MathUtils.clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
        return t * t * (3.0 - 2.0 * t);
    },

    /**
     * Degree to Radians
     * @param {number} deg
     * @returns {number}
     */
    degToRad: (deg) => deg * (PI / 180.0),

    /**
     * Radians to Degrees
     * @param {number} rad
     * @returns {number}
     */
    radToDeg: (rad) => rad * (180.0 / PI),

    /**
     * Fractional part of a number
     * @param {number} x
     * @returns {number}
     */
    fract: (x) => x - Math.floor(x),

    /**
     * Modulo operation matching GLSL mod(x, y)
     * @param {number} x 
     * @param {number} y 
     * @returns {number}
     */
    mod: (x, y) => x - y * Math.floor(x / y),

    /**
     * Map a value from one range to another
     */
    mapRange: (value, inMin, inMax, outMin, outMax) => {
        return outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin);
    },

    /**
     * Robust random number generator based on a seed
     * Using mulberry32 algorithm
     */
    seededRandom: (seed) => {
        return () => {
            let t = seed += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    }
};
