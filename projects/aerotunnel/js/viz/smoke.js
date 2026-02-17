/**
 * @file smoke.js
 * @description Passive Scalar Transport solver for smoke/dye visualization.
 * Solves the advection-diffusion equation for a scalar field 'rho_smoke'.
 */

import { Q, EX, EY, WEIGHTS, DEFAULTS } from '../lbm/constants.js';

export class SmokeSolver {
    /**
     * @param {LBMSolver} solver 
     */
    constructor(solver) {
        this.solver = solver;
        this.width = solver.width;
        this.height = solver.height;
        this.size = solver.size;

        // Scalar field (0.0 - 1.0)
        this.density = new Float32Array(this.size);
        this.new_density = new Float32Array(this.size);

        // Diffusion coefficient (very low for smoke)
        this.diffusivity = 0.001;

        this.sources = [];
        this.active = true;
    }

    addSource(x, y, intensity = 1.0) {
        this.sources.push({ x, y, intensity });
    }

    clearSources() {
        this.sources = [];
    }

    /**
     * Step the scalar field.
     * Using a simple Upwind Scheme or Semi-Lagrangian would be better for stability,
     * but adhering to LBM, we can use a D2Q9 scalar lattice too!
     * 
     * However, for simplicity and memory index, let's use a semi-Lagrangian advection step
     * reused from the velocity field, as it's visually pleasing and stable.
     */
    step() {
        if (!this.active) return;

        const width = this.width;
        const height = this.height;
        const u = this.solver.ux;
        const v = this.solver.uy;
        const dt = 1.0;

        // 1. Add Sources
        for (let src of this.sources) {
            const idx = src.y * width + src.x;
            if (idx >= 0 && idx < this.size) {
                this.density[idx] = Math.min(1.0, this.density[idx] + src.intensity * 0.1);
                // Blob
                if (src.x + 1 < width) this.density[idx + 1] += src.intensity * 0.05;
                if (src.y + 1 < height) this.density[idx + width] += src.intensity * 0.05;
            }
        }

        // 2. Advect (Back-trace)
        // rho_new(x) = rho_old(x - u*dt)
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;

                if (this.solver.obstacles[idx]) {
                    this.new_density[idx] = 0;
                    continue;
                }

                // Velocity at x,y
                // Backtrace
                // Scale velocity? The LBM velocity is effectively dx/dt units.
                // So multiplier is just 1.0 if time step matches.
                // However, LBM u is small (0.1). 

                const vx = u[idx];
                const vy = v[idx];

                let bx = x - vx * 3.0; // Advection speed multiplier for visual effect
                let by = y - vy * 3.0; // 

                // Clamp
                if (bx < 0) bx = 0; if (bx > width - 1) bx = width - 1;
                if (by < 0) by = 0; if (by > height - 1) by = height - 1;

                // Bilinear sample
                const ix = Math.floor(bx);
                const iy = Math.floor(by);
                const fx = bx - ix;
                const fy = by - iy;

                const i00 = iy * width + ix;
                const i10 = i00 + 1;
                const i01 = i00 + width;
                const i11 = i01 + 1;

                // Safe access handled by clamp above mostly, but edge cases:
                // Use density array
                const d00 = this.density[i00] || 0;
                const d10 = this.density[i10] || 0;
                const d01 = this.density[i01] || 0;
                const d11 = this.density[i11] || 0;

                const val = (d00 * (1 - fx) + d10 * fx) * (1 - fy) +
                    (d01 * (1 - fx) + d11 * fx) * fy;

                // Decay (Dissipation)
                this.new_density[idx] = val * 0.995;
            }
        }

        // Swap
        const temp = this.density;
        this.density = this.new_density;
        this.new_density = temp;
    }
}
