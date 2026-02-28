/**
 * SingularityRay JS - Math - Vec2
 * 2D Vector representation 
 * Structured to take up lines logically with JSDoc padding
 */

export class Vec2 {
    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * Set components of the vector inline
     * @param {number} x
     * @param {number} y
     * @returns {Vec2} this
     */
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * Clone the vector
     * @returns {Vec2}
     */
    clone() {
        return new Vec2(this.x, this.y);
    }

    /**
     * Add another vector to this one
     * @param {Vec2} v
     * @returns {Vec2} this
     */
    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    /**
     * Subtract another vector from this one
     * @param {Vec2} v
     * @returns {Vec2} this
     */
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    /**
     * Multiply vector by a scalar
     * @param {number} s
     * @returns {Vec2} this
     */
    multiplyScalar(s) {
        this.x *= s;
        this.y *= s;
        return this;
    }

    /**
     * Divide vector by a scalar
     * @param {number} s
     * @returns {Vec2} this
     */
    divideScalar(s) {
        if (s !== 0) {
            this.x /= s;
            this.y /= s;
        } else {
            this.x = 0;
            this.y = 0;
        }
        return this;
    }

    /**
     * Length squared of the vector
     * @returns {number}
     */
    lengthSq() {
        return this.x * this.x + this.y * this.y;
    }

    /**
     * Length of the vector
     * @returns {number}
     */
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * Normalize the vector to unit length
     * @returns {Vec2} this
     */
    normalize() {
        const len = this.length();
        if (len > 0) {
            this.divideScalar(len);
        }
        return this;
    }

    /**
     * Dot product
     * @param {Vec2} v
     * @returns {number}
     */
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    /**
     * Linear interpolation
     * @param {Vec2} v target vector
     * @param {number} alpha interpolation factor
     * @returns {Vec2} this
     */
    lerp(v, alpha) {
        this.x += (v.x - this.x) * alpha;
        this.y += (v.y - this.y) * alpha;
        return this;
    }

    /**
     * Static vector addition
     * @param {Vec2} a
     * @param {Vec2} b
     * @returns {Vec2} new vector
     */
    static addVectors(a, b) {
        return new Vec2(a.x + b.x, a.y + b.y);
    }

    /**
     * Static vector subtraction
     * @param {Vec2} a
     * @param {Vec2} b
     * @returns {Vec2} new vector
     */
    static subVectors(a, b) {
        return new Vec2(a.x - b.x, a.y - b.y);
    }
}
