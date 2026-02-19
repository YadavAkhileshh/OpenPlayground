/**
 * PixelAlchemy - Main Entry Point
 * Orchestrates the initialization of the engine, UI, and event listeners.
 */

import { GameLoop } from './core/loop.js';
/**
 * PixelAlchemy - Main Entry Point
 * 
 * Initializes the simulation environment, setting up the grid, renderer, input handling,
 * and the main game loop. Connects all modules together.
 * 
 * @module Main
 * @author PixelAlchemy Team
 */

import { Grid } from './engine/grid.js';
import { Renderer } from './renderer/canvas.js';
import { InputHandler } from './core/events.js';
import { UI } from './renderer/ui.js';
import { Config } from './core/config.js';
import { StorageManager } from './core/storage.js';
import { WorldGenerator } from './engine/generator.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Configuration
    // Canvas resolution is fixed for logic, but scaled via CSS
    const canvas = document.getElementById('simulation-canvas');

    // We want a high pixel density but manageable logic count
    // A 400x400 grid = 160,000 particles. 
    // A 600x400 grid = 240,000 particles.
    canvas.width = 600;
    canvas.height = 400;

    // 2. Initialize Core Systems
    const grid = new Grid(canvas.width, canvas.height);
    const renderer = new Renderer(canvas, grid);
    const input = new InputHandler(canvas, grid);
    const storage = new StorageManager(grid, renderer);
    const generator = new WorldGenerator(grid);
    const ui = new UI(grid, input, storage, generator);

    // 3. Initialize Game Loop
    const loop = new GameLoop((dt) => {
        // Update Physics
        grid.update(dt);

        // Render
        renderer.draw();

        // Update UI stats
        ui.updateStats(loop.fps, grid.activeParticles);
    });

    // 4. Bind Input to specific actions
    input.onPaint = (x, y, brushSize, materialId) => {
        grid.paint(x, y, brushSize, materialId);
    };

    // 5. Start
    loop.start();

    // Expose for debugging
    window.pixelAlchemy = { grid, renderer, loop };

    console.log("PixelAlchemy Initialized. Canvas Size:", canvas.width, "x", canvas.height);
});
