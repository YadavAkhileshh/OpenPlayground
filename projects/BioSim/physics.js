/**
 * BIOSIM PHYSICS ENGINE
 * Implements Broad-Phase Collision Detection using Spatial Hashing.
 * Optimizes neighbor lookups from O(N^2) to O(N).
 * @author saiusesgithub
 */

class SpatialHash {
    constructor(bounds, cellSize) {
        this.bounds = bounds; // {width, height}
        this.cellSize = cellSize;
        this.cells = new Map();
    }

    /**
     * Generate a unique key for the grid cell
     */
    _getKey(x, y) {
        return `${x}:${y}`;
    }

    /**
     * Get grid coordinates from world position
     */
    _getCellIndex(pos) {
        const x = Math.floor(pos.x / this.cellSize);
        const y = Math.floor(pos.y / this.cellSize);
        return { x, y };
    }

    /**
     * Add an entity to the grid
     * @param {Object} client - Must have .pos (Vec2) and .id
     */
    insert(client) {
        const { x, y } = this._getCellIndex(client.pos);
        const key = this._getKey(x, y);

        if (!this.cells.has(key)) {
            this.cells.set(key, new Set());
        }
        this.cells.get(key).add(client);
        
        // Store reference on client for quick updates
        client._spatialIndices = { x, y, key };
    }

    /**
     * Update an entity's position in the grid
     * Should be called every frame the entity moves.
     */
    updateClient(client) {
        const oldIndices = client._spatialIndices;
        const newIndices = this._getCellIndex(client.pos);

        // If cell hasn't changed, do nothing
        if (oldIndices && oldIndices.x === newIndices.x && oldIndices.y === newIndices.y) {
            return;
        }

        // Remove from old cell
        if (oldIndices) {
            this.remove(client);
        }

        // Add to new cell
        this.insert(client);
    }

    remove(client) {
        const indices = client._spatialIndices;
        if (indices) {
            const cell = this.cells.get(indices.key);
            if (cell) {
                cell.delete(client);
                // Cleanup empty cells to save memory
                if (cell.size === 0) {
                    this.cells.delete(indices.key);
                }
            }
            client._spatialIndices = null;
        }
    }

    /**
     * Query the grid for neighbors within a radius
     * @returns {Array} List of potential collision candidates
     */
    query(pos, radius) {
        const clients = [];
        const cellStart = this._getCellIndex({ x: pos.x - radius, y: pos.y - radius });
        const cellEnd = this._getCellIndex({ x: pos.x + radius, y: pos.y + radius });

        for (let x = cellStart.x; x <= cellEnd.x; x++) {
            for (let y = cellStart.y; y <= cellEnd.y; y++) {
                const key = this._getKey(x, y);
                if (this.cells.has(key)) {
                    for (const client of this.cells.get(key)) {
                        clients.push(client);
                    }
                }
            }
        }
        return clients;
    }

    clear() {
        this.cells.clear();
    }

    /**
     * Debug: Draw grid lines on canvas
     */
    debugRender(ctx) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;

        for (let x = 0; x <= this.bounds.width; x += this.cellSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.bounds.height);
            ctx.stroke();
        }

        for (let y = 0; y <= this.bounds.height; y += this.cellSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.bounds.width, y);
            ctx.stroke();
        }
    }
}

/**
 * Standard AABB/Circle Collision Logic
 */
const Physics = {
    checkCollision: (a, b) => {
        const distSq = (a.pos.x - b.pos.x) ** 2 + (a.pos.y - b.pos.y) ** 2;
        const radiusSum = a.r + b.r;
        return distSq <= radiusSum * radiusSum;
    },

    /**
     * Raycasting for sensors
     * Returns distance to wall or object
     */
    raycast: (start, direction, maxDist, boundaries) => {
        // Simplified Raycast against World Boundaries
        // Returns normalized distance (0-1)
        
        let minDist = maxDist;

        // Check Walls
        // X Walls
        if (direction.x !== 0) {
            let t1 = (0 - start.x) / direction.x;
            let t2 = (boundaries.width - start.x) / direction.x;
            if (t1 > 0) minDist = Math.min(minDist, t1);
            if (t2 > 0) minDist = Math.min(minDist, t2);
        }

        // Y Walls
        if (direction.y !== 0) {
            let t1 = (0 - start.y) / direction.y;
            let t2 = (boundaries.height - start.y) / direction.y;
            if (t1 > 0) minDist = Math.min(minDist, t1);
            if (t2 > 0) minDist = Math.min(minDist, t2);
        }

        return Math.min(minDist, maxDist);
    }
};