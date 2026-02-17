/**
 * UI Manager
 * Handles DOM events, updates application state
 */
import { Utils } from './utils.js';

export class UIManager {
    constructor(app) {
        this.app = app;
        this.elements = {
            brushSize: document.getElementById('brush-size'),
            brushSizeVal: document.getElementById('brush-size-val'),
            brushIntensity: document.getElementById('brush-intensity'),
            brushIntensityVal: document.getElementById('brush-intensity-val'),

            btnBrush: document.getElementById('btn-brush'),
            btnEraser: document.getElementById('btn-eraser'),
            btnHarmonic: document.getElementById('btn-harmonic'), // New Feature
            btnNoise: document.getElementById('btn-noise'),       // New Feature
            btnClear: document.getElementById('btn-clear'),

            duration: document.getElementById('audio-duration'),
            durationVal: document.getElementById('audio-duration-val'),
            freqMin: document.getElementById('freq-min'),
            freqMax: document.getElementById('freq-max'),
            logScale: document.getElementById('log-scale'),

            btnPlay: document.getElementById('btn-play'),
            btnStop: document.getElementById('btn-stop'),
            btnExport: document.getElementById('btn-export'),

            playbackSpeed: document.getElementById('playback-speed'), // New Feature
            toggleGrid: document.getElementById('toggle-grid'),       // New Feature

            canvas: document.getElementById('drawing-canvas'),
            scanLine: document.getElementById('scan-line'),
            gridOverlay: document.querySelector('.grid-overlay'),
            status: document.getElementById('status-display')
        };

        this.initListeners();
    }

    initListeners() {
        // Brush Size
        this.elements.brushSize.addEventListener('input', (e) => {
            const val = e.target.value;
            this.elements.brushSizeVal.textContent = `${val}px`;
            this.app.drawing.setBrushSize(val);
        });

        // Brush Intensity
        this.elements.brushIntensity.addEventListener('input', (e) => {
            const val = e.target.value;
            this.elements.brushIntensityVal.textContent = `${val}%`;
            this.app.drawing.setBrushIntensity(val);
        });

        // Tools
        this.elements.btnBrush.addEventListener('click', () => this.setTool('brush'));
        this.elements.btnEraser.addEventListener('click', () => this.setTool('eraser'));
        if (this.elements.btnHarmonic) this.elements.btnHarmonic.addEventListener('click', () => this.setTool('harmonic'));
        if (this.elements.btnNoise) this.elements.btnNoise.addEventListener('click', () => this.setTool('noise'));

        this.elements.btnClear.addEventListener('click', () => {
            this.app.drawing.clear();
            this.showStatus('CANVAS CLEARED');
        });

        // Audio Settings
        this.elements.duration.addEventListener('input', (e) => {
            const val = e.target.value;
            this.elements.durationVal.textContent = `${val}s`;
            this.app.synthesis.updateSettings({ duration: parseFloat(val) });
        });

        this.elements.freqMin.addEventListener('change', (e) => this.updateAudioSettings());
        this.elements.freqMax.addEventListener('change', (e) => this.updateAudioSettings());
        this.elements.logScale.addEventListener('change', (e) => this.updateAudioSettings());

        // Playback
        this.elements.btnPlay.addEventListener('click', () => this.app.play());
        this.elements.btnStop.addEventListener('click', () => this.app.stop());

        // Export
        this.elements.btnExport.addEventListener('click', () => this.app.exportWav());

        // Feature: Playback Speed
        if (this.elements.playbackSpeed) {
            this.elements.playbackSpeed.addEventListener('input', (e) => {
                const rate = parseFloat(e.target.value);
                this.app.setPlaybackRate(rate);
                this.showStatus(`RATE: ${rate.toFixed(1)}x`);
            });
        }

        // Feature: Grid Toggle
        if (this.elements.toggleGrid) {
            this.elements.toggleGrid.addEventListener('change', (e) => {
                this.elements.gridOverlay.style.opacity = e.target.checked ? '1' : '0.1';
            });
        }
    }

    setTool(tool) {
        // Remove active class
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));

        // Add active class
        if (tool === 'brush') this.elements.btnBrush.classList.add('active');
        if (tool === 'eraser') this.elements.btnEraser.classList.add('active');
        if (tool === 'harmonic' && this.elements.btnHarmonic) this.elements.btnHarmonic.classList.add('active');
        if (tool === 'noise' && this.elements.btnNoise) this.elements.btnNoise.classList.add('active');

        this.app.drawing.setMode(tool);
        this.showStatus(`TOOL: ${tool.toUpperCase()}`);
    }

    updateAudioSettings() {
        this.app.synthesis.updateSettings({
            minFreq: parseFloat(this.elements.freqMin.value),
            maxFreq: parseFloat(this.elements.freqMax.value),
            logScale: this.elements.logScale.checked
        });
        this.showStatus('SETTINGS UPDATED');
    }

    togglePlayState(isPlaying) {
        this.elements.btnPlay.disabled = isPlaying;
        this.elements.btnStop.disabled = !isPlaying;

        if (isPlaying) {
            this.elements.scanLine.classList.add('active');
            this.showStatus('PLAYING...');
        } else {
            this.elements.scanLine.style.left = '0%';
            this.elements.scanLine.classList.remove('active');
            this.showStatus('READY');
        }
    }

    updateScanLine(progress) {
        this.elements.scanLine.style.left = `${progress * 100}%`;
    }

    showStatus(msg) {
        this.elements.status.textContent = msg;
        this.elements.status.style.opacity = '1';
        setTimeout(() => {
            this.elements.status.style.opacity = '0.7';
        }, 500);
    }
}
