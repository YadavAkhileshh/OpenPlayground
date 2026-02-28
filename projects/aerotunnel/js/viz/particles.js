/**
 * @file particles.js
 * @description Lagrangian Particle Tracking system for flow visualization.
 * Simulates massless tracer particles advected by the fluid velocity field.
 */

import { clamp, lerp } from '../utils/math.js';

export class ParticleSystem {
    /**
     * @param {LBMSolver} solver 
     * @param {number} count 
     */
    constructor(solver, count = 2000) {
        this.solver = solver;
        this.count = count;

        // Particle state: x, y, age, speed
        this.x = new Float32Array(count);
        this.y = new Float32Array(count);
        this.age = new Float32Array(count);

        this.maxAge = 300;
        this.active = false;

        this.init();
    }

    init() {
        for (let i = 0; i < this.count; i++) {
            this.respawn(i);
            // Randomize age to avoid pulsing
            this.age[i] = Math.random() * this.maxAge;
        }
    }

    /**
     * Respawn particle i at inlet or random location
     * @param {number} i 
     */
    respawn(i) {
        // Respawn primarily at inlet (left side)
        this.x[i] = Math.random() * 20; // First 20 pixels
        this.y[i] = Math.random() * this.solver.height;
        this.age[i] = 0;
    }

    /**
     * Update particle positions based on fluid velocity.
     * Uses Bilinear Interpolation for smooth movement.
     * Integrator: RK2 or simple Euler.
     */
    update() {
        if (!this.active) return;

        const width = this.solver.width;
        const height = this.solver.height;
        const ux = this.solver.ux;
        const uy = this.solver.uy;
        const dt = 1.0; // Time step match simulation

        for (let i = 0; i < this.count; i++) {
            let px = this.x[i];
            let py = this.y[i];

            if (px < 0 || px >= width - 1 || py < 0 || py >= height - 1) {
                this.respawn(i);
                continue;
            }

            // Interpolate velocity at current position
            const ix = Math.floor(px);
            const iy = Math.floor(py);
            const fx = px - ix;
            const fy = py - iy;

            // Indices
            const idx00 = iy * width + ix;
            const idx10 = idx00 + 1;
            const idx01 = idx00 + width;
            const idx11 = idx01 + 1;

            // Bilinear interpolation of Velocity X
            const vx00 = ux[idx00];
            const vx10 = ux[idx10];
            const vx01 = ux[idx01];
            const vx11 = ux[idx11];
            const vx = lerp(lerp(vx00, vx10, fx), lerp(vx01, vx11, fx), fy);

            // Bilinear interpolation of Velocity Y
            const vy00 = uy[idx00];
            const vy10 = uy[idx10];
            const vy01 = uy[idx01];
            const vy11 = uy[idx11];
            const vy = lerp(lerp(vy00, vy10, fx), lerp(vy01, vy11, fx), fy);

            // Advect
            this.x[i] += vx * dt * (window.SIM_SPEED ? window.SIM_SPEED * 100 : 10); // Scale for viz
            this.y[i] += vy * dt * (window.SIM_SPEED ? window.SIM_SPEED * 100 : 10);

            this.age[i]++;

            // Kill if too old or out of bounds
            if (this.age[i] > this.maxAge || this.x[i] > width) {
                this.respawn(i);
            }
        }
    }

    /**
     * Render particles to canvas context.
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} scaleX - Canvas scale
     * @param {number} scaleY 
     */
    render(ctx, scaleX = 1, scaleY = 1) {
        if (!this.active) return;

        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        // Or speed based color?

        for (let i = 0; i < this.count; i++) {
            // Draw simple rects or circles
            // Rects are faster
            ctx.fillRect(this.x[i], this.y[i], 1, 1);
        }
    }
}
