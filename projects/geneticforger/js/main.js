/**
 * @fileoverview Main entry point for the GeneticForger application.
 * Orchestrates the interaction between the Application Engine (Evolver),
 * the User Interface (Controls, Stats), and Utility helpers.
 */

import { Evolver } from './engine/evolver.js';
import { Renderer } from './engine/renderer.js';
import { CONFIG } from './engine/types.js';
import { StatsManager } from './ui/stats.js';
import { ControlsManager } from './ui/controls.js';
import { Visualizer } from './ui/visualizer.js';
import { SVGExporter } from './utils/exporter.js';
import { SnapshotManager } from './utils/snapshot.js';
import { ConfigManager } from './utils/config.js';

/**
 * Main Application Controller.
 * Initializes components, manages the main loop, and handles global state.
 */
class App {
    /**
     * Initializes the application.
     * Sets up canvas contexts, initiates modules, and binds event listeners.
     */
    constructor() {
        // Elements
        this.targetCanvas = document.getElementById('target-canvas');
        this.bestCanvas = document.getElementById('best-canvas');

        // Contexts
        this.targetCtx = this.targetCanvas.getContext('2d');
        this.bestCtx = this.bestCanvas.getContext('2d');

        // Modules
        this.stats = new StatsManager();
        this.visualizer = new Visualizer();
        this.snapshots = new SnapshotManager();
        this.configManager = new ConfigManager();

        const initialConfig = this.configManager.load();

        this.controls = new ControlsManager({
            onStart: () => this.start(),
            onPause: () => this.pause(),
            onReset: () => this.reset(),
            onImageLoaded: (img) => this.loadImage(img),
            onSettingsChanged: (settings) => this.updateSettings(settings)
        }, initialConfig);

        // Add explicit Export button listener since it's not in base controls (or add it dynamically)
        this.addExportButton();

        // Engine
        this.evolver = new Evolver(this.targetCanvas);
        this.displayRenderer = new Renderer(this.bestCtx, this.bestCanvas.width, this.bestCanvas.height);

        // State
        this.isRunning = false;
        this.animationId = null;

        // Apply initial default settings
        this.controls.emitSettings();

        // Load default image placeholder or instructions
        this.drawPlaceholder();
    }

    /**
     * Dynamically adds the Export button to the UI.
     * Located here to keep UI logic somewhat centralized but specific to main app actions.
     */
    addExportButton() {
        const btnContainer = document.querySelector('.control-group');
        const btnExport = document.createElement('button');
        btnExport.className = 'btn btn-secondary';
        btnExport.textContent = 'SVG Export';
        btnExport.onclick = () => {
            SVGExporter.download(this.evolver.getBestGenome());
        };
        btnContainer.appendChild(btnExport);
    }

    /**
     * Draws the initial placeholder text on the target canvas.
     */
    drawPlaceholder() {
        this.targetCtx.fillStyle = '#111';
        this.targetCtx.fillRect(0, 0, 400, 400);
        this.targetCtx.fillStyle = '#333';
        this.targetCtx.font = '20px monospace';
        this.targetCtx.textAlign = 'center';
        this.targetCtx.fillText('Drop Image Here', 200, 200);
    }

    /**
     * Handles a newly loaded image.
     * Resizes and centers the image on the target canvas.
     * @param {HTMLImageElement} img - The loaded image object.
     */
    loadImage(img) {
        // Draw image to target canvas, preserving aspect ratio
        const size = CONFIG.CANVAS_SIZE;
        this.targetCtx.clearRect(0, 0, size, size);

        // Simple cover/contain logic
        const scale = Math.max(size / img.width, size / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (size - w) / 2;
        const y = (size - h) / 2;

        this.targetCtx.drawImage(img, x, y, w, h);

        // Reset evolver with new target
        this.evolver.initTarget();
        this.reset();
    }

    /**
     * Starts the evolution loop.
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.loop();
    }

    /**
     * Pauses the evolution loop.
     */
    pause() {
        this.isRunning = false;
        cancelAnimationFrame(this.animationId);
    }

    /**
     * Resets the application state to the beginning of evolution.
     * Clears stats, visualizer, and snapshots.
     */
    reset() {
        this.pause();
        this.evolver.initTarget();
        this.stats.reset();
        this.visualizer.reset();
        this.snapshots.clear();

        // Clear display
        this.displayRenderer.render(this.evolver.getBestGenome());
    }

    /**
     * The main animation loop.
     * Performs multiple evolution steps per frame to speed up convergence.
     */
    loop() {
        if (!this.isRunning) return;

        // Run multiple evolutionary steps per frame for speed
        const stepsPerFrame = 50;
        let improved = false;

        for (let i = 0; i < stepsPerFrame; i++) {
            if (this.evolver.step()) {
                improved = true;
            }
        }

        // Update stats
        this.stats.update(
            this.evolver.generation,
            this.evolver.bestFitness,
            CONFIG.POLYGON_COUNT
        );

        // Only redraw if we found an improvement (or periodically to show "effort")
        if (improved) {
            this.displayRenderer.render(this.evolver.getBestGenome());
            this.visualizer.pushFitness(this.evolver.bestFitness);

            // Snapshot occasionally
            if (this.evolver.generation % 1000 === 0) {
                this.snapshots.capture(
                    this.evolver.generation,
                    this.evolver.getBestGenome(),
                    this.evolver.bestFitness
                );
            }
        } else {
            // Occasionally push fitness to graph even if flat (every 60 frames)
            if (this.evolver.generation % 60 === 0) {
                this.visualizer.pushFitness(this.evolver.bestFitness);
            }
        }

        this.animationId = requestAnimationFrame(() => this.loop());
    }

    /**
     * Updates evolution parameters from UI settings.
     * @param {Object} settings - The new settings values.
     */
    updateSettings(settings) {
        // Save to local storage (Convert back to 0-100 range for consistency with loader)
        this.configManager.save({
            mutationRate: settings.mutationRate * 1000,
            vertexShift: settings.vertexShift * 100,
            colorShift: settings.colorShift
        });

        // Map UI 0-1 values back to engine expectations
        this.evolver.mutationRates = {
            mutationChance: settings.mutationRate,
            vertexShift: settings.vertexShift,
            colorShift: settings.colorShift,
            opacityShift: settings.opacityShift
        };
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
