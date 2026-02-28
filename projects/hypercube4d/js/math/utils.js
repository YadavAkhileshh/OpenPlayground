/**
 * @file utils.js
 * @description Collection of mathematical utility functions and helper methods.
 * Provides standard interpolation, clamping, and color manipulation routines.
 */

export const MathUtils = {
    /**
     * Clamps a value between a minimum and maximum.
     * @param {number} value - Input value
     * @param {number} min - Minimum limit
     * @param {number} max - Maximum limit
     * @returns {number} Clamped value
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    /**
     * Linear interpolation between two values.
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} t - Interpolation factor (0-1)
     * @returns {number} Interpolated value
     */
    lerp(start, end, t) {
        return start * (1 - t) + end * t;
    },

    /**
     * Inverse linear interpolation (calculates t).
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} value - Current value
     * @returns {number} t factor
     */
    inverseLerp(start, end, value) {
        if (start === end) return 0;
        return this.clamp((value - start) / (end - start), 0, 1);
    },

    /**
     * Smoothstep interpolation (Hermite).
     * Provides a smoother ease-in/ease-out transition.
     * @param {number} min - Lower edge
     * @param {number} max - Upper edge
     * @param {number} x - Input value
     * @returns {number} Interpolated value
     */
    smoothstep(min, max, x) {
        x = this.clamp((x - min) / (max - min), 0, 1);
        return x * x * (3 - 2 * x);
    },

    /**
     * Maps a value from one range to another.
     * @param {number} value - Input value
     * @param {number} inMin - Input range min
     * @param {number} inMax - Input range max
     * @param {number} outMin - Output range min
     * @param {number} outMax - Output range max
     * @returns {number} Mapped value
     */
    map(value, inMin, inMax, outMin, outMax) {
        return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
    },

    /**
     * Converts degrees to radians.
     * @param {number} degrees 
     * @returns {number} Radians
     */
    degToRad(degrees) {
        return degrees * (Math.PI / 180);
    },

    /**
     * Converts radians to degrees.
     * @param {number} radians 
     * @returns {number} Degrees
     */
    radToDeg(radians) {
        return radians * (180 / Math.PI);
    },

    /**
     * Generates a random float between min and max.
     * @param {number} min 
     * @param {number} max 
     * @returns {number} Random float
     */
    randomRange(min, max) {
        return min + Math.random() * (max - min);
    },

    /**
     * Converts an RGB object to a CSS string.
     * @param {number} r - Red (0-255)
     * @param {number} g - Green (0-255)
     * @param {number} b - Blue (0-255)
     * @param {number} a - Alpha (0-1)
     * @returns {string} rgba string
     */
    rgba(r, g, b, a = 1) {
        return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;
    },

    /**
     * Calculates the distance between two 2D points.
     * @param {number} x1 
     * @param {number} y1 
     * @param {number} x2 
     * @param {number} y2 
     * @returns {number} Distance
     */
    dist(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
};
