import { Tile } from './Tile.js';
import { EventEmitter } from '../engine/EventEmitter.js';

/**
 * 2D Grid data structure managing all City Tiles.
 */
export class CityMap {
    /**
     * @param {number} width
     * @param {number} height
     * @param {EventEmitter} events
     */
    constructor(width, height, events) {
        this.width = width;
        this.height = height;
        this.events = events;

        // 1D Array for performance
        this.grid = new Array(width * height);

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                this.grid[x + y * width] = new Tile(x, y);
            }
        }
    }

    /**
     * Checks if coordinates are out of bounds.
     */
    isValid(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    /**
     * Gets a tile at x,y. Returns null if invalid.
     */
    getTile(x, y) {
        if (!this.isValid(x, y)) return null;
        return this.grid[x + y * this.width];
    }

    /**
     * Iterates over all neighbors (N, E, S, W).
     */
    getNeighbors(x, y) {
        const neighbors = [];
        if (this.isValid(x, y - 1)) neighbors.push(this.getTile(x, y - 1)); // N
        if (this.isValid(x + 1, y)) neighbors.push(this.getTile(x + 1, y)); // E
        if (this.isValid(x, y + 1)) neighbors.push(this.getTile(x, y + 1)); // S
        if (this.isValid(x - 1, y)) neighbors.push(this.getTile(x - 1, y)); // W
        return neighbors;
    }

    /**
     * Gets tiles within a radius (Manhattan distance usually ok, using actual distance here).
     */
    getTilesInRadius(cx, cy, radius) {
        const tiles = [];
        const rSq = radius * radius;

        for (let x = Math.max(0, cx - radius); x <= Math.min(this.width - 1, cx + radius); x++) {
            for (let y = Math.max(0, cy - radius); y <= Math.min(this.height - 1, cy + radius); y++) {
                const dx = x - cx;
                const dy = y - cy;
                if (dx * dx + dy * dy <= rSq) {
                    tiles.push(this.getTile(x, y));
                }
            }
        }
        return tiles;
    }

    /**
     * Updates road connections for a specific tile.
     */
    updateRoadConnections(x, y) {
        const t = this.getTile(x, y);
        if (!t || t.type !== 'road') return;

        let conn = 0;
        const n = this.getTile(x, y - 1);
        const e = this.getTile(x + 1, y);
        const s = this.getTile(x, y + 1);
        const w = this.getTile(x - 1, y);

        if (n && n.type === 'road') conn |= 1;
        if (e && e.type === 'road') conn |= 2;
        if (s && s.type === 'road') conn |= 4;
        if (w && w.type === 'road') conn |= 8;

        t.roadConnections = conn;
    }

    /**
     * Update all road connections around a point
     */
    updateRoadNetworkAround(x, y) {
        this.updateRoadConnections(x, y);
        this.updateRoadConnections(x, y - 1);
        this.updateRoadConnections(x + 1, y);
        this.updateRoadConnections(x, y + 1);
        this.updateRoadConnections(x - 1, y);

        this.events.emit('map:roadChanged');
    }
}
