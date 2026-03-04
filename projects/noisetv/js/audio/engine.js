/**
 * AudioEngine.js
 * 
 * =============================================================================
 * NOISE-TV AUDIO SYNTHESIS SYSTEM
 * =============================================================================
 * 
 * This module manages the real-time audio pipeline using the Web Audio API.
 * It combines procedural noise generators with sharp bandpass filtering to 
 * simulate the experience of tuning into FM/AM radio frequencies.
 * 
 * SIGNAL CHAIN ARCHITECTURE:
 * [Noise Generators] ----> [Noise Selector] ----> [Bandpass Filter] ----> [Master Gain] ----> [Speakers]
 *                                                        ^
 * [Hidden Stations] -------------------------------------|
 * 
 * MODULATION:
 * Includes a subtle LFO that creates "frequency drift," simulating the analog 
 * instability found in vintage electronic hardware.
 * 
 * @module AudioEngine
 */

import { AudioModulation } from './modulation.js';
import { CONFIG } from './constants.js';

export class AudioEngine {
    /**
     * Initializes the state of the audio engine but does not create 
     * a context yet to comply with browser autoplay policies.
     */
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.filter = null;

        // Storage for pre-synthesized noise nodes.
        this.noiseNodes = {
            white: null,
            pink: null,
            brownian: null
        };

        this.currentNoiseType = 'white';
        this.noiseGain = null;

        // Active oscillator instances for stations.
        this.stationSources = [];
        this.isInitialized = false;

        // Modulation handles.
        this.drift = null;
    }

    /**
     * Bootstraps the Web Audio infrastructure.
     * Must be invoked during a user interaction (e.g., button click).
     */
    async init() {
        if (this.isInitialized) return;

        try {
            console.log("AUDIO: Initializing Signal Chain...");
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();

            // 1. PRIMARY OUTPUT STAGE
            // The master gain controls global volume and provides a clean fade for power transitions.
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0;
            this.masterGain.connect(this.ctx.destination);

            // 2. SIGNAL MODIFICATION STAGE
            // The biquad filter is the "tuner." It accepts all noise but only lets 
            // through a narrow band defined by the current frequency setting.
            this.filter = this.ctx.createBiquadFilter();
            this.filter.type = 'bandpass';
            this.filter.Q.value = CONFIG.AUDIO.FILTER_Q_MIN;
            this.filter.connect(this.masterGain);

            // 3. GENERATION STAGE: NOISE
            this.setupNoiseSources();

            // 4. GENERATION STAGE: STATIONS
            this.setupStations();

            // 5. MODULATION STAGE
            // Applies a slow oscillation to the filter frequency to simulate hardware drift.
            this.drift = AudioModulation.setupDrift(
                this.ctx,
                this.filter.frequency,
                CONFIG.AUDIO.LFO_DRIFT_AMP / 1000 // Normalize intensity
            );

            this.isInitialized = true;
            console.log("AUDIO: Engine Ready.");
        } catch (error) {
            console.error("AUDIO: Failed to initialize Web Audio context.", error);
        }
    }

    /**
     * Synthesizes and buffers noise sources to enable instantaneous switching.
     */
    setupNoiseSources() {
        this.noiseGain = this.ctx.createGain();
        this.noiseGain.gain.value = CONFIG.AUDIO.NOISE_GAIN_BASE;
        this.noiseGain.connect(this.filter);

        /**
         * Local Helper to create a looping buffer source.
         */
        const createLoopingSource = (buffer) => {
            const src = this.ctx.createBufferSource();
            src.buffer = buffer;
            src.loop = true;
            src.start();
            return src;
        };

        // Synthesize White Noise locally for minimal startup latency.
        const whiteBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 2, this.ctx.sampleRate);
        const whiteData = whiteBuffer.getChannelData(0);
        for (let i = 0; i < whiteData.length; i++) {
            whiteData[i] = Math.random() * 2 - 1;
        }

        // Cache sources for later connection/disconnection.
        this.noiseNodes.white = createLoopingSource(whiteBuffer);
        this.noiseNodes.pink = createLoopingSource(AudioModulation.createPinkNoise(this.ctx));
        this.noiseNodes.brownian = createLoopingSource(AudioModulation.createBrownianNoise(this.ctx));

        // Default entry point: White Noise.
        this.noiseNodes.white.connect(this.noiseGain);
    }

    /**
     * Initializes the oscillator bank for hidden signals.
     */
    setupStations() {
        const stationConfigs = [
            { freq: 89.5, wave: 'sine', tone: 440 },
            { freq: 94.2, wave: 'square', tone: 220 },
            { freq: 101.7, wave: 'sawtooth', tone: 110 },
            { freq: 105.5, wave: 'triangle', tone: 880 }
        ];

        stationConfigs.forEach(cfg => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = cfg.wave;
            osc.frequency.value = cfg.tone;
            gain.gain.value = 0; // Starts silent

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start();

            this.stationSources.push({ freq: cfg.freq, gain, osc });
        });
    }

    /**
     * Switches the active noise generator.
     * Uses connection techniques rather than re-creating nodes for performance.
     * 
     * @param {string} type - 'white', 'pink', or 'brownian'
     */
    setNoiseType(type) {
        if (!this.isInitialized || !this.noiseNodes[type]) return;

        // Sever current noise connections to prevent overlap.
        Object.values(this.noiseNodes).forEach(node => {
            try { node.disconnect(this.noiseGain); } catch (e) { /* already disconnected */ }
        });

        // Establish the new path.
        this.noiseNodes[type].connect(this.noiseGain);
        this.currentNoiseType = type;
        console.log(`AUDIO: Noise changed to ${type}`);
    }

    /**
     * Updates the processing chain parameters based on the current tuning.
     * Called during every frame of the main application loop.
     * 
     * @param {number} tuningFreq - Current MHz value
     * @returns {number} The current peak signal strength (0.0 - 1.0)
     */
    update(tuningFreq) {
        if (!this.isInitialized) return 0;

        // Mapping Logic: MHz -> Hertz
        // We calculate the center frequency of the bandpass filter relative to the tuning.
        const audioFreq = CONFIG.FREQ.AUDIO_RANGE_MIN +
            ((tuningFreq - CONFIG.FREQ.MIN) / (CONFIG.FREQ.MAX - CONFIG.FREQ.MIN)) *
            (CONFIG.FREQ.AUDIO_RANGE_MAX - CONFIG.FREQ.AUDIO_RANGE_MIN);

        this.filter.frequency.setTargetAtTime(audioFreq, this.ctx.currentTime, CONFIG.AUDIO.TWEEN_DURATION);

        let peakProximity = 0;

        // SIGNAL MIXING LOOP
        // We iterate through all simulated stations and calculate their audible volume.
        this.stationSources.forEach(source => {
            const distance = Math.abs(tuningFreq - source.freq);
            const proximity = Math.max(0, 1 - (distance / CONFIG.FREQ.DETECTION_RADIUS));

            // DYNAMIC Q-ADJUSTMENT
            // As we approach a station, we narrow the filter (higher Q) to isolate the signal.
            if (proximity > 0) {
                const targetQ = CONFIG.AUDIO.FILTER_Q_MIN + (proximity * (CONFIG.AUDIO.FILTER_Q_MAX - CONFIG.AUDIO.FILTER_Q_MIN));
                this.filter.Q.setTargetAtTime(targetQ, this.ctx.currentTime, 0.1);
            }

            // VOLUME MIXING
            // We use a power curve for more "tactile" signal detection.
            const targetVolume = Math.pow(proximity, 4) * CONFIG.AUDIO.STATION_GAIN_MAX;
            source.gain.gain.setTargetAtTime(targetVolume, this.ctx.currentTime, 0.1);

            if (proximity > peakProximity) peakProximity = proximity;
        });

        return peakProximity;
    }

    /**
     * Smoothly transitions the master gain stage for power toggling.
     * 
     * @param {boolean} isOn - Whether to enable or disable audio output
     */
    setPower(isOn) {
        if (!this.isInitialized) return;

        const targetValue = isOn ? CONFIG.AUDIO.MASTER_GAIN_MAX : 0;
        this.masterGain.gain.setTargetAtTime(targetValue, this.ctx.currentTime, 0.4);
    }
}
