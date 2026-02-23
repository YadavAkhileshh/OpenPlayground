/**
 * js/simulation/pheromoneGrid.js
 * Manages the multi-channel 2D density grid.
 */

import { Utils } from '../core/utils.js';
import { DiffusionSolver } from './diffusionSolver.js';
import { PheromoneTypes } from './pheromoneTypes.js';
import { CONFIG } from '../core/config.js';
import { state } from '../core/state.js';

export class PheromoneGrid {
    constructor(width, height, resolution = 4) {
        this.width = width;
        this.height = height;
        this.resolution = resolution;

        this.cols = Math.floor(width / resolution);
        this.rows = Math.floor(height / resolution);
        this.size = this.cols * this.rows;

        // Two grids per channel for double buffering (current and previous state)
        this.density = [];
        this.density0 = [];

        for (let i = 0; i < PheromoneTypes.COUNT; i++) {
            // Float32Array offers best performance for math-heavy operations
            this.density[i] = Utils.createFlatGrid(this.cols, this.rows, Float32Array);
            this.density0[i] = Utils.createFlatGrid(this.cols, this.rows, Float32Array);
        }
    }

    clear() {
        for (let i = 0; i < PheromoneTypes.COUNT; i++) {
            this.density[i].fill(0);
            this.density0[i].fill(0);
        }
    }

    addDensity(x, y, type, amount) {
        const col = Math.floor(x / this.resolution);
        const row = Math.floor(y / this.resolution);

        if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
            const idx = col + row * this.cols;
            this.density[type][idx] += amount;

            if (this.density[type][idx] > CONFIG.PH_MAX_VALUE) {
                this.density[type][idx] = CONFIG.PH_MAX_VALUE;
            }
        }
    }

    sample(x, y, type) {
        const col = Math.floor(x / this.resolution);
        const row = Math.floor(y / this.resolution);

        if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
            return this.density[type][col + row * this.cols];
        }
        return 0;
    }

    update(dt) {
        // Read tuning values from state
        const evapRate = state.get('evaporationRate') * dt; // e.g. 0.05 per sec * 0.016 sec
        const diffRate = CONFIG.PH_DIFFUSION_RATE;

        for (let i = 0; i < PheromoneTypes.COUNT; i++) {
            // Swap buffers for diffuse step
            const temp = this.density0[i];
            this.density0[i] = this.density[i];
            this.density[i] = temp;

            // Diffuse uses density0 to calculate the new density
            DiffusionSolver.diffuse(
                0, // b param
                this.density[i],
                this.density0[i],
                diffRate,
                dt,
                this.cols,
                this.rows
            );

            // Evaporate
            DiffusionSolver.dissipate(this.density[i], evapRate, this.cols, this.rows);
        }
    }
}
