/**
 * @file vector4.js
 * @description Represents a 4-dimensional vector (x, y, z, w) with comprehensive linear algebra operations.
 * Used for defining vertices in 4D space before projection.
 */

export class Vector4 {
    /**
     * Creates a new Vector4.
     * @param {number} x - X component
     * @param {number} y - Y component
     * @param {number} z - Z component
     * @param {number} w - W component (the 4th dimension)
     */
    constructor(x = 0, y = 0, z = 0, w = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    /**
     * Adds another vector to this one.
     * @param {Vector4} v - The vector to add
     * @returns {Vector4} New Vector4 result
     */
    add(v) {
        return new Vector4(this.x + v.x, this.y + v.y, this.z + v.z, this.w + v.w);
    }

    /**
     * Subtracts another vector from this one.
     * @param {Vector4} v - The vector to subtract
     * @returns {Vector4} New Vector4 result
     */
    sub(v) {
        return new Vector4(this.x - v.x, this.y - v.y, this.z - v.z, this.w - v.w);
    }

    /**
     * Multiplies the vector by a scalar value.
     * @param {number} s - Scalar value
     * @returns {Vector4} New Vector4 result
     */
    scale(s) {
        return new Vector4(this.x * s, this.y * s, this.z * s, this.w * s);
    }

    /**
     * Calculates the dot product with another vector.
     * @param {Vector4} v - The other vector
     * @returns {number} The dot product
     */
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
    }

    /**
     * Calculates the squared distance to another vector.
     * @param {Vector4} v 
     * @returns {number}
     */
    distanceSquared(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        const dz = this.z - v.z;
        const dw = this.w - v.w;
        return dx * dx + dy * dy + dz * dz + dw * dw;
    }

    /**
     * Calculates the magnitude (length) of the vector.
     * @returns {number} The magnitude
     */
    mag() {
        return Math.sqrt(this.dot(this));
    }

    /**
     * Normalizes the vector (scales it to length 1).
     * @returns {Vector4} New normalized Vector4
     */
    normalize() {
        const m = this.mag();
        if (m === 0) return new Vector4(0, 0, 0, 0);
        return this.scale(1 / m);
    }

    /**
     * Creates a copy of this vector.
     * @returns {Vector4} Cloned vector
     */
    clone() {
        return new Vector4(this.x, this.y, this.z, this.w);
    }

    /**
     * Copies values from another vector into this one.
     * @param {Vector4} v 
     */
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        this.w = v.w;
    }

    /**
     * Returns a string representation of the vector.
     * @returns {string}
     */
    toString() {
        return `Vector4(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)}, ${this.w.toFixed(2)})`;
    }
}
