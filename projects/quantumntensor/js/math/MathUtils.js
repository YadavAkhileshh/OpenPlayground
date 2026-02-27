/**
 * js/math/MathUtils.js
 * Variety of scalar and utility math functions for quantum calculations,
 * easing coordinates, floating point corrections, and probability mapping.
 */

class MathUtils {
    /**
     * Cleans up floating point dust. e.g. 1.0000000000000002 -> 1.0
     * @param {number} value The dirty float
     * @param {number} precision Decimal places to round to
     * @returns {number} Clean float
     */
    static roundToZero(value, epsilon = MathConstants.EPSILON) {
        if (Math.abs(value) < epsilon) {
            return 0.0;
        }
        return value;
    }

    /**
     * Snap value to nice decimals
     * @param {number} val 
     * @param {number} places 
     * @returns {number}
     */
    static toPrecision(val, places = 4) {
        const mult = Math.pow(10, places);
        return Math.round(val * mult) / mult;
    }

    /**
     * Linear interpolation between a and b by t (0-1)
     * @param {number} a 
     * @param {number} b 
     * @param {number} t 
     * @returns {number}
     */
    static lerp(a, b, t) {
        return a + (b - a) * Math.max(0, Math.min(1, t));
    }

    /**
     * Smoothstep interpolation
     * @param {number} t (0-1)
     * @returns {number} eased t
     */
    static smoothstep(t) {
        t = Math.max(0, Math.min(1, t));
        return t * t * (3 - 2 * t);
    }

    /**
     * Map a value from one range to another
     * @param {number} x
     * @param {number} in_min
     * @param {number} in_max
     * @param {number} out_min
     * @param {number} out_max
     * @returns {number}
     */
    static map(x, in_min, in_max, out_min, out_max) {
        return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }

    /**
     * Clamps a value
     * @param {number} val 
     * @param {number} min 
     * @param {number} max 
     * @returns {number}
     */
    static clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }

    /**
     * Decimal number to binary string zero-padded to length n
     * Essential for generating quantum states like |010>
     * @param {number} num
     * @param {number} length
     * @returns {string}
     */
    static toBinaryString(num, length) {
        let bin = num.toString(2);
        while (bin.length < length) {
            bin = "0" + bin;
        }
        return bin;
    }

    /**
     * Checks if a number is a power of 2
     * @param {number} n
     * @returns {boolean}
     */
    static isPowerOfTwo(n) {
        if (typeof n !== 'number') return false;
        return n && (n & (n - 1)) === 0;
    }

    /**
     * Binary logarithmic base 2
     * @param {number} n
     * @returns {number}
     */
    static log2(n) {
        return Math.log(n) / Math.LN2;
    }

    /**
     * Generate a deterministic-seeming UUID for gates layout
     * @returns {string} pseudo-random id string
     */
    static generateUUID() {
        return 'qt-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
    }
}

// Export to window
window.MathUtils = MathUtils;
