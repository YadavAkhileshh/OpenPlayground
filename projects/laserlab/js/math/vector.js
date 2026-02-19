/**
 * Vector2D Class
 * A robust 2D vector class for physics calculations.
 */
export class Vector {
    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    /**
     * Adds another vector to this vector.
     * @param {Vector} v
     * @returns {Vector} New vector
     */
    add(v) {
        return new Vector(this.x + v.x, this.y + v.y);
    }

    /**
     * Subtracts another vector from this vector.
     * @param {Vector} v
     * @returns {Vector} New vector
     */
    sub(v) {
        return new Vector(this.x - v.x, this.y - v.y);
    }

    /**
     * Multiplies this vector by a scalar.
     * @param {number} n
     * @returns {Vector} New vector
     */
    mult(n) {
        return new Vector(this.x * n, this.y * n);
    }

    /**
     * Divides this vector by a scalar.
     * @param {number} n
     * @returns {Vector} New vector
     */
    div(n) {
        if (n === 0) return new Vector(0, 0);
        return new Vector(this.x / n, this.y / n);
    }

    /**
     * Calculates the magnitude (length) of the vector.
     * @returns {number}
     */
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * Normalizes the vector (makes it unit length).
     * @returns {Vector} New normalized vector
     */
    normalize() {
        const m = this.mag();
        if (m === 0) return new Vector(0, 0);
        return this.div(m);
    }

    /**
     * Calculates the dot product with another vector.
     * @param {Vector} v
     * @returns {number}
     */
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    /**
     * Calculates the 2D cross product scalar (z-component).
     * @param {Vector} v
     * @returns {number}
     */
    cross(v) {
        return this.x * v.y - this.y * v.x;
    }

    /**
     * Rotates the vector by an angle (radians).
     * @param {number} angle
     * @returns {Vector} New rotated vector
     */
    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vector(
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos
        );
    }

    /**
     * Returns a copy of the vector.
     * @returns {Vector}
     */
    copy() {
        return new Vector(this.x, this.y);
    }
    
    /**
     * Calculates distance to another vector.
     * @param {Vector} v 
     * @returns {number}
     */
    dist(v) {
        return v.sub(this).mag();
    }

    /**
     * Creates a vector from angle and magnitude.
     * @param {number} angle 
     * @param {number} length 
     * @returns {Vector}
     */
    static fromAngle(angle, length = 1) {
        return new Vector(length * Math.cos(angle), length * Math.sin(angle));
    }

    /**
     * Linearly interpolates between two vectors.
     * @param {Vector} v1 
     * @param {Vector} v2 
     * @param {number} t 
     * @returns {Vector}
     */
    static lerp(v1, v2, t) {
        return v1.add(v2.sub(v1).mult(t));
    }
}
