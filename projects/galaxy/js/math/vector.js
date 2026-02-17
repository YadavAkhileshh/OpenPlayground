/**
 * @file vector.js
 * @description A robust 3D Vector class to handle position, velocity, and acceleration
 * for the N-body simulation. Although the rendering might be projected to 2D,
 * the physics of galaxy formation works best in 3D to allow for thickness and
 * non-planar interactions.
 * 
 * @module Math
 */

export class Vector3 {
    /**
     * Create a new Vector3.
     * @param {number} x - The x component.
     * @param {number} y - The y component.
     * @param {number} z - The z component.
     */
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Clones the current vector.
     * @returns {Vector3} A new Vector3 instance with the same components.
     */
    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    /**
     * Set the components of the vector.
     * @param {number} x - The x component.
     * @param {number} y - The y component.
     * @param {number} z - The z component.
     * @returns {Vector3} This vector for chaining.
     */
    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    /**
     * Adds another vector to this one.
     * @param {Vector3} v - The vector to add.
     * @returns {Vector3} This vector for chaining.
     */
    add(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }

    /**
     * Adds a scalar to each component.
     * @param {number} s - The scalar to add.
     * @returns {Vector3} This vector for chaining.
     */
    addScalar(s) {
        this.x += s;
        this.y += s;
        this.z += s;
        return this;
    }

    /**
     * Subtracts another vector from this one.
     * @param {Vector3} v - The vector to subtract.
     * @returns {Vector3} This vector for chaining.
     */
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }

    /**
     * Multiplies this vector by a scalar.
     * @param {number} s - The scalar to multiply by.
     * @returns {Vector3} This vector for chaining.
     */
    multiplyScalar(s) {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this;
    }

    /**
     * Divides this vector by a scalar.
     * @param {number} s - The scalar to divide by.
     * @returns {Vector3} This vector for chaining.
     */
    divideScalar(s) {
        if (s !== 0) {
            this.x /= s;
            this.y /= s;
            this.z /= s;
        } else {
            this.x = 0;
            this.y = 0;
            this.z = 0;
        }
        return this;
    }

    /**
     * Calculates the squared magnitude of the vector.
     * Useful for distance comparisons without square roots.
     * @returns {number} The squared magnitude.
     */
    magSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    /**
     * Calculates the magnitude (length) of the vector.
     * @returns {number} The magnitude.
     */
    mag() {
        return Math.sqrt(this.magSq());
    }

    /**
     * Normalizes the vector to unit length.
     * @returns {Vector3} This vector for chaining.
     */
    normalize() {
        return this.divideScalar(this.mag());
    }

    /**
     * Calculates the dot product with another vector.
     * @param {Vector3} v - The other vector.
     * @returns {number} The dot product.
     */
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    /**
     * Calculates the cross product with another vector.
     * @param {Vector3} v - The other vector.
     * @returns {Vector3} A new vector representing the cross product.
     */
    cross(v) {
        return new Vector3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }

    /**
     * Calculates the distance to another vector.
     * @param {Vector3} v - The other vector.
     * @returns {number} The distance.
     */
    distanceTo(v) {
        return Math.sqrt(this.distanceToSq(v));
    }

    /**
     * Calculates the squared distance to another vector.
     * @param {Vector3} v - The other vector.
     * @returns {number} The squared distance.
     */
    distanceToSq(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        const dz = this.z - v.z;
        return dx * dx + dy * dy + dz * dz;
    }

    /**
     * Linearly interpolates between this vector and another.
     * @param {Vector3} v - The target vector.
     * @param {number} t - The interpolation factor (0-1).
     * @returns {Vector3} This vector for chaining.
     */
    lerp(v, t) {
        this.x += (v.x - this.x) * t;
        this.y += (v.y - this.y) * t;
        this.z += (v.z - this.z) * t;
        return this;
    }

    /**
     * Zeros out the vector.
     * @returns {Vector3} This vector for chaining.
     */
    zero() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        return this;
    }

    /**
     * Static method to add two vectors and return a new one.
     * @param {Vector3} v1 
     * @param {Vector3} v2 
     * @returns {Vector3} result
     */
    static add(v1, v2) {
        return new Vector3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
    }

    /**
     * Create a random unit vector.
     * @returns {Vector3} A random unit vector.
     */
    static randomDirection() {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.sin(phi) * Math.sin(theta);
        const z = Math.cos(phi);
        return new Vector3(x, y, z);
    }
}
