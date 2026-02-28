/**
 * LindenArboretum - Math Utils
 * Assorted helper functions for angles, interpolation, and clamping.
 */

export const MathUtils = {
    /**
     * Converts degrees to radians.
     * @param {number} degrees 
     * @returns {number}
     */
    degToRad(degrees) {
        return degrees * (Math.PI / 180);
    },

    /**
     * Converts radians to degrees.
     * @param {number} radians 
     * @returns {number}
     */
    radToDeg(radians) {
        return radians * (180 / Math.PI);
    },

    /**
     * Clamps a value between a min and max.
     * @param {number} val 
     * @param {number} min 
     * @param {number} max 
     * @returns {number}
     */
    clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    },

    /**
     * Linearly interpolates between two numbers.
     * @param {number} a 
     * @param {number} b 
     * @param {number} t 
     * @returns {number}
     */
    lerp(a, b, t) {
        return a + (b - a) * t;
    },

    /**
     * Smoothstep function for smoother interpolation.
     * @param {number} edge0 
     * @param {number} edge1 
     * @param {number} x 
     * @returns {number}
     */
    smoothstep(edge0, edge1, x) {
        const t = this.clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
        return t * t * (3.0 - 2.0 * t);
    },

    /**
     * Maps a value from one range to another.
     * @param {number} val 
     * @param {number} inMin 
     * @param {number} inMax 
     * @param {number} outMin 
     * @param {number} outMax 
     * @returns {number}
     */
    map(val, inMin, inMax, outMin, outMax) {
        return outMin + ((val - inMin) / (inMax - inMin)) * (outMax - outMin);
    }
};
