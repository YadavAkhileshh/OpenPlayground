/**
 * js/core/math.js
 * Optimized math utilities for high-performance simulation.
 */

export const MathUtils = {
    PI2: Math.PI * 2,

    // Fast distance squared (avoids Math.sqrt)
    distSq: (x1, y1, x2, y2) => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return dx * dx + dy * dy;
    },

    // Fast distance
    dist: (x1, y1, x2, y2) => {
        return Math.hypot(x2 - x1, y2 - y1);
    },

    // Clamp value between min and max
    clamp: (val, min, max) => {
        return Math.max(min, Math.min(max, val));
    },

    // Linear interpolation
    lerp: (a, b, t) => {
        return a + (b - a) * t;
    },

    // Map value from one range to another
    map: (val, inMin, inMax, outMin, outMax) => {
        return (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    },

    // Wrap a value around bounds (toroidal space)
    wrap: (val, max) => {
        if (val < 0) return val + max;
        if (val >= max) return val - max;
        return val;
    },

    // Random between min and max
    random: (min, max) => {
        return Math.random() * (max - min) + min;
    },

    // Normalize an angle to be between -PI and PI
    normalizeAngle: (angle) => {
        let a = angle % MathUtils.PI2;
        if (a > Math.PI) a -= MathUtils.PI2;
        if (a < -Math.PI) a += MathUtils.PI2;
        return a;
    }
};
