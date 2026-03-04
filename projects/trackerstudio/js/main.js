/**
 * main.js
 * TrackerStudio v2.0 — Main bootstrapper.
 * Wires together: AudioEngine, Mixer, SampleLoader, Sequencer, TrackerUI, Visualizer.
 * Handles: Transport controls, BPM, DSP sliders, Master volume, RAF loop.
 */
import { AudioEngine } from './audio/audio_engine.js';
import { Mixer } from './audio/mixer.js';
import { SampleLoader } from './audio/voice.js';
import { Sequencer } from './sequencer/sequencer_engine.js';
import { TrackerUI } from './ui/tracker_ui.js';
import { Visualizer } from './ui/visualizer.js';

class TrackerStudio {
    constructor() {
        // Core audio subsystem
        this.audio = new AudioEngine();
        this.loader = new SampleLoader(this.audio.ctx);
        this.mixer = new Mixer(this.audio);
        this.seq = new Sequencer(this.audio, this.mixer, this.loader);

        // UI subsystems
        this.ui = new TrackerUI(this.seq, this.mixer);
        this.vis = new Visualizer(this.audio.analyser, this.audio.spectrumAnalyser);

        this._isPlaying = false;

        this._init();
    }

    async _init() {
        // Generate all 5 chip-synth instrument buffers
        this.loader.generateAllInstruments();

        // Initialize UI (renders grid, binds events)
        this.ui.init();

        // Bind transport controls
        this._bindTransport();

        // Bind DSP effect sliders
        this._bindDSP();

        // Bind master volume
        this._bindMasterVolume();

        // Start the render loop
        this._loop();

        console.log('[TrackerStudio] Ready.');
    }

    _bindTransport() {
        const playBtn = document.getElementById('btn-play');
        const stopBtn = document.getElementById('btn-stop');
        const bpmInput = document.getElementById('bpm-input');

        playBtn.addEventListener('click', async () => {
            await this.audio.init(); // Resume AudioContext on user gesture
            if (!this._isPlaying) {
                this._isPlaying = true;
                this.seq.start();
                playBtn.classList.add('active');
                stopBtn.classList.remove('active');
            }
        });

        stopBtn.addEventListener('click', () => {
            if (this._isPlaying) {
                this._isPlaying = false;
                this.seq.stop();
                stopBtn.classList.add('active');
                playBtn.classList.remove('active');
                // Reset playing row highlight
                const rows = document.querySelectorAll('.tracker-row.playing');
                rows.forEach(r => r.classList.remove('playing'));
                document.getElementById('step-counter').textContent = 'STEP: 00';
            }
        });

        bpmInput.addEventListener('change', (e) => {
            const bpm = parseInt(e.target.value);
            if (!isNaN(bpm)) this.seq.setBpm(bpm);
        });

        // Space bar shortcut handled in TrackerUI._handleKey
    }

    _bindDSP() {
        const dsp = this.mixer.dsp;

        // Delay
        document.getElementById('delay-time').addEventListener('input', (e) => {
            dsp.setParams({ delayTime: parseFloat(e.target.value) });
        });
        document.getElementById('delay-feedback').addEventListener('input', (e) => {
            dsp.setParams({ delayFeedback: parseFloat(e.target.value) });
        });
        document.getElementById('delay-mix').addEventListener('input', (e) => {
            dsp.setParams({ delayMix: parseFloat(e.target.value) });
        });

        // Reverb
        document.getElementById('reverb-mix').addEventListener('input', (e) => {
            dsp.setParams({ reverbMix: parseFloat(e.target.value) });
        });
        document.getElementById('reverb-size').addEventListener('input', (e) => {
            dsp.setParams({ reverbSize: parseFloat(e.target.value) });
        });

        // Bitcrusher
        document.getElementById('crush-bits').addEventListener('input', (e) => {
            dsp.setParams({ bitDepth: parseInt(e.target.value) });
        });
        document.getElementById('crush-rate').addEventListener('input', (e) => {
            dsp.setParams({ sampleRateDiv: parseInt(e.target.value) });
        });
    }

    _bindMasterVolume() {
        document.getElementById('master-vol').addEventListener('input', (e) => {
            this.audio.setMasterVolume(parseFloat(e.target.value));
        });
    }

    _loop() {
        requestAnimationFrame(() => this._loop());

        // Draw oscilloscope + spectrum
        this.vis.draw();

        // Update VU meters
        this.ui.updateVuMeters();
    }
}

// Bootstrap on DOM ready
window.addEventListener('DOMContentLoaded', () => {
    window.trackerStudio = new TrackerStudio();
});
