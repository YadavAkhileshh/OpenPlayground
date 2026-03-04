import { CONFIG } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

/**
 * @fileoverview Audio system for Newton's Cradle.
 * Uses the Web Audio API to synthesize realistic metallic "clack" sounds.
 * 
 * Physical Accuracy Note:
 * When two steel balls collide, they produce a sharp impulse response
 * characterized by high-frequency transients and a very short decay.
 * We simulate this using a combination of a white noise burst and 
 * a decaying sine wave oscillator (modal synthesis light).
 */
export class AudioSystem {
    /**
     * Create the audio engine.
     * AudioContext is initialized on user interaction to comply with browser policies.
     */
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.lowPass = null;

        // Configuration for the "clack" sound
        this.clackParams = {
            frequency: 800,      // Main resonance
            noiseMix: 0.15,      // Amount of noise for the 'crunch'
            decay: 0.05,        // Time in seconds for the sound to fade
            filterFreq: 3000     // Lowpass to mellow out the noise
        };

        this.initialized = false;
    }

    /**
     * Initialize the AudioContext. Must be called after a user gesture.
     */
    init() {
        if (this.initialized) return;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();

            // Master volume control
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.5;
            this.masterGain.connect(this.ctx.destination);

            // Filter to control the harshness of the transients
            this.lowPass = this.ctx.createBiquadFilter();
            this.lowPass.type = 'lowpass';
            this.lowPass.frequency.value = this.clackParams.filterFreq;
            this.lowPass.connect(this.masterGain);

            this.initialized = true;
            logger.info("Audio system initialized successfully.");
        } catch (e) {
            logger.error("Failed to initialize Web Audio API", e);
        }
    }

    /**
     * Play a collision clack sound.
     * 
     * @param {number} intensity - The velocity of the collision (affects volume/pitch).
     */
    playClack(intensity) {
        if (!this.initialized) this.init(); // Auto-init on first try
        if (!this.ctx || !this.ctx.state) return;

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        // Map intensity to volume and pitch
        const volume = Math.min(intensity * CONFIG.SFX_GAIN_SCALE, 1.0);
        const pitchShift = 1.0 + (intensity * 0.05);

        if (volume < 0.01) return; // Silent if hit is too soft

        this.generateImpulse(volume, pitchShift);
    }

    /**
     * Generate the synth clack.
     * Uses an oscillator for the metallic ring and a noise burst for the impact.
     * 
     * @private
     */
    generateImpulse(volume, pitchShift) {
        const now = this.ctx.currentTime;
        const decay = this.clackParams.decay;

        // 1. Create Oscillator (The Tonal Clink)
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();

        osc.type = 'sine'; // Sine is purest, we could use triangle for more bite
        osc.frequency.setValueAtTime(this.clackParams.frequency * pitchShift, now);

        oscGain.gain.setValueAtTime(volume, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + decay);

        osc.connect(oscGain);
        oscGain.connect(this.lowPass);

        // 2. Create Noise (The Impact Crack)
        const noiseBuffer = this.createNoiseBuffer();
        const noiseSource = this.ctx.createBufferSource();
        const noiseGain = this.ctx.createGain();

        noiseSource.buffer = noiseBuffer;
        noiseGain.gain.setValueAtTime(volume * this.clackParams.noiseMix, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + (decay * 0.5));

        noiseSource.connect(noiseGain);
        noiseGain.connect(this.lowPass);

        // 3. Trigger and Cleanup
        osc.start(now);
        osc.stop(now + decay);

        noiseSource.start(now);
        noiseSource.stop(now + (decay * 0.5));
    }

    /**
     * Create a short buffer of white noise.
     * @private
     */
    createNoiseBuffer() {
        const bufferSize = this.ctx.sampleRate * 0.1; // 100ms of noise
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }

    /**
     * Update configuration parameters.
     * @param {Object} params - Overriding clack parameters.
     */
    setParameters(params) {
        this.clackParams = { ...this.clackParams, ...params };
        if (this.lowPass) {
            this.lowPass.frequency.value = this.clackParams.filterFreq;
        }
    }
}

/**
 * Historical Note:
 * The sound of a Newton's Cradle is a distinct acoustic signature.
 * In a vacuum, the balls would still clack due to internal vibration 
 * but there would be no sound transmission through air.
 */
