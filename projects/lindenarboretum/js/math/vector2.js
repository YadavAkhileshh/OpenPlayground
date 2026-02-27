/**
 * LindenArboretum - Vector2 Math Module
 * Represents a 2D vector for coordinates, turtle positioning, and wind forces.
 * Includes standard vector operations needed for 2D rendering.
 */

 export class Vector2 {
    /**
     * Creates a new Vector2 instance
     * @param {number} x - The X coordinate
     * @param {number} y - The Y coordinate
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * Sets the x and y components.
     * @param {number} x 
     * @param {number} y 
     * @returns {Vector2} Default this for chaining
     */
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * Copies values from another Vector2.
     * @param {Vector2} v 
     * @returns {Vector2} Default this
     */
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    }

    /**
     * Clones this vector.
     * @returns {Vector2} A new Vector2 instance
     */
    clone() {
        return new Vector2(this.x, this.y);
    }

    /**
     * Adds another vector to this vector.
     * @param {Vector2} v 
     * @returns {Vector2} Default this
     */
    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    /**
     * Subtracts another vector from this vector.
     * @param {Vector2} v 
     * @returns {Vector2} Default this
     */
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    /**
     * Multiplies this vector by a scalar value.
     * @param {number} scalar 
     * @returns {Vector2} Default this
     */
    multiplyScalar(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    /**
     * Calculates the magnitude (length) of the vector.
     * @returns {number}
     */
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * Normalizes the vector to a length of 1.
     * @returns {Vector2} Default this
     */
    normalize() {
        const mag = this.magnitude();
        if (mag === 0) {
            this.x = 0;
            this.y = 0;
        } else {
            this.x /= mag;
            this.y /= mag;
        }
        return this;
    }

    /**
     * Linearly interpolates between this vector and another.
     * @param {Vector2} v - The target vector
     * @param {number} alpha - Interpolation factor [0, 1]
     * @returns {Vector2} Default this
     */
    lerp(v, alpha) {
        this.x += (v.x - this.x) * alpha;
        this.y += (v.y - this.y) * alpha;
        return this;
    }

    /**
     * Calculates distance to another vector.
     * @param {Vector2} v 
     * @returns {number} distance
     */
    distanceTo(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Rotates the vector around the origin by a given angle.
     * @param {number} angle - Angle in radians
     * @returns {Vector2} Default this
     */
    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const nx = this.x * cos - this.y * sin;
        const ny = this.x * sin + this.y * cos;
        this.x = nx;
        this.y = ny;
        return this;
    }
}
