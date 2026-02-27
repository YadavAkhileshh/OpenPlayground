/**
 * @file painter.js
 * @description Handles interactive canvas manipulation for the cell grid.
 */

export class Painter {
    constructor(canvas, gridSize) {
        this.canvas = canvas;
        this.gridSize = gridSize;
        this.isPainting = false;
        this.brushSize = 1;
        this.mode = 1; // 1 = Alive, 0 = Dead
    }

    /**
     * Map screen coordinates to grid coordinates.
     */
    screenToGrid(x, y) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        // Final position relative to canvas content
        const cx = (x - rect.left) * scaleX;
        const cy = (y - rect.top) * scaleY;

        // This assumes the actual grid is scaled within the canvas (simplified for now)
        // In a real implementation, we'd account for the letterboxing in Renderer
        return {
            x: Math.floor(cx / (this.canvas.width / this.gridSize)),
            y: Math.floor(cy / (this.canvas.height / this.gridSize))
        };
    }

    /**
     * Modifies the grid based on brush interaction.
     * @param {Uint8Array} grid 
     * @param {Object} coords 
     */
    paint(grid, x, y) {
        const half = Math.floor(this.brushSize / 2);

        for (let i = -half; i <= half; i++) {
            for (let j = -half; j <= half; j++) {
                const gx = x + i;
                const gy = y + j;

                if (gx >= 0 && gx < this.gridSize && gy >= 0 && gy < this.gridSize) {
                    grid[gy * this.gridSize + gx] = this.mode;
                }
            }
        }
    }

    setBrushSize(size) {
        this.brushSize = size;
    }

    setMode(mode) {
        this.mode = mode;
    }
}
