/**
 * @file solver.js
 * @description Core Lattice Boltzmann Method (LBM) Solver using D2Q9 model.
 * Handles the simulation grid, collision, and streaming steps.
 */

import { Q, EX, EY, WEIGHTS, OPPOSITE, DEFAULTS } from './constants.js';

export class LBMSolver {
    /**
     * Creates an instance of the LBM Solver.
     * @param {number} width - Grid width
     * @param {number} height - Grid height
     */
    constructor(width = DEFAULTS.WIDTH, height = DEFAULTS.HEIGHT) {
        this.width = width;
        this.height = height;
        this.size = width * height;

        // Fluid parameters
        this.omega = 1.0 / DEFAULTS.TAU; // Relaxation frequency (1/tau)
        this.viscosity = (DEFAULTS.TAU - 0.5) / 3.0; // Kinematic viscosity

        // Macroscopic variables
        // Density (rho) at each node
        this.rho = new Float32Array(this.size);
        // Velocity (ux, uy) at each node
        this.ux = new Float32Array(this.size);
        this.uy = new Float32Array(this.size);

        // Microscopic variables (Distribution functions)
        // Two buffers for double buffering (streaming step)
        // Flattened arrays: index = (y * width + x) * Q + direction
        // However, SoA (Structure of Arrays) might be faster in JS?
        // Let's stick to simple 1D arrays for each direction for now to avoid multiply overhead in inner loops if possible,
        // or just one big array. 
        // Best practice for cache coherence in LBM is often SoA or blocked.
        // For simplicity and readability in JS: 
        // 9 arrays of length `size`.

        this.f = [];     // Current distribution
        this.new_f = []; // Next distribution (buffer)

        // Initialize distribution arrays
        for (let i = 0; i < Q; i++) {
            this.f[i] = new Float32Array(this.size);
            this.new_f[i] = new Float32Array(this.size);
        }

        // Obstacle map (boolean: true = solid)
        this.obstacles = new Uint8Array(this.size);

        this.init();
    }

    /**
     * Initialize the field with uniform density and zero velocity.
     */
    init() {
        const rho0 = DEFAULTS.DENSITY;
        const ux0 = 0.0;
        const uy0 = 0.0;

        // Calculate equilibrium distribution f_eq for initial state
        const f_eq = new Float32Array(Q);
        this.calculateEquilibrium(rho0, ux0, uy0, f_eq);

        for (let i = 0; i < this.size; i++) {
            this.rho[i] = rho0;
            this.ux[i] = ux0;
            this.uy[i] = uy0;
            this.obstacles[i] = 0; // Clear obstacles

            // Set all f to equilibrium
            for (let k = 0; k < Q; k++) {
                this.f[k][i] = f_eq[k];
            }
        }

        console.log(`LBM Solver Initialized: ${this.width}x${this.height}`);
    }

    /**
     * Calculate Equilibrium Distribution Function f_eq.
     * D2Q9 Equilibrium formula:
     * f_eq_i = w_i * rho * [1 + 3(e_i . u) + 4.5(e_i . u)^2 - 1.5(u . u)]
     * 
     * @param {number} rho - Density
     * @param {number} ux - Velocity X
     * @param {number} uy - Velocity Y
     * @param {Float32Array} out_feq - Output array for f_eq values (length 9)
     */
    calculateEquilibrium(rho, ux, uy, out_feq) {
        const u2 = ux * ux + uy * uy; // u dot u
        const term1 = 1.0 - 1.5 * u2;

        // Unroll loop for performance since Q is small and fixed
        for (let i = 0; i < Q; i++) {
            const eu = EX[i] * ux + EY[i] * uy; // e_i dot u
            out_feq[i] = WEIGHTS[i] * rho * (term1 + 3.0 * eu + 4.5 * eu * eu);
        }
    }

    /**
     * Set the viscosity by updating the relaxation frequency omega.
     * @param {number} viscosity 
     */
    setViscosity(viscosity) {
        this.viscosity = viscosity;
        const tau = 3.0 * viscosity + 0.5;
        this.omega = 1.0 / tau;
        // console.log(`Viscosity set to ${viscosity}, Tau: ${tau}, Omega: ${this.omega}`);
    }

    /**
     * Core simulation step.
     * Includes Collision and Streaming.
     * @param {number} inletSpeed - Velocity at the left boundary.
     */
    step(inletSpeed) {
        // 1. Collision Step (Relaxation towards Equilibrium)
        // Also computes macroscopic moments (rho, u)
        this.collideAndStream(inletSpeed);

        // 2. Handle Boundaries (Inlet/Outlet specific logic usually handled in stream or post-stream)
        // We will integrate simple boundary handling into the main loop or separate.
        // For performance, we often fuse collision and streaming.
    }

    /**
     * Combined Collision and Streaming step for optimized performance.
     * 
     * Standard LBM:
     * f_next(x + e_i, t + 1) = f(x, t) - omega * (f(x, t) - f_eq(x, t))
     * 
     * We iterate over every cell:
     * 1. Calculate rho and u from current f.
     * 2. Calculate f_eq.
     * 3. Perform collision: f_out = f - omega * (f - f_eq).
     * 4. Stream f_out to neighbor's input buffer (new_f).
     * 
     * @param {number} inletSpeed 
     */
    collideAndStream(inletSpeed) {
        const width = this.width;
        const height = this.height;
        const size = this.size;

        // Pre-calculate squared 3.0 coefficient for speed
        // Actually constants are fine.

        // Re-usable f_eq array (optimization: careful with variable scope in loop)
        // Actually, declaring variables inside loop in modern JS JIT is fast enough usually.

        // Iterate over all cells
        // Ignoring boundaries for main loop to avoid bounds checking? 
        // Or handle boundaries with modulo or clamp?
        // Let's iterate full 0 to size and handle bounds carefully.

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;

                // 0. Handle Obstacles (Bounce-back) inside Stream or separate?
                // Standard way: If obstacle, reflect.
                // If we do full bounceback here, we need to know where it CAME from or where it goes.
                // Standard "rigid" bounce-back: Pre-stream, or modify stream.
                // Let's compute macroscopic first.

                if (this.obstacles[idx]) {
                    // Logic for obstacle nodes (no collision, pure bounce back usually handled in stream)
                    // We will skip collision for obstacles and handle bounce-back in streaming phase.
                    // But here we are fusing.

                    // Simple Bounce-Back: 
                    // The particle *leaving* this node in direction i 
                    // comes from... wait.
                    // Usually: f_new[opposite[i] at neighbor] = f[i]
                    // If we stream OUT FROM here.

                    // Let's stick to standard split separate loops for clarity first, optimize later?
                    // Split implementation is safer.
                    // Step 1: Collision -> f_post_collision
                    // Step 2: Stream -> f_new
                    continue;
                }

                // 1. Macroscopic variables (Moments)
                let rho = this.f[0][idx];
                let ux = 0; // weighted sum will be done differently
                let uy = 0;

                // Center (0) has 0 velocity contribution

                // Sum components
                // Only loop 1-8 for velocity
                rho += this.f[1][idx] + this.f[2][idx] + this.f[3][idx] + this.f[4][idx] +
                    this.f[5][idx] + this.f[6][idx] + this.f[7][idx] + this.f[8][idx];

                // u = (sum f_i * e_i) / rho
                const f1 = this.f[1][idx];
                const f2 = this.f[2][idx];
                const f3 = this.f[3][idx];
                const f4 = this.f[4][idx];
                const f5 = this.f[5][idx];
                const f6 = this.f[6][idx];
                const f7 = this.f[7][idx];
                const f8 = this.f[8][idx];

                // EX: 0, 1, 0, -1, 0, 1, -1, -1, 1
                // EY: 0, 0, 1, 0, -1, 1, 1, -1, -1

                const sumX = (f1 + f5 + f8) - (f3 + f6 + f7);
                const sumY = (f2 + f5 + f6) - (f4 + f7 + f8);

                ux = sumX / rho;
                uy = sumY / rho;

                // Force Inlet Condition at x=0 (Left boundary)
                if (x === 0) {
                    ux = inletSpeed; // Fixed inlet velocity
                    uy = 0.0;
                    // We also need to fix Density ideally, or let it fluctuate?
                    // Zou-He boundary is better, but simple forcing works for basic viz.
                    // Set equilibrium based on this forced velocity.
                    rho = 1.0;
                }

                this.rho[idx] = rho;
                this.ux[idx] = ux;
                this.uy[idx] = uy;

                // 2. Equilibrium & Collision (BGK)
                // f_out = f - omega * (f - f_eq)

                const u2 = ux * ux + uy * uy;
                const term1 = 1.0 - 1.5 * u2;
                const omega = this.omega;

                for (let i = 0; i < Q; i++) {
                    const eu = EX[i] * ux + EY[i] * uy;
                    const feq = WEIGHTS[i] * rho * (term1 + 3.0 * eu + 4.5 * eu * eu);

                    // Relax
                    // Store in place? No, we need original f for streaming.
                    // We can write to a temporary, or directly stream.
                    // Fused Stream: write to neighbor in new_f

                    const f_post = this.f[i][idx] * (1.0 - omega) + feq * omega;

                    // 3. Streaming (Propagate to Neighbors)
                    // Neighbor coordinate
                    const nbX = x + EX[i];
                    const nbY = y + EY[i];

                    // Check bounds
                    if (nbX >= 0 && nbX < width && nbY >= 0 && nbY < height) {
                        const nbIdx = nbY * width + nbX;

                        // Handle Obstacle Collision (Bounce-back)
                        // If the target neighbor is an obstacle, bouncing back means
                        // the particle reflects back to where it came from.
                        if (this.obstacles[nbIdx]) {
                            // Standard halfway bounce-back:
                            // The particle going `i` hits wall, returns as `opposite[i]` to `idx`?
                            // No, this is tricky in fused loop.

                            // Simplest Half-way Bounce: 
                            // If neighbor is solid, the stream into it is rejected and sent back to CURRENT node
                            // into the OPPOSITE direction slot of the NEXT step.
                            // i.e. new_f[opposite[i]][idx] = f_post

                            this.new_f[OPPOSITE[i]][idx] = f_post;

                        } else {
                            // Normal propagation
                            this.new_f[i][nbIdx] = f_post;
                        }
                    } else {
                        // Boundary of domain
                        // Periodic? Or Open?
                        // Top/Bottom (y=0, y=h-1): Slip or No-Slip?
                        // Let's do Bounce-back (No-Slip) for Top/Bottom walls naturally 
                        // if we treat out-of-bounds as solid, 
                        // OR special handling.

                        // Let's treat Top/Bottom as Solid Walls (Bounce back)
                        if (nbY < 0 || nbY >= height) {
                            this.new_f[OPPOSITE[i]][idx] = f_post;
                        }
                        // Left/Right handled specifically?
                        // Outlet at Right (x=width-1): 
                        // Simple extrapolation or just let it leave (Open boundary)
                        else if (nbX >= width) {
                            // Outlet: Zero-gradient (copy from current)
                            // Or simple absorption. 
                            // Try: Copy to self (nothing enters from right?)
                        }
                        else if (nbX < 0) {
                            // Inlet: Already handled by forcing macroscopic at x=0?
                            // But we need incoming populations.
                        }
                    }
                }
            }
        }

        // Handling Inlet/Outlet Boundaries specifically after loop often better for stability.

        // Swap buffers
        const temp = this.f;
        this.f = this.new_f;
        this.new_f = temp;
    }

    /**
     * Add or remove obstacle at coordinates.
     * @param {number} x - Grid X
     * @param {number} y - Grid Y
     * @param {number} radius - Radius of brush
     * @param {boolean} isSolid - True to add, False to remove
     */
    setObstacle(x, y, radius, isSolid) {
        const r2 = radius * radius;
        const startX = Math.max(0, Math.floor(x - radius));
        const endX = Math.min(this.width, Math.ceil(x + radius));
        const startY = Math.max(0, Math.floor(y - radius));
        const endY = Math.min(this.height, Math.ceil(y + radius));

        for (let j = startY; j < endY; j++) {
            for (let i = startX; i < endX; i++) {
                const dx = i - x;
                const dy = j - y;
                if (dx * dx + dy * dy <= r2) {
                    const idx = j * this.width + i;
                    this.obstacles[idx] = isSolid ? 1 : 0;
                    if (isSolid) {
                        // Reset velocity inside obstacle
                        this.ux[idx] = 0;
                        this.uy[idx] = 0;
                    }
                }
            }
        }
    }

    clearObstacles() {
        this.obstacles.fill(0);
    }

    /**
     * Reset the simulation field.
    */
    reset() {
        this.init();
    }
}
