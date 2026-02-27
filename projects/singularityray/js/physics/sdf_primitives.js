/**
 * SingularityRay JS - Physics - SDF Primitives
 * Core Signed Distance Field geometric functions.
 * These return the exact or approximate shortest distance from a point 
 * to the surface of a shape, fundamental for raymarching.
 */

export const SDFPrimitives = {
    /**
     * SDF for a Sphere
     * @param {import('../math/vec3.js').Vec3} p Point in space
     * @param {number} r Radius of the sphere
     * @returns {number} Distance to surface (negative if inside)
     */
    sphere: (p, r) => {
        return p.length() - r;
    },

    /**
     * SDF for a mathematical Plane
     * @param {import('../math/vec3.js').Vec3} p Point in space
     * @param {import('../math/vec3.js').Vec3} n Normal of the plane (must be normalized)
     * @param {number} h Distance from origin
     * @returns {number}
     */
    plane: (p, n, h) => {
        return p.dot(n) + h;
    },

    /**
     * SDF for a Torus (used as the base for the accretion disk)
     * @param {import('../math/vec3.js').Vec3} p Point in space
     * @param {import('../math/vec2.js').Vec2} t Torus parameters: x=major radius, y=minor radius
     * @returns {number}
     */
    torus: (p, t) => {
        // sqrt(x^2 + z^2) - r1
        const qx = Math.sqrt(p.x * p.x + p.z * p.z) - t.x;
        // sqrt(qx^2 + y^2) - r2
        return Math.sqrt(qx * qx + p.y * p.y) - t.y;
    },

    /**
     * SDF for a Box (useful for debug bounding volumes)
     * @param {import('../math/vec3.js').Vec3} p Point in space
     * @param {import('../math/vec3.js').Vec3} b Box dimensions
     * @returns {number}
     */
    box: (p, b) => {
        const dx = Math.abs(p.x) - b.x;
        const dy = Math.abs(p.y) - b.y;
        const dz = Math.abs(p.z) - b.z;

        // Exact distance formula
        const maxDx = Math.max(dx, 0);
        const maxDy = Math.max(dy, 0);
        const maxDz = Math.max(dz, 0);

        const lengthOutside = Math.sqrt(maxDx * maxDx + maxDy * maxDy + maxDz * maxDz);
        const distInside = Math.min(Math.max(dx, Math.max(dy, dz)), 0.0);

        return lengthOutside + distInside;
    }
};
