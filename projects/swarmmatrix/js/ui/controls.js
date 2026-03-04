/**
 * js/ui/controls.js
 * Binds HTML inputs to application state.
 */

import { state } from '../core/state.js';
import { CONFIG } from '../core/config.js';

export class Controls {
    constructor(simulation) {
        this.sim = simulation;
        this.bindSliders();
        this.bindToggles();
        this.bindButtons();
    }

    bindSliders() {
        const bindSlider = (id, stateKey, valId, multiplier = 1, fixed = 2) => {
            const slider = document.getElementById(id);
            const valDisplay = document.getElementById(valId);

            if (!slider) return;

            // Set initial state
            slider.value = state.get(stateKey) / multiplier;
            valDisplay.textContent = (state.get(stateKey)).toFixed(fixed);

            slider.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value) * multiplier;
                state.set(stateKey, val);
                valDisplay.textContent = val.toFixed(fixed);
            });
        };

        // Environment
        bindSlider('evaporate-slider', 'evaporationRate', 'evaporate-val', 0.001, 3);
        bindSlider('agent-speed-slider', 'agentSpeedLimit', 'agent-speed-val', 1, 1);
        bindSlider('noise-field-slider', 'noiseFieldIntensity', 'noise-field-val', 0.01, 1); // Note: noise not fully implemented yet in physics

        // Weights
        bindSlider('align-weight', 'weightAlignment', 'align-val', 0.1, 1);
        bindSlider('cohesion-weight', 'weightCohesion', 'cohesion-val', 0.1, 1);
        bindSlider('separation-weight', 'weightSeparation', 'separation-val', 0.1, 1);
        bindSlider('gradient-weight', 'weightGradient', 'gradient-val', 0.1, 1);
    }

    bindToggles() {
        const bindToggle = (id, stateKey) => {
            const toggle = document.getElementById(id);
            if (!toggle) return;

            toggle.checked = state.get(stateKey);

            toggle.addEventListener('change', (e) => {
                state.set(stateKey, e.target.checked);
            });
        };

        bindToggle('debug-vectors', 'debugVectors');
        bindToggle('debug-heatmap', 'debugHeatmap');
        bindToggle('debug-spatial', 'debugSpatial');
    }

    bindButtons() {
        // Reset
        document.getElementById('btn-reset')?.addEventListener('click', () => {
            this.sim.reset();
        });

        // Play / Pause
        const playBtn = document.getElementById('btn-play-pause');
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                const isPaused = state.get('isPaused');
                if (isPaused) {
                    window.app.loop.resume();
                    playBtn.innerHTML = '⏸️';
                    playBtn.classList.remove('paused');
                } else {
                    window.app.loop.pause();
                    playBtn.innerHTML = '▶️';
                    playBtn.classList.add('paused');
                }
            });
        }

        // Step
        document.getElementById('btn-step')?.addEventListener('click', () => {
            if (state.get('isPaused')) {
                window.app.loop.step();
            }
        });

        // Clear Pheromones
        document.getElementById('btn-clear-pheromones')?.addEventListener('click', () => {
            this.sim.pheromoneGrid.clear();
        });
    }
}
