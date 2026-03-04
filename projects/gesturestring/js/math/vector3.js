/**
 * Vector3 Class
 * Represents a 3D vector and provides associated operations.
 * Implemented from scratch to avoid external dependencies.
 */
export class Vector3 {
    /**
     * Creates a new Vector3.
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
     * @returns {Vector3} A new Vector3 with the same components.
     */
    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    /**
     * Copies components from another vector.
     * @param {Vector3} v - The vector to copy from.
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
     * @param {Vector3} v - The vector to add.
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
     * @param {Vector3} v - The vector to subtract.
     * @returns {Vector3} this
     */
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }

    /**
     * Multiplies the vector by a scalar.
     * @param {number} s - The scalar value.
     * @returns {Vector3} this
     */
    multiplyScalar(s) {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this;
    }

    /**
     * Divides the vector by a scalar.
     * @param {number} s - The scalar value.
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
     * Calculates the length (magnitude) of the vector.
     * @returns {number} The length.
     */
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    /**
     * Calculates the squared length of the vector.
     * @returns {number} The squared length.
     */
    lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    /**
     * Normalizes the vector (makes it unit length).
     * @returns {Vector3} this
     */
    normalize() {
        return this.divideScalar(this.length());
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
     * @param {number} alpha - The interpolation factor (0-1).
     * @returns {Vector3} this
     */
    lerp(v, alpha) {
        this.x += (v.x - this.x) * alpha;
        this.y += (v.y - this.y) * alpha;
        this.z += (v.z - this.z) * alpha;
        return this;
    }

    /**
     * Static method to add two vectors and return a new one.
     * @param {Vector3} v1 
     * @param {Vector3} v2 
     * @returns {Vector3}
     */
    static addVectors(v1, v2) {
        return new Vector3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
    }

    /**
     * Static method to subtract two vectors and return a new one.
     * @param {Vector3} v1 
     * @param {Vector3} v2 
     * @returns {Vector3}
     */
    static subVectors(v1, v2) {
        return new Vector3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
    }
}
