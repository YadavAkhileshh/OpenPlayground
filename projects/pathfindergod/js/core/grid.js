import { Node } from './node.js';

/**
 * Manages the grid of nodes.
 */
export class Grid {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.nodes = [];
        this.startNode = null;
        this.endNode = null;
        this.initialize();
    }

    initialize() {
        this.nodes = [];
        for (let r = 0; r < this.rows; r++) {
            const row = [];
            for (let c = 0; c < this.cols; c++) {
                row.push(new Node(r, c));
            }
            this.nodes.push(row);
        }
    }

    getNode(row, col) {
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            return this.nodes[row][col];
        }
        return null;
    }

    setStartNode(row, col) {
        if (this.startNode) this.startNode.isStart = false;
        const node = this.getNode(row, col);
        if (node) {
            node.isStart = true;
            node.isWall = false; // Cannot be a wall
            this.startNode = node;
        }
    }

    setEndNode(row, col) {
        if (this.endNode) this.endNode.isEnd = false;
        const node = this.getNode(row, col);
        if (node) {
            node.isEnd = true;
            node.isWall = false; // Cannot be a wall
            this.endNode = node;
        }
    }

    toggleWall(row, col) {
        const node = this.getNode(row, col);
        if (node && !node.isStart && !node.isEnd) {
            node.isWall = !node.isWall;
        }
    }

    getNeighbors(node, allowDiagonal = false) {
        const neighbors = [];
        const { row, col } = node;
        // Up, Right, Down, Left
        const dirs = [[-1, 0], [0, 1], [1, 0], [0, -1]];

        if (allowDiagonal) {
            // Top-Right, Bottom-Right, Bottom-Left, Top-Left
            dirs.push([-1, 1], [1, 1], [1, -1], [-1, -1]);
        }

        for (const [dr, dc] of dirs) {
            const newRow = row + dr;
            const newCol = col + dc;
            const neighbor = this.getNode(newRow, newCol);

            if (neighbor && !neighbor.isWall) {
                neighbors.push(neighbor);
            }
        }
        return neighbors;
    }

    resetPath() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.nodes[r][c].reset();
            }
        }
    }

    clearBoard() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.nodes[r][c].hardReset();
            }
        }
    }
}
