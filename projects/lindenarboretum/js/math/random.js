/**
 * LindenArboretum - Random Generator Module
 * Provides seeded random numbers to ensure generative art
 * remains deterministic when using the same seed.
 */

export class Randomizer {
    constructor(seedString = "LindenMayer") {
        this.seed = this.hashString(seedString);
        this.rng = this.mulberry32(this.seed);
    }

    /**
     * Resets the generator with a new seed.
     * @param {string|number} seed 
     */
    reseed(seed) {
        if (typeof seed === 'string') {
            this.seed = this.hashString(seed);
        } else {
            this.seed = seed;
        }
        this.rng = this.mulberry32(this.seed);
    }

    /**
     * Hashes a string into a 32-bit integer.
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0, len = str.length; i < len; i++) {
            let chr = str.charCodeAt(i);
            hash = (hash << 5) - hash + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }

    /**
     * Mulberry32 PRNG.
     */
    mulberry32(a) {
        return function () {
            var t = a += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    }

    /**
     * Gets a random float [0, 1)
     */
    next() {
        return this.rng();
    }

    /**
     * Gets a random float between [min, max)
     */
    range(min, max) {
        return min + this.next() * (max - min);
    }

    /**
     * Gets a random integer between [min, max]
     */
    rangeInt(min, max) {
        return Math.floor(this.range(min, max + 1));
    }
}
