/**
 * @fileoverview Procedural Level Generator for RayDOM.
 * Implements a dungeon generation algorithm based on recursive back-tracking or room-placement.
 * Generates grid maps with walls, doors, and decorative elements.
 */

export class LevelGenerator {
    constructor(cols = 24, rows = 24) {
        this.cols = cols;
        this.rows = rows;
        this.grid = [];
    }

    /**
     * Generates a new level.
     * @returns {Object} Object containing grid data and player start position.
     */
    generate() {
        this.initializeGrid();

        // Add border walls
        this.addBorders();

        // Place rooms
        const rooms = this.placeRooms(8, 3, 6);

        // Connect rooms with corridors
        this.connectRooms(rooms);

        // Add details (windows, special walls)
        this.addDetails();

        return {
            cols: this.cols,
            rows: this.rows,
            data: this.grid,
            playerStart: rooms.length > 0 ? {
                x: (rooms[0].x + rooms[0].w / 2) * 64,
                y: (rooms[0].y + rooms[0].h / 2) * 64
            } : { x: 100, y: 100 }
        };
    }

    initializeGrid() {
        this.grid = new Array(this.cols * this.rows).fill(1); // Start with solid block
    }

    addBorders() {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (x === 0 || x === this.cols - 1 || y === 0 || y === this.rows - 1) {
                    this.grid[y * this.cols + x] = 1;
                }
            }
        }
    }

    /**
     * Randomly places rooms in the grid.
     */
    placeRooms(count, minSize, maxSize) {
        const rooms = [];
        for (let i = 0; i < count; i++) {
            const w = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
            const h = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
            const x = Math.floor(Math.random() * (this.cols - w - 2)) + 1;
            const y = Math.floor(Math.random() * (this.rows - h - 2)) + 1;

            if (this.canPlaceRoom(x, y, w, h)) {
                this.carveRoom(x, y, w, h);
                rooms.push({ x, y, w, h });
            }
        }
        return rooms;
    }

    canPlaceRoom(rx, ry, rw, rh) {
        for (let y = ry - 1; y < ry + rh + 1; y++) {
            for (let x = rx - 1; x < rx + rw + 1; x++) {
                if (this.grid[y * this.cols + x] === 0) return false;
            }
        }
        return true;
    }

    carveRoom(rx, ry, rw, rh) {
        for (let y = ry; y < ry + rh; y++) {
            for (let x = rx; x < rx + rw; x++) {
                this.grid[y * this.cols + x] = 0;
            }
        }
    }

    /**
     * Connects all rooms using simple L-shaped corridors.
     */
    connectRooms(rooms) {
        for (let i = 0; i < rooms.length - 1; i++) {
            const r1 = rooms[i];
            const r2 = rooms[i + 1];

            const startX = Math.floor(r1.x + r1.w / 2);
            const startY = Math.floor(r1.y + r1.h / 2);
            const endX = Math.floor(r2.x + r2.w / 2);
            const endY = Math.floor(r2.y + r2.h / 2);

            this.carveCorridor(startX, startY, endX, endY);
        }
    }

    carveCorridor(x1, y1, x2, y2) {
        // Horizontal then Vertical or vice versa
        if (Math.random() > 0.5) {
            this.hLine(x1, x2, y1);
            this.vLine(y1, y2, x2);
        } else {
            this.vLine(y1, y2, x1);
            this.hLine(x1, x2, y2);
        }
    }

    hLine(x1, x2, y) {
        for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
            this.grid[y * this.cols + x] = 0;
            // Add doors at corridor/room transitions
            if (Math.random() > 0.9) this.grid[y * this.cols + x] = 2;
        }
    }

    vLine(y1, y2, x) {
        for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
            this.grid[y * this.cols + x] = 0;
            if (Math.random() > 0.9) this.grid[y * this.cols + x] = 2;
        }
    }

    /**
     * Adds decorative elements like windows and glow walls.
     */
    addDetails() {
        for (let i = 0; i < this.grid.length; i++) {
            if (this.grid[i] === 1) {
                if (Math.random() > 0.9) this.grid[i] = 3; // Window
                else if (Math.random() > 0.95) this.grid[i] = 4; // Glow
            }
        }
    }
}
