import { Vector2 } from './Vector2.js';

/**
 * Handles operations related to Isometric projection and coordinate mapping.
 * TILE_WIDTH and TILE_HEIGHT define the diamond shapes.
 * TILE_HEIGHT is usually half of TILE_WIDTH for true 2:1 isometric ratio.
 */
export class IsometricMath {
    /**
     * @param {number} tileWidth
     * @param {number} tileHeight
     */
    constructor(tileWidth = 64, tileHeight = 32) {
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.halfWidth = tileWidth / 2;
        this.halfHeight = tileHeight / 2;
    }

    /**
     * Converts grid coordinates to screen coordinates (center of the diamond).
     * @param {number} gridX
     * @param {number} gridY
     * @param {Vector2} [out=new Vector2()]
     * @returns {Vector2} Screen coordinates.
     */
    gridToScreen(gridX, gridY, out = new Vector2()) {
        const screenX = (gridX - gridY) * this.halfWidth;
        const screenY = (gridX + gridY) * this.halfHeight;
        return out.set(screenX, screenY);
    }

    /**
     * Converts screen coordinates to floating grid coordinates.
     * @param {number} screenX
     * @param {number} screenY
     * @param {Vector2} [out=new Vector2()]
     * @returns {Vector2} Exact floating grid coordinates.
     */
    screenToGridFloat(screenX, screenY, out = new Vector2()) {
        const gridX = (screenX / this.halfWidth + screenY / this.halfHeight) / 2;
        const gridY = (screenY / this.halfHeight - (screenX / this.halfWidth)) / 2;
        return out.set(gridX, gridY);
    }

    /**
     * Converts screen coordinates to integer grid coordinates (tile indices).
     * @param {number} screenX
     * @param {number} screenY
     * @param {Vector2} [out=new Vector2()]
     * @returns {Vector2} Grid indices.
     */
    screenToGrid(screenX, screenY, out = new Vector2()) {
        this.screenToGridFloat(screenX, screenY, out);
        return out.set(Math.floor(out.x), Math.floor(out.y));
    }

    /**
     * Returns the Painter's Algorithm render depth index (Z-index equivalent).
     * Simply x + y works securely for topological sorting along axes.
     * @param {number} gridX
     * @param {number} gridY
     * @returns {number}
     */
    getDepth(gridX, gridY) {
        return gridX + gridY;
    }
}
