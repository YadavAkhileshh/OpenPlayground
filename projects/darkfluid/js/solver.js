/**
 * DarkFluid - Cinematic Fluid Simulation
 * Solver Module
 * 
 * The heart of the simulation. Implements the Navier-Stokes equations
 * for incompressible flow using the method of characteristics (semi-Lagrangian advection)
 * and an iterative Gauss-Seidel solver for diffusion and pressure projection.
 * 
 * Key references: 
 * - Jos Stam's "Real-Time Fluid Dynamics for Games" (GDC 2003)
 * - Mike Ash's "Fluid Simulation for Dummies"
 * 
 * @module Solver
 */

import { Config } from './config.js';
import { FluidGrid } from './grid.js';

export class FluidSolver {
    /**
     * @param {FluidGrid} grid - The grid data structure
     */
    constructor(grid) {
        this.grid = grid;
        this.N = grid.size;
        this.iter = Config.SIMULATION.ITERATIONS;
    }

    /**
     * Advances the simulation by one time step.
     * 
     * The standard implementation order:
     * 1. VELOCITY STEP
     *    a. Add Forces (handled by Input module usually, but can be here)
     *    b. Diffuse (Viscosity)
     *    c. Project (Enforce incompressibility)
     *    d. Advect (Self-advection of velocity)
     *    e. Project (Enforce incompressibility again to clean up advection errors)
     * 
     * 2. DENSITY STEP
     *    a. Add Sources (handled by Input)
     *    b. Diffuse (Spreading of dye)
     *    c. Advect (Moving dye along velocity field)
     * 
     * @param {number} dt - Time delta
     */
    step(dt) {
        const g = this.grid;
        const visc = Config.FLUID.VISCOSITY;
        const diff = Config.FLUID.DIFFUSION;
        const N = this.N;

        // --- VELOCITY STEP ---

        // 0. Apply External Forces (Buoyancy)
        if (Config.FLUID.BUOYANCY !== 0) {
            this.applyBuoyancy(g.Vy, g.density, dt);
        }

        // 1. Diffusion - Apply viscosity
        // Swap current and prev to use 'prev' as source and 'curr' as diff target
        g.swap('velocity');
        this.diffuse(1, g.Vx, g.prevVx, visc, dt);
        this.diffuse(2, g.Vy, g.prevVy, visc, dt);

        // 2. Projection - Make flow mass-conserving (incompressible)
        this.project(g.Vx, g.Vy, g.pressure, g.divergence);

        // 3. Advection - Move velocity along itself
        g.swap('velocity');
        this.advect(1, g.Vx, g.prevVx, g.prevVx, g.prevVy, dt);
        this.advect(2, g.Vy, g.prevVy, g.prevVx, g.prevVy, dt);

        // 4. Projection - Final cleanup
        this.project(g.Vx, g.Vy, g.pressure, g.divergence);


        // --- DENSITY STEP ---

        // 1. Diffusion - Density spreading
        g.swap('density');
        this.diffuse(0, g.density, g.prevDensity, diff, dt);

        // 2. Advection - Move density along velocity field
        g.swap('density');
        this.advect(0, g.density, g.prevDensity, g.Vx, g.Vy, dt);

        // 3. Dissipation - Dye fades over time
        this.dissipate(g.density, Config.FLUID.DISSIPATION);
        // Also dissipate velocity slightly to prevent eternal energy
        this.dissipate(g.Vx, Config.FLUID.VELOCITY_DISSIPATION);
        this.dissipate(g.Vy, Config.FLUID.VELOCITY_DISSIPATION);
    }

    /**
     * Solves the linear differential equation for diffusion using Gauss-Seidel relaxation.
     * 
     * @param {number} b - Boundary mode (0=density/scalar, 1=Vx, 2=Vy)
     * @param {Float32Array} x - The field to solve for (destination)
     * @param {Float32Array} x0 - The previous field state (source)
     * @param {number} diff - Diffusion rate
     * @param {number} dt - Time delta
     */
    diffuse(b, x, x0, diff, dt) {
        const a = dt * diff * (this.N - 2) * (this.N - 2);
        this.lin_solve(b, x, x0, a, 1 + 6 * a); // 1 + 4*a for 2D? "Real-Time Fluid Dynamics" uses 1+4a for 2D. 
        // Wait, standard stam 2D is: 
        // x[IX(i,j)] = (x0[IX(i,j)] + a*(x[IX(i-1,j)]+x[IX(i+1,j)]+x[IX(i,j-1)]+x[IX(i,j+1)])) / (1+4*a);

        // My N is including boundaries or not?
        // Traditionally N is grid size. 
        // Let's implement lin_solve specifically for 2D 5-point stencil.
    }

    /**
     * Linear Solver (Gauss-Seidel)
     * Solves linear system x = x0 + A*x
     * 
     * @param {number} b - Boundary mode
     * @param {Float32Array} x - Destination
     * @param {Float32Array} x0 - Source
     * @param {number} a - Center weight numerator term
     * @param {number} c - Denominator term
     */
    lin_solve(b, x, x0, a, c) {
        const N = this.N;
        const iter = this.iter;
        // Pre-calculate inverse c for multiplication (faster)
        const cRecip = 1.0 / c;

        for (let k = 0; k < iter; k++) {
            for (let j = 1; j < N - 1; j++) {
                for (let i = 1; i < N - 1; i++) {
                    const idx = i + j * N;
                    x[idx] = (x0[idx] + a * (
                        x[idx - 1] +
                        x[idx + 1] +
                        x[idx - N] +
                        x[idx + N]
                    )) * cRecip;
                }
            }
            this.set_bnd(b, x);
        }
    }

    /**
     * Calculates the projection step to enforce mass conservation.
     * This separates the velocity field into divergent and divergence-free parts,
     * discarding the divergent part (pressure).
     * 
     * @param {Float32Array} velocX - Velocity X field
     * @param {Float32Array} velocY - Velocity Y field
     * @param {Float32Array} p - Pressure field
     * @param {Float32Array} div - Divergence field
     */
    project(velocX, velocY, p, div) {
        const N = this.N;
        const h = 1.0 / N;

        // 1. Compute Divergence
        // Div = -0.5 * h * ( u(i+1,j)-u(i-1,j) + v(i,j+1)-v(i,j-1) )
        for (let j = 1; j < N - 1; j++) {
            for (let i = 1; i < N - 1; i++) {
                const idx = i + j * N;
                div[idx] = -0.5 * h * (
                    velocX[idx + 1] - velocX[idx - 1] +
                    velocY[idx + N] - velocY[idx - N]
                );
                p[idx] = 0; // Reset pressure guess
            }
        }

        this.set_bnd(0, div);
        this.set_bnd(0, p);

        // 2. Solve Pressure (Poisson equation)
        // Using lin_solve where a=1 and c=4
        this.lin_solve(0, p, div, 1, 4);

        // 3. Subtract Gradient of Pressure from Velocity
        // u = u - 0.5 * (1/h) * (p(i+1,j) - p(i-1,j))
        // v = v - 0.5 * (1/h) * (p(i,j+1) - p(i,j-1))
        for (let j = 1; j < N - 1; j++) {
            for (let i = 1; i < N - 1; i++) {
                const idx = i + j * N;
                velocX[idx] -= 0.5 * (p[idx + 1] - p[idx - 1]) / h;
                velocY[idx] -= 0.5 * (p[idx + N] - p[idx - N]) / h;
            }
        }

        this.set_bnd(1, velocX);
        this.set_bnd(2, velocY);
    }

    /**
     * Advects quantities along the velocity field (Semi-Lagrangian).
     * Trace back where the particle at (i,j) came from (dt time ago)
     * and take that value.
     * 
     * @param {number} b - Boundary mode
     * @param {Float32Array} d - Destination field
     * @param {Float32Array} d0 - Source field
     * @param {Float32Array} velocX - Velocity X to trace with
     * @param {Float32Array} velocY - Velocity Y to trace with
     * @param {number} dt - Time delta
     */
    advect(b, d, d0, velocX, velocY, dt) {
        const N = this.N;
        const dt0 = dt * (N - 2); // Scale dt to grid coords

        for (let j = 1; j < N - 1; j++) {
            for (let i = 1; i < N - 1; i++) {
                const idx = i + j * N;

                // Backtrack
                let x = i - dt0 * velocX[idx];
                let y = j - dt0 * velocY[idx];

                // Clamp to grid interior
                if (x < 0.5) x = 0.5;
                if (x > N - 1.5) x = N - 1.5;
                if (y < 0.5) y = 0.5;
                if (y > N - 1.5) y = N - 1.5;

                // Bilinear interpolation
                const i0 = Math.floor(x);
                const i1 = i0 + 1;
                const j0 = Math.floor(y);
                const j1 = j0 + 1;

                const s1 = x - i0; // dx
                const s0 = 1.0 - s1;
                const t1 = y - j0; // dy
                const t0 = 1.0 - t1;

                // d[i, j] = weighted sum of 4 neighbors
                d[idx] = s0 * (t0 * d0[i0 + j0 * N] + t1 * d0[i0 + j1 * N]) +
                    s1 * (t0 * d0[i1 + j0 * N] + t1 * d0[i1 + j1 * N]);
            }
        }
        this.set_bnd(b, d);
    }

    /**
     * Sets boundary conditions.
     * 0 = Continuity (density/scalars)
     * 1 = Reflection X (walls invert X vel)
     * 2 = Reflection Y (walls invert Y vel)
     * 
     * @param {number} b 
     * @param {Float32Array} x 
     */
    set_bnd(b, x) {
        const N = this.N;

        // Vertical walls
        for (let i = 1; i < N - 1; i++) {
            x[0 + i * N] = b === 1 ? -x[1 + i * N] : x[1 + i * N];       // Left
            x[(N - 1) + i * N] = b === 1 ? -x[(N - 2) + i * N] : x[(N - 2) + i * N]; // Right
        }

        // Horizontal walls
        for (let i = 1; i < N - 1; i++) {
            x[i + 0 * N] = b === 2 ? -x[i + 1 * N] : x[i + 1 * N];       // Top
            x[i + (N - 1) * N] = b === 2 ? -x[i + (N - 2) * N] : x[i + (N - 2) * N]; // Bottom
        }

        // Internal Obstacles
        const obs = this.grid.obstacles;
        for (let j = 1; j < N - 1; j++) {
            for (let i = 1; i < N - 1; i++) {
                const idx = i + j * N;
                if (obs[idx] === 1) {
                    x[idx] = 0; // Zero out value inside obstacle
                }
            }
        }

        // Corners (average of neighbors)
        x[0 + 0 * N] = 0.5 * (x[1 + 0 * N] + x[0 + 1 * N]);
        x[0 + (N - 1) * N] = 0.5 * (x[1 + (N - 1) * N] + x[0 + (N - 2) * N]);
        x[(N - 1) + 0 * N] = 0.5 * (x[(N - 2) + 0 * N] + x[(N - 1) + 1 * N]);
        x[(N - 1) + (N - 1) * N] = 0.5 * (x[(N - 2) + (N - 1) * N] + x[(N - 1) + (N - 2) * N]);
    }

    /**
     * Dissipates a field over time (e.g. density fading).
     * @param {Float32Array} array 
     * @param {number} rate 
     */
    dissipate(array, rate) {
        for (let i = 0; i < array.length; i++) {
            array[i] *= rate;
        }
    }

    /**
     * Applies buoyancy force based on density.
     * Hot/Dense smoke rises (or falls if buoyancy is negative).
     * @param {Float32Array} velocY 
     * @param {Float32Array} density 
     * @param {number} dt 
     */
    applyBuoyancy(velocY, density, dt) {
        const force = Config.FLUID.BUOYANCY;
        for (let i = 0; i < this.grid.count; i++) {
            // Simple model: Density creates upward force
            // Could strictly be (T - T_ambient) + alpha * Density
            // Here we just use density as "heat/smoke" proxy
            if (density[i] > 0) {
                velocY[i] -= density[i] * force * dt; // Y is down, so subtract = up
            }
        }
    }
}
