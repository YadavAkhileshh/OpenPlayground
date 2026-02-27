/**
 * @file math.js
 * @description General math utilities for the raymarching engine.
 */

const MathUtils = {
    PI: Math.PI,
    TWO_PI: Math.PI * 2,
    DEG2RAD: Math.PI / 180,

    /**
     * Clamps a value between min and max.
     */
    clamp: (val, min, max) => Math.min(Math.max(val, min), max),

    /**
     * Linear interpolation.
     */
    lerp: (a, b, t) => a + (b - a) * t,

    /**
     * Smoothstep interpolation.
     */
    smoothstep: (min, max, value) => {
        const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
        return x * x * (3 - 2 * x);
    },

    /**
     * Maps a value from one range to another.
     */
    map: (value, start1, stop1, start2, stop2) => {
        return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
    },

    /**
     * Safe modulo (handles negatives correctly).
     */
    mod: (n, m) => ((n % m) + m) % m
};

if (typeof window !== 'undefined') window.MathUtils = MathUtils;
if (typeof self !== 'undefined') self.MathUtils = MathUtils;
