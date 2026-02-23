/**
 * SingularityRay JS - Physics - SDF Operations
 * Operations to combine or mutate SDF shapes (boolean geometry)
 */

export const SDFOperations = {
    /**
     * Union of two distances: min(d1, d2)
     * Keeps both shapes
     * @param {number} d1 
     * @param {number} d2 
     * @returns {number}
     */
    opUnion: (d1, d2) => {
        return Math.min(d1, d2);
    },

    /**
     * Subtraction of d1 from d2: max(-d1, d2)
     * Cuts d1 out of d2
     * @param {number} d1 
     * @param {number} d2 
     * @returns {number}
     */
    opSubtraction: (d1, d2) => {
        return Math.max(-d1, d2);
    },

    /**
     * Intersection of two distances: max(d1, d2)
     * Only the overlapping region remains
     * @param {number} d1 
     * @param {number} d2 
     * @returns {number}
     */
    opIntersection: (d1, d2) => {
        return Math.max(d1, d2);
    },

    /**
     * Smooth minimum function for blending shapes like metaballs
     * or soft transitions between disk gas and emptiness.
     * @param {number} a Distance 1
     * @param {number} b Distance 2
     * @param {number} k Smoothing factor
     * @returns {number}
     */
    opSmoothUnion: (a, b, k) => {
        const h = Math.max(k - Math.abs(a - b), 0.0) / k;
        return Math.min(a, b) - h * h * k * (1.0 / 4.0);
    },

    /**
     * 3D Rotation domain repetition
     * Allows rendering an infinite field by modulo operations on spatial coordinates
     * @param {import('../math/vec3.js').Vec3} p Point in space
     * @param {number} moduleSize 
     */
    opRepetition: (p, moduleSize) => {
        const half = moduleSize * 0.5;
        p.x = (p.x + half) % moduleSize - half;
        p.y = (p.y + half) % moduleSize - half;
        p.z = (p.z + half) % moduleSize - half;
        return p;
    }
};
