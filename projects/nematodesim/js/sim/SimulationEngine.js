// NematodeSim — Simulation Engine
// Top-level coordinator for the entire simulation loop.
// Owns the RAF loop, Population, CanvasRenderer, and handles
// frame timing, pause/resume, and global parameter updates.

import { Population } from '../organism/Population.js';
import { CanvasRenderer } from '../renderer/CanvasRenderer.js';
import { DragVisualizer } from '../drag/DragVisualizer.js';
import Config from './Config.js';

export class SimulationEngine {
    /**
     * @param {HTMLCanvasElement} canvas
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.running = false;
        this._rafId = null;
        this._lastTime = 0;
        this._frameCount = 0;
        this._fps = 0;
        this._fpsSmooth = 60;

        // Core systems (initialized in init())
        this.population = null;
        this.renderer = null;
        this.dragVis = new DragVisualizer();

        // Current parameter values
        this.frequency = Config.FREQUENCY_DEFAULT;
        this.viscosity = Config.VISCOSITY_DEFAULT;
        this.showDrag = false;
    }

    /** Initialize with canvas dimensions. */
    init() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        this.population = new Population(w, h, Config.ORGANISM_COUNT);
        this.renderer = new CanvasRenderer(this.canvas, this.dragVis);
        this.renderer.init();
    }

    /** Start the RAF loop. */
    start() {
        if (this.running) return;
        this.running = true;
        this._lastTime = performance.now();
        this._loop(this._lastTime);
    }

    /** Pause the simulation (RAF stops). */
    pause() {
        this.running = false;
        if (this._rafId) cancelAnimationFrame(this._rafId);
    }

    /** Resume after pause. */
    resume() {
        if (this.running) return;
        this.running = true;
        this._lastTime = performance.now();
        this._loop(this._lastTime);
    }

    /** RAF callback. */
    _loop(now) {
        if (!this.running) return;
        this._rafId = requestAnimationFrame(t => this._loop(t));

        // Compute smoothed FPS
        const rawDt = Math.min((now - this._lastTime) * 0.001, 0.05);
        this._lastTime = now;
        this._fpsSmooth = this._fpsSmooth * 0.92 + (1 / rawDt) * 0.08;
        this._fps = Math.round(this._fpsSmooth);
        this._frameCount++;

        const dt = Config.DT;   // Fixed timestep regardless of actual frame rate

        // Update physics
        this.population.update(dt);

        // Collect drag arrows for visualisation
        if (this.showDrag) {
            this.dragVis.clear();
            this.population.organisms.forEach(o => {
                this.dragVis.recordFromDrags(o.drag.lastDrags);
            });
        }

        // Render
        this.renderer.render(this.population, this._fps, this.showDrag);
    }

    /** Called when viscosity slider changes. */
    setViscosity(v) {
        this.viscosity = v;
        this.population.setViscosity(v);
    }

    /** Called when frequency slider changes. */
    setFrequency(hz) {
        this.frequency = hz;
        this.population.setFrequency(hz);
    }

    /** Toggle drag visualisation. */
    toggleDrag() {
        this.showDrag = !this.showDrag;
        if (this.showDrag) this.dragVis.enable();
        else this.dragVis.disable();
        return this.showDrag;
    }

    /** Handle window resize. */
    resize(w, h) {
        this.canvas.width = w;
        this.canvas.height = h;
        this.population?.resize(w, h);
        this.renderer?.resize(w, h);
    }

    /** Current FPS. */
    get fps() { return this._fps; }
}

export default SimulationEngine;
