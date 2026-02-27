/**
 * UI Manager Module
 * 
 * Orchestrates all user interactions:
 * - Event listeners for buttons and sliders.
 * - Updates global state based on inputs.
 * - Updates UI elements when state changes (e.g. from other sources).
 */

import { state } from './state.js';

export class UIManager {
    constructor() {
        this.controls = {
            btnWebcam: document.getElementById('btnWebcam'),
            btnUpload: document.getElementById('btnUpload'),
            fileInput: document.getElementById('fileInput'),
            contrastRange: document.getElementById('contrastRange'),
            thresholdRange: document.getElementById('thresholdRange'),
            ditherToggle: document.getElementById('ditherToggle'),
            valContrast: document.getElementById('valContrast'),
            valThreshold: document.getElementById('valThreshold'),
            btnSave: document.getElementById('btnSave'),
            systemLogs: document.getElementById('systemLogs')
        };

        // Callbacks to be assigned by Main
        this.onModeChange = null;
        this.onSave = null;

        this.init();
    }

    init() {
        this.bindEvents();

        // Subscribe to state changes to update UI if needed
        state.subscribe((newState) => {
            this.updateUI(newState);
        });

        this.log("UI SUBSYSTEM ONLINE");
    }

    bindEvents() {
        // Mode Switching
        this.controls.btnWebcam.addEventListener('click', () => {
            if (this.onModeChange) this.onModeChange('webcam');
        });

        this.controls.btnUpload.addEventListener('click', () => {
            // Trigger hidden file input
            this.controls.fileInput.click();
        });

        this.controls.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                if (this.onModeChange) this.onModeChange('upload', e.target.files[0]);
            }
        });

        // Sliders (Continuous update for smooth feel)
        this.controls.contrastRange.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            state.updateSettings({ contrast: val });
            this.controls.valContrast.textContent = val.toFixed(1);
        });

        this.controls.thresholdRange.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            state.updateSettings({ threshold: val });
            this.controls.valThreshold.textContent = val;
        });

        // Toggle
        this.controls.ditherToggle.addEventListener('change', (e) => {
            state.updateSettings({ ditherEnabled: e.target.checked });
            this.log(`DITHERING: ${e.target.checked ? 'ENABLED' : 'DISABLED'}`);
        });

        // Algorithm Selector
        const algoSelect = document.getElementById('algorithmSelect');
        if (algoSelect) {
            this.controls.algorithmSelect = algoSelect; // Cache it
            algoSelect.addEventListener('change', (e) => {
                state.updateSettings({ algorithm: e.target.value });
                this.log(`ALGORITHM SET: ${e.target.value.toUpperCase()}`);
            });
        }

        // CRT Sliders
        const scanlineRange = document.getElementById('scanlineRange');
        const valScanline = document.getElementById('valScanline');
        if (scanlineRange) {
            this.controls.scanlineRange = scanlineRange;
            this.controls.valScanline = valScanline;
            scanlineRange.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                state.updateSettings({ scanlineIntensity: val });
                valScanline.textContent = val.toFixed(2);
            });
        }

        const noiseRange = document.getElementById('noiseRange');
        const valNoise = document.getElementById('valNoise');
        if (noiseRange) {
            this.controls.noiseRange = noiseRange;
            this.controls.valNoise = valNoise;
            noiseRange.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                state.updateSettings({ noiseIntensity: val });
                valNoise.textContent = val.toFixed(2);
            });
        }

        // Save
        this.controls.btnSave.addEventListener('click', () => {
            if (this.onSave) this.onSave();
        });
    }

    /**
     * Updates UI elements based on state.
     * Prevents loops by checking current values before setting?
     * Actually, strictly mapping State -> UI is safer.
     * But for sliders, if user is dragging, allow it.
     */
    updateUI(currentState) {
        // Update active button classes
        if (currentState.mode === 'webcam') {
            this.controls.btnWebcam.classList.add('active');
            this.controls.btnUpload.classList.remove('active');
        } else {
            this.controls.btnWebcam.classList.remove('active');
            this.controls.btnUpload.classList.add('active');
        }

        // Sync slider values (only if not currently focused might be better, 
        // but for now simple sync)
        // Check if document.activeElement is one of the inputs to avoid fighting the user
        if (document.activeElement !== this.controls.contrastRange) {
            this.controls.contrastRange.value = currentState.settings.contrast;
            this.controls.valContrast.textContent = currentState.settings.contrast.toFixed(1);
        }

        if (document.activeElement !== this.controls.thresholdRange) {
            this.controls.thresholdRange.value = currentState.settings.threshold;
            this.controls.valThreshold.textContent = currentState.settings.threshold;
        }

        if (this.controls.algorithmSelect) {
            this.controls.algorithmSelect.value = currentState.settings.algorithm;
        }

        if (this.controls.scanlineRange && document.activeElement !== this.controls.scanlineRange) {
            this.controls.scanlineRange.value = currentState.settings.scanlineIntensity;
            this.controls.valScanline.textContent = currentState.settings.scanlineIntensity.toFixed(2);
        }

        if (this.controls.noiseRange && document.activeElement !== this.controls.noiseRange) {
            this.controls.noiseRange.value = currentState.settings.noiseIntensity;
            this.controls.valNoise.textContent = currentState.settings.noiseIntensity.toFixed(2);
        }

        this.controls.ditherToggle.checked = currentState.settings.ditherEnabled;
    }

    /**
     * Appends a message to the system log.
     * @param {string} msg 
     */
    log(msg) {
        const p = document.createElement('p');
        p.textContent = `> ${msg.toUpperCase()}`;
        this.controls.systemLogs.appendChild(p);
        this.controls.systemLogs.scrollTop = this.controls.systemLogs.scrollHeight;
    }
}
