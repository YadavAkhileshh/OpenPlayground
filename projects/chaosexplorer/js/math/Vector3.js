/**
 * Vector3.js
 * A robust 3D vector class for mathematical operations.
 * 
 * Provides methods for vector arithmetic, geometric operations,
 * and utility functions essential for 3D simulation and rendering.
 */

export class Vector3 {
    /**
     * Creates a new Vector3 instance.
     * @param {number} x - The x-component
     * @param {number} y - The y-component
     * @param {number} z - The z-component
     */
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Sets the components of the vector.
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @returns {Vector3} this
     */
    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    /**
     * Creates a copy of this vector.
     * @returns {Vector3} New vector instance
     */
    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    /**
     * Copies values from another vector.
     * @param {Vector3} v 
     * @returns {Vector3} this
     */
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }

    /**
     * Adds another vector to this one.
     * @param {Vector3} v 
     * @returns {Vector3} this
     */
    add(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }

    /**
     * Subtracts another vector from this one.
     * @param {Vector3} v 
     * @returns {Vector3} this
     */
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }

    /**
     * Multiplies this vector by a scalar value.
     * @param {number} s 
     * @returns {Vector3} this
     */
    multiplyScalar(s) {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this;
    }

    /**
     * Divides this vector by a scalar value.
     * @param {number} s 
     * @returns {Vector3} this
     */
    divideScalar(s) {
        if (s !== 0) {
            this.x /= s;
            this.y /= s;
            this.z /= s;
        } else {
            this.set(0, 0, 0);
        }
        return this;
    }

    /**
     * Calculates the length (magnitude) of the vector.
     * @returns {number}
     */
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    /**
     * Calculates the squared length of the vector (faster than length()).
     * @returns {number}
     */
    lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    /**
     * Normalizes the vector to unit length.
     * @returns {Vector3} this
     */
    normalize() {
        return this.divideScalar(this.length());
    }

    /**
     * Calculates the dot product with another vector.
     * @param {Vector3} v 
     * @returns {number}
     */
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    /**
     * Calculates the cross product with another vector.
     * @param {Vector3} v 
     * @returns {Vector3} this
     */
    cross(v) {
        const x = this.x, y = this.y, z = this.z;
        this.x = y * v.z - z * v.y;
        this.y = z * v.x - x * v.z;
        this.z = x * v.y - y * v.x;
        return this;
    }

    /**
     * Applies a rotation around the X axis.
     * @param {number} angle - Angle in radians
     * @returns {Vector3} this
     */
    applyAxisAngleX(angle) {
        const y = this.y;
        const z = this.z;
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        this.y = y * c - z * s;
        this.z = y * s + z * c;
        return this;
    }

    /**
     * Applies a rotation around the Y axis.
     * @param {number} angle - Angle in radians
     * @returns {Vector3} this
     */
    applyAxisAngleY(angle) {
        const x = this.x;
        const z = this.z;
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        this.x = x * c + z * s;
        this.z = -x * s + z * c;
        return this;
    }

    /**
     * Applies a rotation around the Z axis.
     * @param {number} angle - Angle in radians
     * @returns {Vector3} this
     */
    applyAxisAngleZ(angle) {
        const x = this.x;
        const y = this.y;
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        this.x = x * c - y * s;
        this.y = x * s + y * c;
        return this;
    }
}
