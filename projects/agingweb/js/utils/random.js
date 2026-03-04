/**
 * random.js
 * Advanced random number generation for consistent chaos.
 */

// Simple pseudo-random number generator (LCG)
// Used when we need seeded randomness (e.g., consistent glitch per refresh if desired)
class LCG {
    constructor(seed) {
        this.seed = seed || Date.now();
    }

    next() {
        this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
        return this.seed / 4294967296;
    }
}

export const rng = new LCG(12345);

/**
 * Returns a random boolean with true probability.
 * @param {number} p - Probability (0-1)
 * @returns {boolean}
 */
export function chance(p) {
    return Math.random() < p;
}

/**
 * Returns a random item from an array.
 * @param {Array} arr 
 * @returns {*}
 */
export function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Returns a skewed random value (e.g. tend towards higher numbers).
 * @param {number} pow - Power factor
 * @returns {number}
 */
export function randomPower(pow = 2) {
    return Math.pow(Math.random(), pow);
}
