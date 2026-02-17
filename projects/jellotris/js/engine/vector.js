/**
 * Simple 2D Vector class
 * Provides basic vector operations for physics calculations.
 */
class Vec2 {
    /**
     * Create a new Vector
     * @param {number} x - The x component
     * @param {number} y - The y component
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * Add another vector to this one
     * @param {Vec2} v - The vector to add
     * @returns {Vec2} A new vector result
     */
    add(v) {
        return new Vec2(this.x + v.x, this.y + v.y);
    }

    /**
     * Subtract another vector from this one
     * @param {Vec2} v - The vector to subtract
     * @returns {Vec2} A new vector result
     */
    sub(v) {
        return new Vec2(this.x - v.x, this.y - v.y);
    }

    /**
     * Multiply this vector by a scalar
     * @param {number} n - The scalar value
     * @returns {Vec2} A new vector result
     */
    mult(n) {
        return new Vec2(this.x * n, this.y * n);
    }

    /**
     * Divide this vector by a scalar
     * @param {number} n - The scalar value
     * @returns {Vec2} A new vector result
     */
    div(n) {
        if (n === 0) return new Vec2(0, 0);
        return new Vec2(this.x / n, this.y / n);
    }

    /**
     * Calculate the magnitude (length) of the vector
     * @returns {number} The magnitude
     */
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * Calculate the squared magnitude (length^2)
     * Faster than mag() as it avoids square root.
     * @returns {number} The squared magnitude
     */
    sqMag() {
        return this.x * this.x + this.y * this.y;
    }

    /**
     * Normalize the vector (make it unit length)
     * @returns {Vec2} A new normalized vector
     */
    normalize() {
        const m = this.mag();
        if (m > 0) return this.div(m);
        return new Vec2(0, 0);
    }

    /**
     * Calculate distance to another vector
     * @param {Vec2} v - The other vector
     * @returns {number} The distance
     */
    dist(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Create a copy of this vector
     * @returns {Vec2} A new vector with same components
     */
    copy() {
        return new Vec2(this.x, this.y);
    }

    /**
     * Set the components of this vector
     * @param {number} x - new x
     * @param {number} y - new y
     */
    set(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Calculate dot product with another vector
     * @param {Vec2} v - The other vector
     * @returns {number} The dot product
     */
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
}
