/**
 * @file UIController.js
 * @description Enhanced UI Controller with full configuration support and collapsible panels.
 */

import { Snapshot } from '../utils/Snapshot.js';

export class UIController {
    constructor(app) {
        this.app = app; // Reference to main app
        this.bus = app.bus;
        this.config = app.config;

        this.elements = {
            fps: document.getElementById('fps-counter'),
            cam: document.getElementById('cam-status'),
            panel: document.querySelector('.controls-panel'),
            toggleBtn: null // Created dynamically
        };

        this.frameCount = 0;
        this.lastFpsTime = 0;

        this.init();
    }

    init() {
        this.createControls();
        this.setupKeyboard();

        // Listen for config changes from other sources to update UI
        this.bus.on('config:changed', (newState) => this.syncUI(newState));
    }

    createControls() {
        this.elements.panel.innerHTML = '';

        const header = document.createElement('h2');
        header.textContent = 'SYSTEM CONFIG';
        this.elements.panel.appendChild(header);

        // -- IMAGE ADJUSTMENTS --
        this.addSection('IMAGE', [
            { id: 'ascii.brightness', label: 'Bright', type: 'range', min: 0, max: 2, step: 0.1 },
            { id: 'ascii.contrast', label: 'Contrast', type: 'range', min: 0, max: 2, step: 0.1 },
            { id: 'ascii.invert', label: 'Invert', type: 'checkbox' },
        ]);

        // -- RENDERING --
        this.addSection('RENDER', [
            { id: 'ascii.density', label: 'Density', type: 'range', min: 6, max: 32, step: 2 },
            { id: 'render.colorMode', label: 'Color', type: 'select', options: ['matrix', 'truecolor', 'heatmap'] },
            { id: 'ascii.charSet', label: 'Charset', type: 'select', options: ['standard', 'matrix', 'blocks', 'custom', 'katakana'] },
        ]);

        // -- EFFECTS --
        this.addSection('EFFECTS', [
            { id: 'render.scanlines', label: 'Scanlines', type: 'checkbox' },
            { id: 'effects.digitalRain', label: 'Rain', type: 'checkbox' },
            { id: 'render.phosphorFade', label: 'Fade', type: 'range', min: 0.05, max: 0.9, step: 0.05 },
        ]);

        // -- ACTIONS --
        this.addActionButtons();
    }

    addSection(title, controls) {
        const fieldset = document.createElement('fieldset');
        const legend = document.createElement('legend');
        legend.textContent = title;
        fieldset.appendChild(legend);

        controls.forEach(def => {
            const wrapper = document.createElement('div');
            wrapper.className = 'control-group';

            const label = document.createElement('label');
            label.textContent = def.label;

            let input;

            if (def.type === 'select') {
                input = document.createElement('select');
                def.options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt;
                    option.textContent = opt.toUpperCase();
                    input.appendChild(option);
                });
            } else {
                input = document.createElement('input');
                input.type = def.type;
                if (def.type === 'range') {
                    input.min = def.min;
                    input.max = def.max;
                    input.step = def.step;
                }
            }

            // Set initial value from config
            const currentVal = this.config.get(def.id);
            if (def.type === 'checkbox') input.checked = currentVal;
            else input.value = currentVal;

            // Event Listener
            input.addEventListener('change', (e) => {
                const val = def.type === 'checkbox' ? e.target.checked :
                    def.type === 'range' ? parseFloat(e.target.value) : e.target.value;

                // Construct update object (e.g. { ascii: { brightness: 1.2 } })
                const parts = def.id.split('.');
                const update = {};
                if (parts.length === 2) {
                    update[parts[0]] = {};
                    update[parts[0]][parts[1]] = val;
                } else {
                    update[def.id] = val;
                }

                this.config.update(update);
            });

            wrapper.appendChild(label);
            wrapper.appendChild(input);
            fieldset.appendChild(wrapper);
        });

        this.elements.panel.appendChild(fieldset);
    }

    addActionButtons() {
        const container = document.createElement('div');
        container.className = 'action-buttons';

        const snapBtn = document.createElement('button');
        snapBtn.textContent = 'SNAPSHOT';
        snapBtn.onclick = () => {
            Snapshot.capture(document.getElementById('ascii-canvas'));
        };

        const resetBtn = document.createElement('button');
        resetBtn.textContent = 'RESET';
        resetBtn.onclick = () => {
            this.config.reset();
        };

        container.appendChild(snapBtn);
        container.appendChild(resetBtn);
        this.elements.panel.appendChild(container);
    }

    syncUI(state) {
        // TODO: Update inputs if config changed externally
        // For now, inputs update state, so loop is closed.
    }

    setupKeyboard() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'h' || e.key === 'H') {
                this.elements.panel.classList.toggle('hidden');
            }
            if (e.key === 's' || e.key === 'S') {
                Snapshot.capture(document.getElementById('ascii-canvas'));
            }
        });
    }

    updateStats(delta) {
        this.frameCount++;
        const now = performance.now();
        if (now - this.lastFpsTime >= 1000) {
            const fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsTime));
            this.elements.fps.textContent = fps;
            this.frameCount = 0;
            this.lastFpsTime = now;

            // Cam status check
            if (this.app.videoSource && this.app.videoSource.isReady) {
                this.elements.cam.textContent = 'ONLINE';
                this.elements.cam.style.color = '#0f0';
            } else {
                this.elements.cam.textContent = 'OFFLINE';
                this.elements.cam.style.color = '#f00';
            }
        }
    }
}
