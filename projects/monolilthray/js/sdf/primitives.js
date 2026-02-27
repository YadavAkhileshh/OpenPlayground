/**
 * @file primitives.js
 * @description Collection of Signed Distance Functions (SDFs) for primitive shapes.
 * All functions take a point p (Vec3) and shape parameters.
 */

const SDF = {
    /**
     * Signed distance to a sphere.
     * @param {Vec3} p Point in space
     * @param {number} r Radius
     */
    sphere: (p, r) => {
        return p.length() - r;
    },

    /**
     * Signed distance to a box.
     * @param {Vec3} p Point
     * @param {Vec3} b Box dimensions (half-size)
     */
    box: (p, b) => {
        const d = p.abs().sub(b);
        const maxD = new Vec3(Math.max(d.x, 0), Math.max(d.y, 0), Math.max(d.z, 0));
        const minD = Math.min(Math.max(d.x, Math.max(d.y, d.z)), 0);
        return maxD.length() + minD;
    },

    /**
     * Signed distance to a torus.
     * @param {Vec3} p Point
     * @param {Vec3} t x = major radius, y = minor radius
     */
    torus: (p, t) => {
        const q = new Vec3(Math.sqrt(p.x * p.x + p.z * p.z) - t.x, p.y, 0);
        return q.length() - t.y;
    },

    /**
     * Signed distance to an infinite plane.
     * @param {Vec3} p Point
     * @param {number} h Height (y-coordinate)
     */
    plane: (p, h) => {
        return p.y - h;
    },

    /**
     * Signed distance to a cylinder.
     * @param {Vec3} p 
     * @param {Vec3} c x = radius, y = height
     */
    cylinder: (p, c) => {
        const d = new Vec3(Math.sqrt(p.x * p.x + p.z * p.z) - c.x, Math.abs(p.y) - c.y, 0);
        return Math.min(Math.max(d.x, d.y), 0.0) + new Vec3(Math.max(d.x, 0.0), Math.max(d.y, 0.0)).length();
    },

    /**
     * Octahedron SDF (for more abstract shapes).
     */
    octahedron: (p, s) => {
        p = p.abs();
        return (p.x + p.y + p.z - s) * 0.57735027;
    }
};

if (typeof self !== 'undefined') self.SDF = SDF;
