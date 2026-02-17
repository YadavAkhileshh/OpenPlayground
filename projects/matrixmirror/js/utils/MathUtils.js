/**
 * @file MathUtils.js
 * @description Helper functions for common mathematical operations.
 */

export const MathUtils = {
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    map(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    },

    randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }
};
