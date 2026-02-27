/**
 * UI Controls handler.
 * 
 * This class acts as the bridge between the DOM (HTML) and the simulation logic.
 * It handles:
 * - Event listeners for sliders, buttons, and inputs.
 * - Updating the simulation parameters (feed, kill) in real-time.
 * - Managing the state of the application (playing, paused, recording).
 * - Coordination between different modules (Recorder, HelpSystem, etc.).
 * 
 * @module UI/Controls
 */

import { PRESETS } from './presets.js';
import { CONFIG } from '../simulation/config.js';
import { Serializer } from '../utils/serializer.js';

export class Controls {
    /**
     * @param {SimulationEngine} simulation - The core simulation.
     * @param {Renderer} renderer - The renderer.
     * @param {Brush} brush - The interaction tool.
     * @param {CanvasRecorder} recorder - Video recording utility.
     * @param {HelpSystem} helpSystem - The help overlay system.
     */
    constructor(simulation, renderer, brush, recorder, helpSystem) {
        this.simulation = simulation;
        this.renderer = renderer;
        this.brush = brush;
        this.recorder = recorder;
        this.helpSystem = helpSystem;

        this.isPaused = false;

        this.initElements();
        this.bindEvents();
    }

    /**
     * caches DOM elements for quick access.
     */
    initElements() {
        this.els = {
            feedSlider: document.getElementById('feed-slider'),
            feedVal: document.getElementById('feed-val'),
            killSlider: document.getElementById('kill-slider'),
            killVal: document.getElementById('kill-val'),

            btnPause: document.getElementById('btn-pause'),
            btnClear: document.getElementById('btn-clear'),
            btnRandom: document.getElementById('btn-random'),

            btnSave: document.getElementById('btn-save'),
            btnLoad: document.getElementById('btn-load'),
            btnScreenshot: document.getElementById('btn-screenshot'),
            btnRecord: document.getElementById('btn-record'),
            btnHelp: document.getElementById('btn-help'),

            fileInput: document.getElementById('file-input'),

            brushSize: document.getElementById('brush-size'),
            presetSelect: document.getElementById('preset-select'),
            paletteSelect: document.getElementById('palette-select'),
            fpsCounter: document.getElementById('fps-counter')
        };
    }

    /**
     * Binds all event listeners to the DOM elements.
     */
    bindEvents() {
        const { els } = this;

        // --- Reaction Parameters ---

        // Feed Rate Slider
        els.feedSlider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            this.simulation.f = val;
            els.feedVal.textContent = val.toFixed(4);
        });

        // Kill Rate Slider
        els.killSlider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            this.simulation.k = val;
            els.killVal.textContent = val.toFixed(4);
        });

        // --- Simulation Control ---

        // Pause/Resume Toggle
        els.btnPause.addEventListener('click', () => {
            this.isPaused = !this.isPaused;
            els.btnPause.textContent = this.isPaused ? "Resume" : "Pause";
            // Visual feedback for pause state
            els.btnPause.style.borderColor = this.isPaused ? "#ff4444" : "var(--accent-color)";
        });

        // Clear Grid (Reset to A=1, B=0)
        els.btnClear.addEventListener('click', () => {
            this.simulation.clear();
        });

        // Randomize Grid (Add noise)
        els.btnRandom.addEventListener('click', () => {
            this.simulation.randomize();
        });

        // --- State Management ---

        // Save State to JSON
        if (els.btnSave) els.btnSave.addEventListener('click', () => {
            try {
                Serializer.downloadState(this.simulation);
            } catch (err) {
                console.error("Save failed:", err);
                alert("Failed to save state.");
            }
        });

        // Load State from JSON
        if (els.btnLoad) els.btnLoad.addEventListener('click', () => {
            els.fileInput.click();
        });

        // Handle File Selection for Load
        if (els.fileInput) els.fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (ev) => {
                const success = Serializer.importState(this.simulation, ev.target.result);
                if (success) {
                    console.log("State loaded successfully.");
                    // Sync UI sliders with new state
                    els.feedSlider.value = this.simulation.f;
                    els.feedVal.textContent = this.simulation.f.toFixed(4);
                    els.killSlider.value = this.simulation.k;
                    els.killVal.textContent = this.simulation.k.toFixed(4);
                } else {
                    alert("Failed to load state file.");
                }
            };
            reader.readAsText(file);
            // Reset input so same file can be selected again
            e.target.value = '';
        });

        // --- Recording & Capture ---

        // Screenshot
        if (els.btnScreenshot) els.btnScreenshot.addEventListener('click', () => {
            this.recorder.screenshot();
        });

        // Video Recording Toggle
        if (els.btnRecord) els.btnRecord.addEventListener('click', () => {
            if (this.recorder.isRecording) {
                this.recorder.stop();
                // Reset UI
                els.btnRecord.textContent = "🎥";
                els.btnRecord.style.background = "transparent";
                els.btnRecord.style.color = "var(--accent-color)";
                els.btnRecord.title = "Record Video";
            } else {
                this.recorder.start();
                // Visual feedback for recording
                els.btnRecord.textContent = "⏹";
                els.btnRecord.style.background = "#ff4444";
                els.btnRecord.style.color = "white";
                els.btnRecord.title = "Stop Recording";
            }
        });

        // --- Help ---
        if (els.btnHelp) els.btnHelp.addEventListener('click', () => {
            this.helpSystem.toggle();
        });

        // --- Interaction ---

        // Brush Size
        els.brushSize.addEventListener('input', (e) => {
            this.brush.setRadius(parseInt(e.target.value));
        });

        // --- Presets & Visuals ---

        // Preset Selection
        els.presetSelect.addEventListener('change', (e) => {
            const key = e.target.value;
            if (PRESETS[key]) {
                const p = PRESETS[key];

                // Update Simulation Parameters
                this.simulation.setParameters(p.f, p.k);

                // Sync UI
                els.feedSlider.value = p.f;
                els.feedVal.textContent = p.f.toFixed(4);
                els.killSlider.value = p.k;
                els.killVal.textContent = p.k.toFixed(4);
            }
        });

        // Color Palette Selection
        els.paletteSelect.addEventListener('change', (e) => {
            this.renderer.setPalette(e.target.value);
        });
    }

    /**
     * Updates the FPS counter.
     * @param {number} fps - Current frames per second.
     */
    updateStats(fps) {
        this.els.fpsCounter.textContent = `FPS: ${fps}`;
        // Color coding for performance health
        if (fps < 30) this.els.fpsCounter.style.color = 'red';
        else if (fps < 50) this.els.fpsCounter.style.color = 'yellow';
        else this.els.fpsCounter.style.color = 'lime';
    }
}
