/**
 * @file controls.js
 * @description Manages UI sliders, buttons, and stats display.
 */

export class UIControls {
    /**
     * @param {LBMSolver} solver 
     * @param {FlowRenderer} renderer 
     * @param {Function} toggleSimCallback 
     */
    constructor(solver, renderer, toggleSimCallback) {
        this.solver = solver;
        this.renderer = renderer;
        this.onToggle = toggleSimCallback;

        this.fpsEl = document.getElementById('fps-counter');
        this.spsEl = document.getElementById('sps-counter');
        this.gridEl = document.getElementById('grid-size');
        this.statusEl = document.getElementById('sim-status');
        this.debugEl = document.getElementById('debug-console');

        this.initControls();
        this.updateStats();
    }

    initControls() {
        // Viscosity
        const viscInput = document.getElementById('input-viscosity');
        const viscVal = document.getElementById('val-viscosity');
        viscInput.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            this.solver.setViscosity(val);
            viscVal.textContent = val.toFixed(3);
        });
        // Set initial
        this.solver.setViscosity(parseFloat(viscInput.value));

        // Speed
        const speedInput = document.getElementById('input-speed');
        const speedVal = document.getElementById('val-speed');
        speedInput.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            // Will be read by main loop
            window.SIM_SPEED = val;
            speedVal.textContent = val.toFixed(3);
        });
        window.SIM_SPEED = parseFloat(speedInput.value);

        // Colormap
        const cmapSelect = document.getElementById('select-colormap');
        cmapSelect.addEventListener('change', (e) => {
            this.renderer.setColormap(e.target.value);
        });

        // Contrast
        const contrastInput = document.getElementById('input-contrast');
        const contrastVal = document.getElementById('val-contrast');
        contrastInput.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            this.renderer.setContrast(val);
            contrastVal.textContent = val.toFixed(1);
        });

        // Buttons
        document.getElementById('btn-toggle').addEventListener('click', () => {
            const isRunning = this.onToggle();
            this.statusEl.textContent = isRunning ? "Running" : "Paused";
            this.statusEl.className = isRunning ? "value status-active" : "value";
            this.log(isRunning ? "Simulation Started" : "Simulation Paused");
        });

        document.getElementById('btn-reset').addEventListener('click', () => {
            this.solver.reset();
            this.log("Simulation Reset");
        });

        document.getElementById('btn-clear-obstacles').addEventListener('click', () => {
            this.solver.clearObstacles();
            this.log("Obstacles Cleared");
        });

        // Presets
        document.getElementById('btn-circle').addEventListener('click', () => {
            // Dispatch event or callback?
            // Accessing global presets or passing in?
            // Let's assume passed in or emitted.
            if (this.onPreset) this.onPreset('cylinder');
        });
        document.getElementById('btn-airfoil').addEventListener('click', () => {
            if (this.onPreset) this.onPreset('airfoil');
        });
        document.getElementById('btn-plate').addEventListener('click', () => {
            if (this.onPreset) this.onPreset('plate');
        });
        document.getElementById('btn-random').addEventListener('click', () => {
            if (this.onPreset) this.onPreset('random');
        });
    }

    bindPresetCallback(cb) {
        this.onPreset = cb;
    }

    updateStats() {
        this.gridEl.textContent = `${this.solver.width}x${this.solver.height}`;
    }

    updateSensors(drag, lift) {
        document.getElementById('val-drag').textContent = drag.toFixed(4);
        document.getElementById('val-lift').textContent = lift.toFixed(4);
    }

    updatePerf(fps, stepsPerFrame) {
        this.fpsEl.textContent = fps;
        this.spsEl.textContent = fps * stepsPerFrame;
    }

    log(msg, type = 'info') {
        const div = document.createElement('div');
        div.className = `debug-entry ${type}`;
        div.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
        this.debugEl.prepend(div);
    }
}
