// NematodeSim — Control Panel
// Manages all UI control elements: frequency slider, viscosity slider,
// drag toggle button, and organism count display updates.
// Bridges DOM events → SimulationEngine parameter updates.

import Config from '../sim/Config.js';

export class ControlPanel {
    /**
     * @param {SimulationEngine} engine  The simulation to control
     */
    constructor(engine) {
        this.engine = engine;
        this._bound = {};   // Bound event handlers for cleanup
        this._init();
    }

    /** Wire up all DOM controls. */
    _init() {
        // ── Frequency slider ──────────────────────────────────────────────
        this._wire('freq-slider', 'input', (e) => {
            const hz = parseFloat(e.target.value);
            this._updateLabel('freq-label', `${hz.toFixed(2)} Hz`);
            this.engine.setFrequency(hz);
        });
        this._setSlider('freq-slider', Config.FREQUENCY_DEFAULT, Config.FREQUENCY_MIN, Config.FREQUENCY_MAX);
        this._updateLabel('freq-label', `${Config.FREQUENCY_DEFAULT.toFixed(2)} Hz`);

        // ── Viscosity slider ──────────────────────────────────────────────
        this._wire('visc-slider', 'input', (e) => {
            const v = parseFloat(e.target.value);
            this._updateLabel('visc-label', `${(v * 100).toFixed(0)}%`);
            this.engine.setViscosity(v);
        });
        this._setSlider('visc-slider', Config.VISCOSITY_DEFAULT, Config.VISCOSITY_MIN, Config.VISCOSITY_MAX, '0.01');
        this._updateLabel('visc-label', `${(Config.VISCOSITY_DEFAULT * 100).toFixed(0)}%`);

        // ── Drag toggle button ────────────────────────────────────────────
        const dragBtn = document.getElementById('drag-toggle');
        if (dragBtn) {
            this._bound.dragClick = () => {
                const active = this.engine.toggleDrag();
                dragBtn.classList.toggle('active', active);
                dragBtn.textContent = active ? 'DRAG: ON' : 'DRAG: OFF';
            };
            dragBtn.addEventListener('click', this._bound.dragClick);
        }

        // ── Pause/Resume button ───────────────────────────────────────────
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            let paused = false;
            this._bound.pauseClick = () => {
                paused = !paused;
                if (paused) { this.engine.pause(); pauseBtn.textContent = 'RESUME'; }
                else { this.engine.resume(); pauseBtn.textContent = 'PAUSE'; }
                pauseBtn.classList.toggle('active', paused);
            };
            pauseBtn.addEventListener('click', this._bound.pauseClick);
        }
    }

    /**
     * Wire a DOM element by ID to a handler.
     * @param {string}   id       Element ID
     * @param {string}   event    Event name
     * @param {function} handler  Event handler
     */
    _wire(id, event, handler) {
        const el = document.getElementById(id);
        if (!el) return;
        this._bound[id] = handler;
        el.addEventListener(event, handler);
    }

    /**
     * Configure a range input element.
     */
    _setSlider(id, value, min, max, step = '0.1') {
        const el = document.getElementById(id);
        if (!el) return;
        el.min = min;
        el.max = max;
        el.step = step;
        el.value = value;
    }

    /**
     * Update a label element's text.
     */
    _updateLabel(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    /** Remove all event listeners (cleanup). */
    destroy() {
        for (const [id, fn] of Object.entries(this._bound)) {
            const el = document.getElementById(id);
            if (el) el.removeEventListener('input', fn);
        }
    }
}

export default ControlPanel;
