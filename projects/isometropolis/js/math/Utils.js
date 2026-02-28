/**
 * Utility mathematical functions.
 */
export const Utils = {
    /**
     * Clamps a value between min and max.
     */
    clamp: (val, min, max) => Math.max(min, Math.min(val, max)),

    /**
     * Interpolates linearly between a and b.
     */
    lerp: (a, b, t) => a + (b - a) * t,

    /**
     * Maps a value from one range to another.
     */
    mapRange: (val, inMin, inMax, outMin, outMax) => {
        return (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    },

    /**
     * Generates a random integer between min and max (inclusive).
     */
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,

    /**
     * Generates a unique color for a given ID (useful for procedural stuff).
     */
    idToColor: (id) => {
        const hash = (id * 2654435761) % 2 ** 32;
        const r = (hash & 0xFF0000) >> 16;
        const g = (hash & 0x00FF00) >> 8;
        const b = hash & 0x0000FF;
        return `rgb(${r},${g},${b})`;
    },

    /**
     * Easing function (easeOutExpo).
     */
    easeOutExpo: (x) => {
        return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    },

    /**
     * UUID v4 like random ID generator
     */
    generateID: () => {
        return 'id-' + Math.random().toString(36).substr(2, 9);
    }
};
