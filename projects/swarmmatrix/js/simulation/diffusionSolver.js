/**
 * js/simulation/diffusionSolver.js
 * High-performance solver for the 2D Eulerian fluid/pheromone grid.
 */

import { CONFIG } from '../core/config.js';

export const DiffusionSolver = {
    // Gauss-Seidel relaxation to solve diffusion (mass conservation)
    // Uses 1D flattened arrays for max speed
    diffuse: (b, x, x0, diff, dt, cols, rows, iterations = 4) => {
        const a = dt * diff * cols * rows;

        // Optimize division
        const denom = 1.0 / (1.0 + 4.0 * a);

        for (let k = 0; k < iterations; k++) {
            for (let j = 1; j < rows - 1; j++) {
                for (let i = 1; i < cols - 1; i++) {
                    const idx = i + j * cols;

                    x[idx] = (
                        x0[idx] +
                        a * (
                            x[idx - 1] +
                            x[idx + 1] +
                            x[idx - cols] +
                            x[idx + cols]
                        )
                    ) * denom;
                }
            }
            // Set boundary conditions
            DiffusionSolver.setBnd(b, x, cols, rows);
        }
    },

    // Dissipate/evaporate values over time
    dissipate: (x, rate, cols, rows) => {
        const r = Math.max(0, 1.0 - rate);
        const len = cols * rows;

        for (let i = 0; i < len; i++) {
            x[i] *= r;
            // Floor to zero to prevent subnormal floats hitting CPU performance
            if (x[i] < 0.001) x[i] = 0;
        }
    },

    // Boundary conditions
    setBnd: (b, x, cols, rows) => {
        // Keep simple toroidal or zero bounds
        // For SwarmMatrix, we'll use zero bounds (absorb at edges)
        for (let i = 0; i < cols; i++) {
            x[i] = 0;
            x[i + (rows - 1) * cols] = 0;
        }
        for (let j = 0; j < rows; j++) {
            x[0 + j * cols] = 0;
            x[(cols - 1) + j * cols] = 0;
        }
    }
};
