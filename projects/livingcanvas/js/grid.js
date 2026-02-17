/**
 * grid.js
 * Core data structure and Game of Life logic.
 */

class Grid {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.cells = Utils.create2DArray(rows, cols);
        this.nextCells = Utils.create2DArray(rows, cols); // Buffer for next state

        // Age tracking for heatmap/color shift
        // 0 = dead, 1 = just born, >1 = persistent
        // OR we track "time since death" for trailing?
        // Let's track "Age of Life"
        this.ages = Utils.create2DArray(rows, cols);
        this.nextAges = Utils.create2DArray(rows, cols);

        this.generation = 0;
        this.population = 0;
    }

    /**
     * Randomize the grid logic.
     */
    randomize() {
        this.population = 0;
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const isAlive = Math.random() > 0.85 ? 1 : 0; // Sparse population for aesthetic
                this.cells[r][c] = isAlive;
                this.ages[r][c] = isAlive ? 1 : 0;
                if (isAlive) this.population++;
            }
        }
        this.generation = 0;
    }

    /**
     * Clears the grid.
     */
    clear() {
        for (let r = 0; r < this.rows; r++) {
            this.cells[r].fill(0);
            this.ages[r].fill(0);
        }
        this.generation = 0;
        this.population = 0;
    }

    /**
     * Computes the next generation based on Conway's Rules.
     * 1. Underpopulation: < 2 neighbors -> dies
     * 2. Survival: 2 or 3 neighbors -> lives
     * 3. Overpopulation: > 3 neighbors -> dies
     * 4. Reproduction: 3 neighbors -> born
     */
    update() {
        let newPop = 0;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const state = this.cells[r][c];
                const age = this.ages[r][c];
                const neighbors = this.countNeighbors(r, c);

                let nextState = state;
                let nextAge = age;

                if (state === 0 && neighbors === 3) {
                    nextState = 1;
                    nextAge = 1; // Born
                    newPop++;
                } else if (state === 1 && (neighbors < 2 || neighbors > 3)) {
                    nextState = 0;
                    nextAge = 0; // Died
                } else {
                    nextState = state;
                    if (state === 1) {
                        nextAge++; // Aged
                        newPop++;
                    } else {
                        nextAge = 0;
                    }
                }

                this.nextCells[r][c] = nextState;
                this.nextAges[r][c] = nextAge;
            }
        }

        // Swap buffers
        let tempCells = this.cells;
        this.cells = this.nextCells;
        this.nextCells = tempCells;

        let tempAges = this.ages;
        this.ages = this.nextAges;
        this.nextAges = tempAges;

        this.generation++;
        this.population = newPop;
    }

    /**
     * Counts alive neighbors for a cell (wraparound/toroidal)
     */
    countNeighbors(row, col) {
        let sum = 0;
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                // Wrap around edges
                let r = (row + i + this.rows) % this.rows;
                let c = (col + j + this.cols) % this.cols;

                sum += this.cells[r][c];
            }
        }
        sum -= this.cells[row][col]; // Subtract self
        return sum;
    }

    /**
     * Sets a cell state.
     */
    setCell(r, c, val) {
        if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
            this.cells[r][c] = val;
            this.ages[r][c] = val ? 1 : 0;
        }
    }

    getCell(r, c) {
        if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
            return this.cells[r][c];
        }
        return 0;
    }
}
