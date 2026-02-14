/**
 * DarkFluid - Cinematic Fluid Simulation
 * Grid Module
 * 
 * Manages the data structures for the fluid simulation.
 * Implements a flattened 1D array approach for 2D grid data to optimize
 * memory proximity and cache performance.
 * 
 * Structure follows the standard "MAC grid" concept but simplified to collocated
 * velocity for standard implementation ease in JS.
 * 
 * @module Grid
 */

import { Config } from './config.js';

export class FluidGrid {
    /**
     * Creates a new FluidGrid instance.
     * @param {number} size - The dimension of the grid (size x size).
     */
    constructor(size) {
        this.size = size;
        this.count = size * size;

        // Density field (scalar) - Dye/Smoke amount
        this.density = new Float32Array(this.count);
        this.prevDensity = new Float32Array(this.count);

        // Velocity X field (u)
        this.Vx = new Float32Array(this.count);
        this.prevVx = new Float32Array(this.count);

        // Velocity Y field (v)
        this.Vy = new Float32Array(this.count);
        this.prevVy = new Float32Array(this.count);

        // Helper arrays for solver steps to avoid reallocation
        // Specifically for storing divergence and pressure
        this.divergence = new Float32Array(this.count);
        this.pressure = new Float32Array(this.count);
        this.prevPressure = new Float32Array(this.count); // Often needed for warm starting

        // Obstacle field (0 = fluid, 1 = solid)
        this.obstacles = new Uint8Array(this.count);

        this.reset();
    }

    /**
     * Resets all fields to zero.
     */
    reset() {
        this.density.fill(0);
        this.prevDensity.fill(0);
        this.Vx.fill(0);
        this.prevVx.fill(0);
        this.Vy.fill(0);
        this.prevVy.fill(0);
        this.divergence.fill(0);
        this.pressure.fill(0);
        this.prevPressure.fill(0);
        this.obstacles.fill(0);
    }

    /**
     * Converts 2D coordinates to 1D index, clamping to boundaries.
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {number} The 1D array index
     */
    IX(x, y) {
        // Clamp to ensure we don't go out of bounds
        if (x < 0) x = 0;
        if (x >= this.size) x = this.size - 1;
        if (y < 0) y = 0;
        if (y >= this.size) y = this.size - 1;

        return x + (y * this.size);
    }

    /**
     * Adds density to a specific location (source).
     * @param {number} x - Grid X coordinate
     * @param {number} y - Grid Y coordinate
     * @param {number} amount - Amount of density to add
     */
    addDensity(x, y, amount) {
        const index = this.IX(x, y);
        this.density[index] += amount;

        // Clamp density for visual stability (optional but prevents whiteout)
        if (this.density[index] > 255) this.density[index] = 255;
    }

    /**
     * Adds velocity to a specific location (force).
     * @param {number} x - Grid X coordinate
     * @param {number} y - Grid Y coordinate
     * @param {number} amountX - Force in X direction
     * @param {number} amountY - Force in Y direction
     */
    addVelocity(x, y, amountX, amountY) {
        const index = this.IX(x, y);
        this.Vx[index] += amountX;
        this.Vy[index] += amountY;
    }

    /**
     * Swaps the current and previous arrays. 
     * Essential step in the stable fluids algorithm (ping-pong buffering).
     * @param {string} field - 'density', 'velocity', or 'pressure'
     */
    swap(field) {
        if (field === 'density') {
            [this.density, this.prevDensity] = [this.prevDensity, this.density];
        } else if (field === 'velocity') {
            [this.Vx, this.prevVx] = [this.prevVx, this.Vx];
            [this.Vy, this.prevVy] = [this.prevVy, this.Vy];
        } else if (field === 'pressure') {
            // Usually we don't ping-pong pressure exactly like others in some implementations,
            // but for warm starting or specific solvers, we might.
            // Here we might just want to back up pressure if needed.
        }
    }

    /**
     * Utility to get a value with bilinear interpolation.
     * Useful for advection step where we look up values at non-integer coordinates.
     * 
     * @param {Float32Array} array - The field to sample from
     * @param {number} x - Floating point X coordinate
     * @param {number} y - Floating point Y coordinate
     * @returns {number} Interpolated value
     */
    getInterpolatedValue(array, x, y) {
        // Ensure coordinates are within grid bounds (minus 1 for interpolation safety)
        if (x < 0.5) x = 0.5;
        if (x > this.size - 1.5) x = this.size - 1.5;
        if (y < 0.5) y = 0.5;
        if (y > this.size - 1.5) y = this.size - 1.5;

        const x0 = Math.floor(x);
        const x1 = x0 + 1;
        const y0 = Math.floor(y);
        const y1 = y0 + 1;

        const s1 = x - x0;
        const s0 = 1 - s1;
        const t1 = y - y0;
        const t0 = 1 - t1;

        const i00 = x0 + y0 * this.size;
        const i10 = x1 + y0 * this.size;
        const i01 = x0 + y1 * this.size;
        const i11 = x1 + y1 * this.size;

        return s0 * (t0 * array[i00] + t1 * array[i01]) +
            s1 * (t0 * array[i10] + t1 * array[i11]);
    }

    /**
     * Returns the total amount of density in the grid.
     * Useful for debugging mass conservation.
     */
    getTotalDensity() {
        let total = 0;
        for (let i = 0; i < this.count; i++) {
            total += this.density[i];
        }
        return total;
    }
}
