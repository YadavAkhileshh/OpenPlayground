/**
 * controls.js — WaveTank Parameter Controls
 * Manages sliders, number readouts, and parameter state.
 * Exports a Controls object that other modules read from.
 */

export class Controls {
    constructor() {
        // Simulation parameters (mutable by UI)
        this.damping = 0.997;
        this.amplitude = 0.8;
        this.pulseRate = 30;    // frames between auto-pulses
        this.autoPulse = false;
        this.colorMap = 'ocean';
        this.showDepth = false;
        this.brushRadius = 3;     // cells
        this.depthValue = 50;    // 0=shallow when painting depth

        // Bind after DOM is ready
        this._bound = false;
    }

    /** Call once DOM is ready to wire up all slider/button controls. */
    bind() {
        if (this._bound) return;
        this._bound = true;

        this._bind('damping-slider', v => { this.damping = parseFloat(v); }, 'damping-val', v => parseFloat(v).toFixed(4));
        this._bind('amplitude-slider', v => { this.amplitude = parseFloat(v); }, 'amplitude-val', v => parseFloat(v).toFixed(2));
        this._bind('pulse-rate-slider', v => { this.pulseRate = parseInt(v); }, 'pulse-rate-val', v => `${v} fps⁻¹`);
        this._bind('brush-slider', v => { this.brushRadius = parseInt(v); }, 'brush-val', v => `${v}px`);
        this._bind('depth-value-slider', v => { this.depthValue = parseInt(v); }, 'depth-val-out', v => {
            const pct = Math.round((1 - v / 255) * 100);
            return `${pct}% shallow`;
        });

        // Color map select
        const cmSel = document.getElementById('colormap-select');
        if (cmSel) {
            cmSel.addEventListener('change', () => { this.colorMap = cmSel.value; });
            this.colorMap = cmSel.value;
        }

        // Auto-pulse toggle
        const apBtn = document.getElementById('auto-pulse-btn');
        if (apBtn) {
            apBtn.addEventListener('click', () => {
                this.autoPulse = !this.autoPulse;
                apBtn.classList.toggle('active', this.autoPulse);
                apBtn.textContent = this.autoPulse ? '⏹ Stop Pulse' : '▶ Auto Pulse';
            });
        }

        // Depth overlay toggle
        const doBtn = document.getElementById('depth-overlay-btn');
        if (doBtn) {
            doBtn.addEventListener('click', () => {
                this.showDepth = !this.showDepth;
                doBtn.classList.toggle('active', this.showDepth);
            });
        }
    }

    /**
     * Wire a range slider to a parameter and update a readout span.
     */
    _bind(sliderId, setter, readoutId, formatter) {
        const slider = document.getElementById(sliderId);
        const readout = document.getElementById(readoutId);
        if (!slider) return;
        const update = () => {
            setter(slider.value);
            if (readout && formatter) readout.textContent = formatter(slider.value);
        };
        slider.addEventListener('input', update);
        update(); // init
    }
}
