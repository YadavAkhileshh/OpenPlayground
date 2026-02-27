/**
 * DarkFluid - Cinematic Fluid Simulation
 * Main Entry Point
 * 
 * Orchestrates the initialization, loop, and component wiring.
 */

import { Config, validateConfig } from './config.js';
import { FluidGrid } from './grid.js';
import { FluidSolver } from './solver.js';
import { FluidRenderer } from './renderer.js';
import { InputHandler } from './input.js';
import { PresetManager } from './presets.js';

// Global state
const canvas = document.getElementById('sim-canvas');
const grid = new FluidGrid(Config.SIMULATION.GRID_SIZE);
const solver = new FluidSolver(grid);
const renderer = new FluidRenderer(canvas, grid);
const input = new InputHandler(canvas, grid);
const presetManager = new PresetManager();

let lastTime = 0;
// Manual Emitters Array
const emitters = [];

/**
 * Initialization function
 */
function init() {
    validateConfig();

    // Set canvas internal resolution to grid size for efficient rendering
    canvas.width = Config.SIMULATION.GRID_SIZE;
    canvas.height = Config.SIMULATION.GRID_SIZE;

    console.log("DarkFluid Initialized.");
    console.log(`Grid: ${Config.SIMULATION.GRID_SIZE}x${Config.SIMULATION.GRID_SIZE}`);

    // Inject some initial chaos
    noiseInjection();

    requestAnimationFrame(loop);
}

/**
 * Main Game Loop
 * @param {number} timestamp 
 */
function loop(timestamp) {
    const dt = Config.SIMULATION.DT;

    // Feature: Time Dilation
    const timeScale = parseFloat(document.getElementById('ctrl-time').value) || 1.0;

    // Feature: Auto-Spawners
    // Orbiting emitter
    const t = timestamp * 0.001 * timeScale;
    const cx = Config.SIMULATION.GRID_SIZE / 2;
    const cy = Config.SIMULATION.GRID_SIZE / 2;

    // Emitter 1
    const ex1 = cx + Math.cos(t) * 40;
    const ey1 = cy + Math.sin(t) * 40;
    // Only emit if density < limit to avoid saturation
    grid.addDensity(Math.floor(ex1), Math.floor(ey1), 50);
    grid.addVelocity(Math.floor(ex1), Math.floor(ey1), -Math.sin(t) * 5, Math.cos(t) * 5);

    // Feature: Click-Emitters
    emitters.forEach(e => {
        grid.addDensity(Math.floor(e.x), Math.floor(e.y), 100);
        // Random slight velocity for interest
        grid.addVelocity(Math.floor(e.x), Math.floor(e.y), (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2);
    });

    // Feature: Wind
    if (Math.abs(Config.FLUID.WIND) > 0.001) {
        // Apply wind force globally
        const wind = Config.FLUID.WIND * 10;
        for (let i = 0; i < grid.count; i++) {
            grid.Vx[i] += wind * dt * timeScale;
        }
    }


    // 1. Simulate
    solver.step(dt * timeScale);

    // 2. Render
    renderer.render();

    requestAnimationFrame(loop);
}

/**
 * Injects some random noise to start the simulation
 */
function noiseInjection() {
    const cx = Config.SIMULATION.GRID_SIZE / 2;
    const cy = Config.SIMULATION.GRID_SIZE / 2;

    for (let i = 0; i < 20; i++) {
        const x = cx + (Math.random() - 0.5) * 50;
        const y = cy + (Math.random() - 0.5) * 50;
        grid.addDensity(Math.floor(x), Math.floor(y), 500);
        grid.addVelocity(Math.floor(x), Math.floor(y), (Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50);
    }
}

// Start
init();

// Expose config to window for UI tweaking
window.DarkFluid = {
    Config: Config,
    reset: () => {
        grid.reset();
        emitters.length = 0;
    },
    addEmitter: (x, y) => emitters.push({ x, y }),
    clearEmitters: () => emitters.length = 0,
    chaos: () => noiseInjection(),
    updateSolverParams: () => {
        solver.iter = Config.SIMULATION.ITERATIONS;
    },
    presets: presetManager
};
