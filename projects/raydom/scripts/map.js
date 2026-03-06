/**
 * @class Map
 * @description Manages the grid-based world, collision detection, and interactive elements.
 */
export class MapData {
    constructor() {
        this.cols = 16;
        this.rows = 16;
        this.size = 64;
        this.data = [];
        this.doorsOpen = {};
    }

    /**
     * Initializes the map with a data array.
     * @param {number} cols - Number of columns.
     * @param {number} rows - Number of rows.
     * @param {Array<number>} data - Grid cells.
     */
    init(cols, rows, data) {
        this.cols = cols;
        this.rows = rows;
        this.data = data;
        this.doorsOpen = {};
    }

    /**
     * Checks if a position is inside a wall or closed door.
     * @param {number} x - X coordinate.
     * @param {number} y - Y coordinate.
     * @returns {boolean}
     */
    isWall(x, y) {
        if (x < 0 || x >= this.cols * this.size || y < 0 || y >= this.rows * this.size) {
            return true;
        }
        const gridX = Math.floor(x / this.size);
        const gridY = Math.floor(y / this.size);
        const type = this.data[gridY * this.cols + gridX];

        if (type === 0) return false;
        if (type === 2) return !this.doorsOpen[`${gridY}-${gridX}`];
        if (type === 3) return false; // Window is not solid for rays
        return true;
    }

    /**
     * Toggles a door state at a specific world coordinate.
     * @param {number} x - X coordinate.
     * @param {number} y - Y coordinate.
     * @returns {boolean} True if a door was toggled.
     */
    toggleDoor(x, y) {
        const gridX = Math.floor(x / this.size);
        const gridY = Math.floor(y / this.size);
        const key = `${gridY}-${gridX}`;
        if (this.data[gridY * this.cols + gridX] === 2) {
            this.doorsOpen[key] = !this.doorsOpen[key];
            return true;
        }
        return false;
    }

    getWallType(x, y) {
        const gridX = Math.floor(x / this.size);
        const gridY = Math.floor(y / this.size);
        return this.data[gridY * this.cols + gridX];
    }
}

export const MAP = new MapData();
MAP.init(
    16,
    16,
    [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 3, 0, 0, 0, 1,
        1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1,
        1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1,
        1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 4, 1,
        1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1,
        1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 4, 1, 0, 1,
        1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1,
        1, 3, 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 1, 1, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 3, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
    ]
);
