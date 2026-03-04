/**
 * The Game Grid
 * Stores presence of "solidified" jelly particles.
 * 
 * In standard Tetris, the grid is 10x20 cells.
 * Here, because our jellies are soft, they might not align perfectly.
 * 
 * Approach:
 * - We keep a logical grid (10x20) for "locking" pieces.
 * - When a piece "settles" (stops moving), we snap its particles to the nearest grid nodes
 *   or just freeze them in place and add them to a "static bodies" list.
 * 
 * For simplicity and "Tetris" feel:
 * - The grid cells are 40x40 pixels (total 400x800).
 * - When a piece lands, we check if it is stable.
 * - If stable, we "lock" it. Locking might mean converting it to a static body
 *   or just identifying which grid cells are now occupied.
 */

class Grid {
    constructor(cols = 10, rows = 20, cellSize = 40) {
        this.cols = cols;
        this.rows = rows;
        this.cellSize = cellSize;
        this.cells = new Array(cols * rows).fill(null); // Stores color/bodyId
    }

    // Convert pixel to grid coord
    toGrid(x, y) {
        return {
            col: Math.floor(x / this.cellSize),
            row: Math.floor(y / this.cellSize)
        };
    }

    // Check if a pixel coordinate is occupied
    isOccupied(x, y) {
        if (x < 0 || x >= this.cols * this.cellSize) return true; // Walls
        if (y >= this.rows * this.cellSize) return true; // Floor

        const { col, row } = this.toGrid(x, y);
        if (row < 0) return false; // Above top is usually free, but game over check needs to handle overflow
        return this.cells[row * this.cols + col] !== null;
    }

    set(col, row, val) {
        if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
            this.cells[row * this.cols + col] = val;
        }
    }

    get(col, row) {
        if (col < 0 || col >= this.cols || row >= 0 /* allow reading above? */ && row >= this.rows) return 1; // Out of bounds is "wall"
        if (row < 0) return null;
        return this.cells[row * this.cols + col];
    }

    clear() {
        this.cells.fill(null);
    }
}
