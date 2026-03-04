/**
 * Core Gray-Scott Reaction-Diffusion Engine.
 * 
 * This class implements the mathematical model of the reaction-diffusion system
 * using a grid of cells. Each cell contains two chemical concentrations, A and B.
 * 
 * The system evolves according to the following partial differential equations:
 * 
 * ∂A/∂t = D_A * ∇²A - A * B² + f * (1 - A)
 * ∂B/∂t = D_B * ∇²B + A * B² - (k + f) * B
 * 
 * Where:
 * - A, B: Concentrations of the two chemicals.
 * - D_A, D_B: Diffusion rates for A and B.
 * - f: Feed rate (rate at which A is added).
 * - k: Kill rate (rate at which B is removed).
 * - ∇²: Laplacian operator (simulates diffusion).
 * 
 * Performance Optimization:
 * - Uses 1D Float32Arrays for cache coherence and better performance than 2D arrays.
 * - Uses a separate "next" buffer to store the results of the current step, avoiding race conditions.
 * - Pre-calculates indices to act as a 2D grid within the 1D array.
 * 
 * @module Simulation/Engine
 */

import { CONFIG } from './config.js';

export class SimulationEngine {
    /**
     * Initializes the simulation engine with a specific grid size.
     * @param {number} width - Width of the simulation grid.
     * @param {number} height - Height of the simulation grid.
     */
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.size = width * height;

        // Initialize chemical concentrations
        // A starts at 1.0 (maximum) everywhere, as it's the "food".
        // B starts at 0.0 everywhere, as it is introduced via "seeding".
        this.gridA = new Float32Array(this.size).fill(1.0);
        this.gridB = new Float32Array(this.size).fill(0.0);

        // Double buffering to store next state during calculation
        // We read from 'grid' and write to 'next'.
        this.nextA = new Float32Array(this.size);
        this.nextB = new Float32Array(this.size);

        // Laplacian convolution weights
        // These weights approximate the 2D Laplacian operator using a 3x3 kernel.
        // The center cell has a weight of -1.
        // Adjacent (up, down, left, right) cells have a weight of 0.2.
        // Diagonal cells have a weight of 0.05.
        // Sum of weights is 0 (0.2*4 + 0.05*4 - 1.0 = 0).
        // 
        // Kernel:
        // [ 0.05, 0.20, 0.05 ]
        // [ 0.20, -1.0, 0.20 ]
        // [ 0.05, 0.20, 0.05 ]
        this.WEIGHT_CENTER = -1.0;
        this.WEIGHT_ADJ = 0.2;
        this.WEIGHT_DIAG = 0.05;

        // Current feed and kill rates
        this.f = CONFIG.FEED;
        this.k = CONFIG.KILL;
    }

    /**
     * Seeds a rectangular area with chemical B.
     * This acts as the initial disturbance needed to start the pattern formation.
     * 
     * @param {number} x - Center X coordinate on the grid.
     * @param {number} y - Center Y coordinate on the grid.
     * @param {number} radius - Radius of the circular seeding area.
     */
    seed(x, y, radius) {
        const r2 = radius * radius;
        // Iterate only over the bounding box of the circle for efficiency
        for (let i = Math.max(0, x - radius); i < Math.min(this.width, x + radius); i++) {
            for (let j = Math.max(0, y - radius); j < Math.min(this.height, y + radius); j++) {
                const dx = i - x;
                const dy = j - y;
                // Check if the point is within the circle
                if (dx * dx + dy * dy < r2) {
                    const idx = j * this.width + i;
                    // Set B to maximum concentration to kickstart reaction
                    this.gridB[idx] = 1.0;
                }
            }
        }
    }

    /**
     * Updates the simulation by one discrete time step (dt).
     * This method applies the reaction-diffusion formulas to every cell in the grid.
     */
    update() {
        const w = this.width;
        const h = this.height;
        // Local references for massive performance boost in tight loops
        const dA = CONFIG.DA;
        const dB = CONFIG.DB;
        const feed = this.f;
        const kill = this.k;
        const dt = CONFIG.DT;

        // Swap buffers logic implicitly handled by pointers here
        // We read from A/B and write to nA/nB
        const A = this.gridA;
        const B = this.gridB;
        const nA = this.nextA;
        const nB = this.nextB;

        // Loop over the grid, skipping the 1-pixel border to avoid boundary checks.
        // Tiling or wrapping could be implemented by treating boundaries differently,
        // but for this visual simulation, fixed borders are acceptable and faster.
        for (let y = 1; y < h - 1; y++) {
            // Calculate the row offset once per row
            let idx = y * w + 1; // Start at x=1

            for (let x = 1; x < w - 1; x++) {

                const a = A[idx];
                const b = B[idx];

                // --- Laplacian Calculation ---
                // By unrolling the loop manually, we avoid function overhead.
                // We access the 8 neighbors directly using pre-calculated offsets.

                let lapA = 0;
                let lapB = 0;

                // 1. Center Contribution
                lapA += a * this.WEIGHT_CENTER;
                lapB += b * this.WEIGHT_CENTER;

                // 2. Orthogonal Neighbors (Up, Down, Left, Right)
                // idx - w: Up
                // idx + w: Down
                // idx - 1: Left
                // idx + 1: Right
                const sumA_adj = A[idx - w] + A[idx + w] + A[idx - 1] + A[idx + 1];
                const sumB_adj = B[idx - w] + B[idx + w] + B[idx - 1] + B[idx + 1];

                lapA += sumA_adj * this.WEIGHT_ADJ;
                lapB += sumB_adj * this.WEIGHT_ADJ;

                // 3. Diagonal Neighbors
                // idx - w - 1: Top-Left
                // idx - w + 1: Top-Right
                // idx + w - 1: Bottom-Left
                // idx + w + 1: Bottom-Right
                const sumA_diag = A[idx - w - 1] + A[idx - w + 1] + A[idx + w - 1] + A[idx + w + 1];
                const sumB_diag = B[idx - w - 1] + B[idx - w + 1] + B[idx + w - 1] + B[idx + w + 1];

                lapA += sumA_diag * this.WEIGHT_DIAG;
                lapB += sumB_diag * this.WEIGHT_DIAG;

                // --- Reaction-Diffusion Logic ---
                // The reaction term is A * B^2. 
                // This means B needs A to reproduce, and it consumes A in the process.
                const reaction = a * b * b;

                // Update A:
                // Diffusion + Feed - Reaction
                const deltaA = (dA * lapA - reaction + feed * (1 - a)) * dt;

                // Update B:
                // Diffusion + Reaction - Kill - Feed(outflow)
                const deltaB = (dB * lapB + reaction - (kill + feed) * b) * dt;

                // Apply changes and store in next buffer
                nA[idx] = a + deltaA;
                nB[idx] = b + deltaB;

                // --- Stability Clamping ---
                // Floating point errors can accumulate. We clamp to valid concentration range [0, 1].
                if (nA[idx] < 0) nA[idx] = 0;
                else if (nA[idx] > 1) nA[idx] = 1;

                if (nB[idx] < 0) nB[idx] = 0;
                else if (nB[idx] > 1) nB[idx] = 1;

                // Move to next cell
                idx++;
            }
        }

        // --- Double Buffer Swap ---
        // Instead of copying array data (expensive), we just swap the references.
        // gridA now points to what was nextA, and nextA points to the old gridA (to be overwritten next frame).
        this.gridA = nA;
        this.gridB = nB;
        this.nextA = A;
        this.nextB = B;
    }

    /**
     * Clears the grid (Resets A=1, B=0).
     */
    clear() {
        this.gridA.fill(1.0);
        this.gridB.fill(0.0);
    }

    /**
     * Randomizes the grid slightly to create chaos.
     */
    randomize() {
        for (let i = 0; i < this.size; i++) {
            if (Math.random() < 0.1) {
                this.gridB[i] = Math.random();
            }
        }
    }

    setParameters(f, k) {
        this.f = f;
        this.k = k;
    }
}
