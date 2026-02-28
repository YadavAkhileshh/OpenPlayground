/**
 * @file vec3.js
 * @description A robust 3D Vector library for CPU-based rendering.
 * Optimized for readability and correctness over raw speed (though efficient).
 */

class Vec3 {
    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Creates a new Vec3 from values.
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    static create(x, y, z) {
        return new Vec3(x, y, z);
    }

    /**
     * Adds another vector to this one.
     * @param {Vec3} v 
     */
    add(v) {
        return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    /**
     * Subtracts another vector from this one.
     * @param {Vec3} v 
     */
    sub(v) {
        return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    /**
     * Multiplies this vector by a scalar or component-wise by another vector.
     * @param {number|Vec3} s 
     */
    mul(s) {
        if (s instanceof Vec3) {
            return new Vec3(this.x * s.x, this.y * s.y, this.z * s.z);
        }
        return new Vec3(this.x * s, this.y * s, this.z * s);
    }

    /**
     * Returns the length (magnitude) of the vector.
     */
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    /**
     * Returns a normalized version of this vector (unit vector).
     */
    normalize() {
        const len = this.length();
        if (len === 0) return new Vec3(0, 0, 0);
        return new Vec3(this.x / len, this.y / len, this.z / len);
    }

    /**
     * Calculates the dot product with another vector.
     * @param {Vec3} v 
     */
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    /**
     * Calculates the cross product with another vector.
     * @param {Vec3} v 
     */
    cross(v) {
        return new Vec3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }

    /**
     * Returns a clone of this vector.
     */
    clone() {
        return new Vec3(this.x, this.y, this.z);
    }

    /**
     * Linearly interpolates between this vector and another.
     * @param {Vec3} v Target vector
     * @param {number} t Interpolation factor (0-1)
     */
    mix(v, t) {
        return new Vec3(
            this.x + (v.x - this.x) * t,
            this.y + (v.y - this.y) * t,
            this.z + (v.z - this.z) * t
        );
    }

    /**
     * Returns absolute values of components.
     */
    abs() {
        return new Vec3(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z));
    }

    /**
     * Max value component-wise.
     * @param {Vec3} v 
     */
    max(v) {
        return new Vec3(
            Math.max(this.x, v.x),
            Math.max(this.y, v.y),
            Math.max(this.z, v.z)
        );
    }
}

// Global exposure for non-module environments (since we aren't using ES6 modules for Workers simply everywhere without setup)
// However, we'll try to use ES modules where possible or attach to scope.
if (typeof window !== 'undefined') window.Vec3 = Vec3;
if (typeof self !== 'undefined') self.Vec3 = Vec3;
