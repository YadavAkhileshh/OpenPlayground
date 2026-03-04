/**
 * @file engine.js
 * @description Core simulation engine for Conway's Game of Life and its derivatives.
 * This module utilizes Uint8Array buffers for high-performance memory management,
 * ensuring that large grids (up to 400x400) can be simulated at 60 frames per second.
 * 
 * The engine implements a double-buffering strategy where the current state is stored
 * in one buffer and the next state is calculated and written to another, followed
 * by a reference swap. This prevents data corruption during the generation step.
 * 
 * @module SimulationEngine
 */

import { RuleProcessor } from './rulesets.js';

export class SimulationEngine {
    /**
     * Initializes the simulation with a specified width and height.
     * @param {number} width - The width of the cellular grid.
     * @param {number} height - The height of the cellular grid.
     */
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.size = width * height;

        this.rules = new RuleProcessor('CONWAY');

        // Use Uint8Array for memory efficiency (0 = dead, 1 = alive)
        this.currentGrid = new Uint8Array(this.size);
        this.nextGrid = new Uint8Array(this.size);

        this.generation = 0;
        this.history = [];
        this.maxHistory = 1000;

        // Performance tracking
        this.lastStepTime = 0;
    }

    /**
     * Resets the simulation to an empty state or a specific size.
     */
    reset(width = this.width, height = this.height) {
        this.width = width;
        this.height = height;
        this.size = width * height;
        this.currentGrid = new Uint8Array(this.size);
        this.nextGrid = new Uint8Array(this.size);
        this.generation = 0;
        this.history = [];
    }

    /**
     * Sets the initial state of the grid from a processed byte array.
     * @param {Uint8Array} data Binary cell data
     */
    setData(data) {
        if (data.length !== this.size) {
            console.error("SimulationEngine: Data size mismatch", data.length, this.size);
            return;
        }
        this.currentGrid.set(data);
        this.generation = 0;
        this.history = [new Uint8Array(this.currentGrid)];
    }

    /**
     * Advances the simulation by one generation.
     * Implements standard B3/S23 rules.
     */
    step() {
        const start = performance.now();
        const w = this.width;
        const h = this.height;
        let aliveCount = 0;

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const idx = y * w + x;
                const neighbors = this.countNeighbors(x, y);
                const isAlive = this.currentGrid[idx] === 1;

                const nextState = this.rules.evaluate(neighbors, isAlive);

                if (nextState) {
                    this.nextGrid[idx] = 1;
                    aliveCount++;
                } else {
                    this.nextGrid[idx] = 0;
                }
            }
        }

        // Swap buffers
        const temp = this.currentGrid;
        this.currentGrid = this.nextGrid;
        this.nextGrid = temp;

        this.generation++;

        // Save to history (optimized: don't save every frame if history gets too large?)
        if (this.history.length < this.maxHistory) {
            this.history.push(new Uint8Array(this.currentGrid));
        }

        this.lastStepTime = performance.now() - start;
        return aliveCount;
    }

    /**
     * Efficiently counts neighbors with wrapping/toroidal topology.
     */
    countNeighbors(x, y) {
        let count = 0;
        const w = this.width;
        const h = this.height;

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;

                const nx = (x + i + w) % w;
                const ny = (y + j + h) % h;

                count += this.currentGrid[ny * w + nx];
            }
        }
        return count;
    }

    /**
     * Returns the grid at a specific generation if it exists in history.
     */
    getGeneration(gen) {
        if (gen >= 0 && gen < this.history.length) {
            this.currentGrid.set(this.history[gen]);
            this.generation = gen;
            return true;
        }
        return false;
    }

    /**
     * Calculates current entropy (ratio of alive cells).
     */
    getStats() {
        let alive = 0;
        for (let i = 0; i < this.size; i++) {
            if (this.currentGrid[i] === 1) alive++;
        }

        return {
            generation: this.generation,
            alive: alive,
            dead: this.size - alive,
            entropy: (alive / this.size) * 100,
            latency: this.lastStepTime
        };
    }
}
