/**
 * RhythmLock - Entropy Calculator
 * -------------------------------
 * Estimates the entropy (strength) of a password string.
 * Used to ensure the textual component of the password is strong enough.
 */

import { MathUtils } from './math-utils.js';

export class EntropyCalculator {
    constructor() {
        this.charSets = {
            lowercase: /[a-z]/,
            uppercase: /[A-Z]/,
            numbers: /[0-9]/,
            symbols: /[^a-zA-Z0-9]/
        };
    }

    /**
     * Calculates bits of entropy for a given password.
     * E = L * log2(R) where L is length, R is pool size.
     * @param {string} password 
     * @returns {number} bits of entropy
     */
    calculate(password) {
        if (!password) return 0;

        let poolSize = 0;
        if (this.charSets.lowercase.test(password)) poolSize += 26;
        if (this.charSets.uppercase.test(password)) poolSize += 26;
        if (this.charSets.numbers.test(password)) poolSize += 10;
        if (this.charSets.symbols.test(password)) poolSize += 33; // Approx symbol count

        if (poolSize === 0) return 0;

        const entropy = password.length * Math.log2(poolSize);
        return MathUtils.clamp(entropy, 0, 1000);
    }

    /**
     * Returns a qualitative strength rating.
     * @param {number} entropy 
     * @returns {string} 'Weak' | 'Moderate' | 'Strong' | 'Very Strong'
     */
    getStrengthLabel(entropy) {
        if (entropy < 28) return 'Very Weak';
        if (entropy < 36) return 'Weak';
        if (entropy < 60) return 'Moderate';
        if (entropy < 128) return 'Strong';
        return 'Very Strong';
    }
}
