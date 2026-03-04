/**
 * Main entry point for the TuringWorkshop application.
 * Orchestrates the initialization of all modules and logic.
 * @module Main
 */

import { CONFIG } from './simulation/config.js';
import { SimulationEngine } from './simulation/engine.js';
import { CanvasManager } from './renderer/canvas.js';
import { Renderer } from './renderer/renderer.js';
import { Brush } from './ui/brush.js';
import { Controls } from './ui/controls.js';
import { PerfMonitor } from './utils/performance.js';
import { CanvasRecorder } from './utils/recorder.js';
import { HelpSystem } from './ui/help.js';
import { Analysis } from './simulation/analysis.js';

/**
 * Main application class.
 * Orchestrates the initialization of the Simulation, Renderer, UI, and Utilities.
 */
class TuringWorkshop {
    constructor() {
        this.init();
    }

    /**
     * Initialize all sub-modules and start the loop.
     */
    init() {
        console.log("Initializing TuringWorkshop...");

        // 1. Setup Simulation
        // Create the core engine with the defined grid size
        this.simulation = new SimulationEngine(CONFIG.GRID_WIDTH, CONFIG.GRID_HEIGHT);
        this.analysis = new Analysis(this.simulation);

        // 2. Setup Rendering
        // The canvas is displayed full screen (handled by CSS), but internal resolution matches grid
        this.canvasManager = new CanvasManager('simulation-canvas', CONFIG.GRID_WIDTH, CONFIG.GRID_HEIGHT);
        this.renderer = new Renderer(this.canvasManager, CONFIG.GRID_WIDTH, CONFIG.GRID_HEIGHT);

        // 3. Setup Recorder
        this.recorder = new CanvasRecorder(this.canvasManager.canvas);

        // 4. Setup Help
        this.helpSystem = new HelpSystem();

        // 5. Setup Interaction
        this.brush = new Brush(this.canvasManager, this.simulation);

        // Pass everything to Controls
        this.controls = new Controls(
            this.simulation,
            this.renderer,
            this.brush,
            this.recorder,
            this.helpSystem
        );

        // 6. Setup Utilities
        this.perfMonitor = new PerfMonitor();

        // 7. Initial Seed
        this.simulation.seed(CONFIG.GRID_WIDTH / 2, CONFIG.GRID_HEIGHT / 2, 20);

        // 8. Start Loop
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);

        console.log("TuringWorkshop Initialized.");
    }

    loop() {
        // Performance monitoring
        if (this.perfMonitor.update()) {
            this.controls.updateStats(this.perfMonitor.fps);
            // Optionally could update analysis stats on UI every second
            // const stats = this.analysis.getStatistics();
            // console.log(stats);
        }

        if (!this.controls.isPaused) {
            // Multiple simulation steps per frame for speed
            for (let i = 0; i < CONFIG.ITERATIONS; i++) {
                this.simulation.update();
            }
        }

        this.renderer.render(this.simulation);

        requestAnimationFrame(this.loop);
    }
}

// Start the application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    window.app = new TuringWorkshop();
});
