/**
 * Rect primitive used for Camera culling bounds.
 */
export class Rect {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     */
    constructor(x = 0, y = 0, w = 0, h = 0) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    /**
     * Sets the rect bounds.
     */
    set(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        return this;
    }

    /**
     * Returns true if a point is inside.
     */
    contains(px, py) {
        return px >= this.x && px <= this.x + this.w &&
            py >= this.y && py <= this.y + this.h;
    }

    /**
     * Intersects with another rect.
     */
    intersects(other) {
        return !(other.x > this.x + this.w ||
            other.x + other.w < this.x ||
            other.y > this.y + this.h ||
            other.y + other.h < this.y);
    }
}
