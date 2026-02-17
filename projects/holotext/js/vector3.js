/**
 * Vector3
 * A comprehensive 3D vector mathematics class.
 * Provides methods for vector arithmetic, geometric operations, and interpolation.
 */
class Vector3 {
    /**
     * Creates a new Vector3 instance.
     * @param {number} x - The X component.
     * @param {number} y - The Y component.
     * @param {number} z - The Z component.
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
     * Clones the vector.
     * @returns {Vector3}
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
     * Adds a scalar value to all components.
     * @param {number} s 
     * @returns {Vector3} this
     */
    addScalar(s) {
        this.x += s;
        this.y += s;
        this.z += s;
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
     * Multiplies this vector by a scalar.
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
     * Calculates the length (magnitude) of the vector.
     * @returns {number}
     */
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    /**
     * Normalizes the vector (makes it unit length).
     * @returns {Vector3} this
     */
    normalize() {
        const len = this.length();
        if (len > 0) {
            this.multiplyScalar(1 / len);
        }
        return this;
    }

    /**
     * Calculates the distance to another vector.
     * @param {Vector3} v 
     * @returns {number}
     */
    distanceTo(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        const dz = this.z - v.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    /**
     * Linearly interpolates between this vector and another.
     * @param {Vector3} v 
     * @param {number} alpha 
     * @returns {Vector3} this
     */
    lerp(v, alpha) {
        this.x += (v.x - this.x) * alpha;
        this.y += (v.y - this.y) * alpha;
        this.z += (v.z - this.z) * alpha;
        return this;
    }
}
