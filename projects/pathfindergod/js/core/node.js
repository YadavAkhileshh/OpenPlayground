/**
 * Represents a single node on the grid.
 */
export class Node {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.isWall = false;
        this.isVisited = false;
        this.distance = Infinity; // For Dijkstra
        this.g = Infinity; // Cost from start
        this.h = 0; // Heuristic to end
        this.f = Infinity; // Total cost (g + h)
        this.parent = null; // For path reconstruction
        this.isStart = false;
        this.isEnd = false;
        this.weight = 1; // Default edge weight (1 = normal, 5 = mud, 10 = water)
        this.isPath = false; // Visualization helper
    }

    reset() {
        this.isVisited = false;
        this.isPath = false;
        this.distance = Infinity;
        this.g = Infinity;
        this.h = 0;
        this.f = Infinity;
        this.parent = null;
    }

    /**
     * Resets all state including walls, start, and end, but KEEPS weights if specified (optional future)
     * For now, hardReset clears everything.
     */
    hardReset() {
        this.reset();
        this.isWall = false;
        this.isStart = false;
        this.isEnd = false;
        this.weight = 1;
    }
}
