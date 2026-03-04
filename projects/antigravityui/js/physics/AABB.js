// js/physics/AABB.js

export class AABB {
    /**
     * Axis-Aligned Bounding Box for collision detection
     * @param {number} x Left position
     * @param {number} y Top position
     * @param {number} width 
     * @param {number} height 
     */
    constructor(x = 0, y = 0, width = 0, height = 0) {
        this.minX = x;
        this.minY = y;
        this.maxX = x + width;
        this.maxY = y + height;
        this.width = width;
        this.height = height;
    }

    /**
     * Updates the AABB position
     */
    update(x, y) {
        this.minX = x;
        this.minY = y;
        this.maxX = x + this.width;
        this.maxY = y + this.height;
    }

    /**
     * Checks if this AABB intersects with another
     * @param {AABB} other 
     * @returns {boolean} true if overlapping
     */
    intersects(other) {
        return (
            this.minX < other.maxX &&
            this.maxX > other.minX &&
            this.minY < other.maxY &&
            this.maxY > other.minY
        );
    }
}
