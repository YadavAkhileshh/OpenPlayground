/**
 * @file app.js
 * @description Main application controller for CellularCompress.
 * Orchestrates biological simulation, image processing, cinematic rendering, and UI.
 * v1.0.4 // CORE_PROTOCOL: CGOL-ALPHA
 */

import { SimulationEngine } from './modules/engine.js';
import { ImageProcessor } from './modules/processor.js';
import { CanvasRenderer } from './modules/renderer.js';
import { UIController } from './modules/ui.js';
import { Painter } from './modules/painter.js';

/**
 * The main application class that ties all modules together.
 * Handles state management, animation loops, and event coordination.
 */
class CellularCompress {
    constructor() {
        /** @type {SimulationEngine} */
        this.engine = new SimulationEngine(200, 200);

        /** @type {ImageProcessor} */
        this.processor = new ImageProcessor();

        /** @type {CanvasRenderer} */
        this.renderer = new CanvasRenderer(document.getElementById('main-canvas'));

        /** @type {UIController} */
        this.ui = new UIController();

        /** @type {Painter} */
        this.painter = new Painter(this.renderer.canvas, 200);

        // State Management
        this.isRunning = false;
        this.currentImage = null;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fps = 0;
        this.fpsUpdateTimer = 0;
        this.isPainting = false;

        this.init();
    }

    /**
     * Initializes the application by binding UI events and starting the animation loop.
     */
    init() {
        this.ui.bindEvents({
            onPlay: () => this.start(),
            onPause: () => this.pause(),
            onReset: () => this.reset(),
            onSeek: (gen) => this.seek(gen),
            onImageUpload: (file) => this.handleUpload(file),
            onParamChange: () => this.handleParamChange(),
            onRulesetChange: (rule) => this.handleRulesetChange(rule),
            onBrushModeChange: (mode) => this.painter.setMode(mode),
            onClearSource: () => this.clearSource(),
            onExportImg: () => this.exportImage(),
            onExportLog: () => this.exportLog(),

            // Painting hooks
            onPaintStart: (e) => this.handlePaintStart(e),
            onPaintMove: (e) => this.handlePaintMove(e),
            onPaintEnd: () => this.handlePaintEnd()
        });

        // Initial UI sync
        this.handleParamChange();

        // Start the lifecycle loop
        this.animate();
    }

    /**
     * Commences simulation steps.
     */
    start() {
        if (!this.currentImage && this.engine.size === 0) return;
        this.isRunning = true;
        this.ui.setRunning(true);
    }

    /**
     * Halts simulation steps.
     */
    pause() {
        this.isRunning = false;
        this.ui.setRunning(false);
    }

    /**
     * Reverts the grid to the initial state derived from the current image.
     */
    reset() {
        this.pause();
        if (this.currentImage) {
            this.processImage();
        } else {
            const params = this.ui.getParams();
            this.engine.reset(params.gridSize, params.gridSize);
        }
        this.updateView();
    }

    /**
     * Jumps to a specific generation in the simulation history.
     */
    seek(gen) {
        this.pause();
        if (this.engine.getGeneration(gen)) {
            this.updateView();
        }
    }

    /**
     * Handles image file selection and initial processing.
     */
    async handleUpload(file) {
        try {
            this.currentImage = await this.processor.loadImage(file);
            this.ui.showPreview(this.currentImage.src);
            this.processImage();
            this.updateView();
        } catch (err) {
            console.error("CellularCompress: Upload failed", err);
        }
    }

    /**
     * Updates simulation and rendering parameters.
     */
    handleParamChange() {
        const params = this.ui.getParams();
        this.renderer.setColors(params.color, '#000000');
        this.painter.brushSize = params.brushSize;

        // If grid size changed, we must re-initialize
        if (this.engine.width !== params.gridSize) {
            this.painter.gridSize = params.gridSize;
            if (this.currentImage) {
                this.processImage();
            } else {
                this.engine.reset(params.gridSize, params.gridSize);
            }
        }

        this.updateView();
    }

    /**
     * Changes the underlying Cellular Automata ruleset.
     */
    handleRulesetChange(ruleKey) {
        this.engine.rules.setRule(ruleKey);
    }

    /**
     * Core routine for image-to-grid transformation.
     */
    processImage() {
        const params = this.ui.getParams();
        const grid = this.processor.processToGrid(
            this.currentImage,
            params.gridSize,
            params.gridSize,
            params.threshold
        );

        this.engine.reset(params.gridSize, params.gridSize);
        this.engine.setData(grid);
    }

    /**
     * Clears all source data and resets the engine.
     */
    clearSource() {
        this.pause();
        this.currentImage = null;
        this.ui.hidePreview();
        const params = this.ui.getParams();
        this.engine.reset(params.gridSize, params.gridSize);
        this.updateView();
    }

    /**
     * Syncs the Engine state with the Renderer and UI.
     */
    updateView() {
        const stats = this.engine.getStats();
        const params = this.ui.getParams();

        // Render with active post-processing filters
        this.renderer.render(
            this.engine.currentGrid,
            this.engine.width,
            this.engine.height,
            params.filters
        );

        this.ui.updateTelemetry(stats, this.fps);
    }

    /**
     * Main animation loop coordinating 60fps rendering and simulation steps.
     */
    animate(now = 0) {
        const delta = now - this.lastFrameTime;
        const params = this.ui.getParams();
        const frameInterval = 1000 / params.speed;

        // Perform simulation step if enough time has passed
        if (this.isRunning && delta >= frameInterval) {
            this.engine.step();
            this.updateView();
            this.lastFrameTime = now;
        }

        // FPS Telemetry calculation
        this.frameCount++;
        if (now - this.fpsUpdateTimer > 1000) {
            this.fps = (this.frameCount * 1000) / (now - this.fpsUpdateTimer);
            this.frameCount = 0;
            this.fpsUpdateTimer = now;
        }

        requestAnimationFrame((t) => this.animate(t));
    }

    // --- Interactive Painting ---

    handlePaintStart(e) {
        this.isPainting = true;
        this.handlePaintMove(e);
    }

    handlePaintMove(e) {
        if (!this.isPainting) return;

        const coords = this.painter.screenToGrid(e.clientX, e.clientY);
        this.painter.paint(this.engine.currentGrid, coords.x, coords.y);
        this.updateView();
    }

    handlePaintEnd() {
        this.isPainting = false;
    }

    // --- Export Actions ---

    exportImage() {
        const stats = this.engine.getStats();
        const link = document.createElement('a');
        link.download = `cellular_compressed_gen_${stats.generation}.png`;
        link.href = this.renderer.canvas.toDataURL('image/png');
        link.click();
    }

    exportLog() {
        const stats = this.engine.getStats();
        const params = this.ui.getParams();

        const logContent = [
            "--- CELLULAR COMPRESS BIOMETRIC DATA ---",
            `TIMESTAMP: ${new Date().toISOString()}`,
            `PROTOCOL: CGOL-ALPHA`,
            `RULESET: ${params.ruleset}`,
            `GENERATION: ${stats.generation}`,
            `POPULATION: ${stats.alive} cells`,
            `DORMANCY: ${stats.dead} cells`,
            `ENTROPY: ${stats.entropy.toFixed(6)}%`,
            `GRID_RESOLUTION: ${this.engine.width}x${this.engine.height}`,
            `SIM_LATENCY: ${stats.latency.toFixed(4)}ms`,
            "---------------------------------------"
        ].join('\n');

        const blob = new Blob([logContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `telemetry_gen_${stats.generation}.txt`;
        link.href = url;
        link.click();

        setTimeout(() => URL.revokeObjectURL(url), 100);
    }
}

// Global bootstrap
window.addEventListener('load', () => {
    console.log("CellularCompress: System Online");
    window.app = new CellularCompress();
});
