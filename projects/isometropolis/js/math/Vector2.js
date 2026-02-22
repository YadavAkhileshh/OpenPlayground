/**
 * Represents a 2D Vector used for positions, sizes, and velocities.
 */
export class Vector2 {
    /**
     * Creates a new Vector2.
     * @param {number} [x=0] - The x coordinate.
     * @param {number} [y=0] - The y coordinate.
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * Sets the x and y components.
     * @param {number} x
     * @param {number} y
     * @returns {Vector2} This vector.
     */
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * Copies the values from another vector.
     * @param {Vector2} v
     * @returns {Vector2} This vector.
     */
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    }

    /**
     * Clones this vector.
     * @returns {Vector2} A new Vector2 instance.
     */
    clone() {
        return new Vector2(this.x, this.y);
    }

    /**
     * Adds another vector to this one.
     * @param {Vector2} v
     * @returns {Vector2} This vector.
     */
    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    /**
     * Subtracts another vector from this one.
     * @param {Vector2} v
     * @returns {Vector2} This vector.
     */
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    /**
     * Multiplies this vector by a scalar.
     * @param {number} s
     * @returns {Vector2} This vector.
     */
    multiplyScalar(s) {
        this.x *= s;
        this.y *= s;
        return this;
    }

    /**
     * Divides this vector by a scalar.
     * @param {number} s
     * @returns {Vector2} This vector.
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
     * Returns the magnitude (length) of this vector.
     * @returns {number}
     */
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * Returns the squared magnitude of this vector.
     * @returns {number}
     */
    magnitudeSq() {
        return this.x * this.x + this.y * this.y;
    }

    /**
     * Normalizes the vector to a length of 1.
     * @returns {Vector2} This vector.
     */
    normalize() {
        return this.divideScalar(this.magnitude() || 1);
    }

    /**
     * Calculates the distance to another vector.
     * @param {Vector2} v
     * @returns {number}
     */
    distanceTo(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calculates the squared distance to another vector.
     * @param {Vector2} v
     * @returns {number}
     */
    distanceToSq(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return dx * dx + dy * dy;
    }

    /**
     * Checks for equality with another vector.
     * @param {Vector2} v
     * @returns {boolean}
     */
    equals(v) {
        return (v.x === this.x) && (v.y === this.y);
    }

    /**
     * Returns the dot product with another vector.
     * @param {Vector2} v
     * @returns {number}
     */
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
}
