// NematodeSim — Canvas Renderer (Main Rendering Coordinator)
// Orchestrates all sub-renderers for one complete frame.
// Called once per RAF tick by SimulationEngine.

import { BackgroundRenderer } from './BackgroundRenderer.js';
import { OrganismRenderer } from './OrganismRenderer.js';
import { DragArrowRenderer } from './DragArrowRenderer.js';
import { EffectsRenderer } from './EffectsRenderer.js';
import { HUDRenderer } from './HUDRenderer.js';
import Config from '../sim/Config.js';

export class CanvasRenderer {
    /**
     * @param {HTMLCanvasElement} canvas
     * @param {DragVisualizer}    dragVis
     */
    constructor(canvas, dragVis) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.dragVis = dragVis;
        this.w = canvas.width;
        this.h = canvas.height;

        this._bg = new BackgroundRenderer(this.ctx);
        this._org = new OrganismRenderer(this.ctx);
        this._drag = new DragArrowRenderer(this.ctx);
        this._effects = new EffectsRenderer(this.ctx, this.w, this.h);
        this._hud = new HUDRenderer(this.ctx);
    }

    /** One-time initialization after canvas is ready. */
    init() {
        this.ctx.imageSmoothingEnabled = true;
    }

    /**
     * Render one complete frame.
     * @param {Population} population
     * @param {number}     fps         Smoothed FPS
     * @param {boolean}    showDrag    Drag visualization toggle
     */
    render(population, fps, showDrag) {
        const ctx = this.ctx;
        const w = this.w;
        const h = this.h;

        // 1. Background
        this._bg.draw(w, h);

        // 2. Ambient particles
        this._effects.draw(population);

        // 3. All organisms
        const orgs = population.organisms;
        for (let i = 0; i < orgs.length; i++) {
            this._org.draw(orgs[i]);
        }

        // 4. Drag arrows (when enabled)
        if (showDrag) {
            this._drag.draw(this.dragVis);
        }

        // 5. HUD overlay
        this._hud.draw(
            w, h, fps,
            population.size,
            population.fluid.viscosity,
            showDrag,
            population.organisms[0]?.cpg.frequency ?? Config.FREQUENCY_DEFAULT
        );
    }

    /**
     * Handle canvas resize.
     * @param {number} w
     * @param {number} h
     */
    resize(w, h) {
        this.w = w;
        this.h = h;
        this._effects.resize(w, h);
    }
}

export default CanvasRenderer;
