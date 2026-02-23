/**
 * SingularityRay JS - Math - Vec3
 * 3D Vector representation
 * The core data structure for ray and spatial calculations
 */

export class Vec3 {
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
     * Set components inline
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {Vec3} this
     */
    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    /**
     * Clone the vector
     * @returns {Vec3}
     */
    clone() {
        return new Vec3(this.x, this.y, this.z);
    }

    /**
     * Copy values from another vector
     * @param {Vec3} v
     * @returns {Vec3} this
     */
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }

    /**
     * Add
     * @param {Vec3} v
     * @returns {Vec3} this
     */
    add(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }

    /**
     * Subtract
     * @param {Vec3} v
     * @returns {Vec3} this
     */
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }

    /**
     * Multiply Scalar
     * @param {number} s
     * @returns {Vec3} this
     */
    multiplyScalar(s) {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this;
    }

    /**
     * Length Squared
     * @returns {number}
     */
    lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    /**
     * Length
     * @returns {number}
     */
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    /**
     * Normalize
     * @returns {Vec3} this
     */
    normalize() {
        const len = this.length();
        if (len > 0) {
            const invLen = 1.0 / len;
            this.x *= invLen;
            this.y *= invLen;
            this.z *= invLen;
        } else {
            this.x = 0;
            this.y = 0;
            this.z = 0;
        }
        return this;
    }

    /**
     * Dot Product
     * @param {Vec3} v
     * @returns {number}
     */
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    /**
     * Cross Product
     * @param {Vec3} v
     * @returns {Vec3} this
     */
    cross(v) {
        const x = this.x, y = this.y, z = this.z;
        this.x = y * v.z - z * v.y;
        this.y = z * v.x - x * v.z;
        this.z = x * v.y - y * v.x;
        return this;
    }

    /**
     * Static add
     */
    static addVectors(a, b) {
        return new Vec3(a.x + b.x, a.y + b.y, a.z + b.z);
    }

    /**
     * Static subtract
     */
    static subVectors(a, b) {
        return new Vec3(a.x - b.x, a.y - b.y, a.z - b.z);
    }
}
