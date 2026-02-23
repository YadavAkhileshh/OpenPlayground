/**
 * js/simulation/spatialHash.js
 * Optimizes agent neighbor queries via a 2D spatial grid.
 */

import { CONFIG } from '../core/config.js';

export class SpatialHash {
    constructor(width, height, cellSize) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;

        this.cols = Math.ceil(width / cellSize);
        this.rows = Math.ceil(height / cellSize);

        this.grid = new Array(this.cols * this.rows);
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i] = [];
        }

        this.neighborResult = []; // Pre-allocated array for queries to avoid GC
    }

    clear() {
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i].length = 0;
        }
    }

    // Convert pixel coordinate to grid index
    getIndex(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);

        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
            return -1; // Out of bounds
        }

        return col + row * this.cols;
    }

    insert(entity) {
        const idx = this.getIndex(entity.pos.x, entity.pos.y);
        if (idx !== -1) {
            this.grid[idx].push(entity);
            entity.hashIndex = idx;
        } else {
            entity.hashIndex = -1;
        }
    }

    // Fast O(1) neighbor query within a radius
    // Results returned in pre-allocated array (reused)
    queryRadius(x, y, radius, ignoreEntity = null) {
        this.neighborResult.length = 0;
        let p = 0; // Pointer to length

        const minCol = Math.max(0, Math.floor((x - radius) / this.cellSize));
        const maxCol = Math.min(this.cols - 1, Math.floor((x + radius) / this.cellSize));
        const minRow = Math.max(0, Math.floor((y - radius) / this.cellSize));
        const maxRow = Math.min(this.rows - 1, Math.floor((y + radius) / this.cellSize));

        const rSq = radius * radius;

        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                const idx = c + r * this.cols;
                const cell = this.grid[idx];
                const len = cell.length;

                for (let i = 0; i < len; i++) {
                    const entity = cell[i];
                    if (entity !== ignoreEntity) {
                        const dx = entity.pos.x - x;
                        const dy = entity.pos.y - y;
                        if (dx * dx + dy * dy <= rSq) {
                            this.neighborResult[p++] = entity;
                        }
                    }
                }
            }
        }

        return this.neighborResult;
    }
}
