/**
 * Represents a single logical node in the power grid.
 */
export class PowerNode {
    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.isSource = false;
        this.powerRadius = 3; // How many tiles outward it powers
    }
}
