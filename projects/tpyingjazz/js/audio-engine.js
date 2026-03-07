/**
 * typing-jazz/js/audio-engine.js
 * 
 * CORE AUDIO CONTROLLER
 * 
 * This module is responsible for the entire audio lifecycle of the application.
 * It uses the Web Audio API to create a modular synthesizer architecture.
 * 
 * THE SIGNAL CHAIN:
 * Oscillator -> Envelope (VCA) -> Compressor/Limiter -> Master Gain -> Destination
 *                      | 
 *                      \-> Feedback Delay (Spatial Effect)
 */

import { getFrequencyFromScale } from './scales.js';

/**
 * AudioEngine Class
 * Manages the Web Audio Context and all sound generation nodes.
 */
class AudioEngine {
    /**
     * Constructor initializes internal state but does NOT start the context.
     * Browsers require a user gesture to start the AudioContext.
     */
    constructor() {
        /** @type {AudioContext} The main browser audio context */
        this.ctx = null;

        /** @type {GainNode} Global volume control */
        this.masterGain = null;

        /** @type {DynamicsCompressorNode} Prevents clipping and levels the sound */
        this.compressor = null;

        /** @type {DelayNode} Advanced feedback delay for jazz "ambience" */
        this.delay = null;
        this.delayGain = null;
        this.delayLp = null;

        /** @type {BiquadFilterNode} Main filter for tone shaping */
        this.filter = null;

        /** @type {Set} Tracks active voice objects for cleanup/management */
        this.activeVoices = new Set();

        /** @type {boolean} Thread-safety flag for initialization */
        this.isInitialized = false;

        /** 
         * Synth Configuration (ADSR + Polyphony) 
         * Enhanced for rich jazz textures and harmonic synthesis.
         */
        this.settings = {
            attack: 0.02,     // Quick but smooth attack
            decay: 0.15,     // Natural decay
            sustain: 0.4,    // Sustained body
            release: 1.2,    // Long, graceful release for jazz atmosphere
            maxVoices: 16,   // Increased polyphony for dense improvisation
            volume: 0.6,     // Optimized master volume
            harmonicRatio: [1.0, 0.5, 0.33, 0.25, 0.2], // Hammond drawbar harmonics
            lfoRate: 5.0,     // Vibrato speed in Hz
            lfoDepth: 3.0,    // Vibrato depth in cents
            mode: 'piano'     // Play mode: piano, organ, or synth
        };
    }

    /**
     * Initializes the Audio Context.
     * This method builds the entire signal chain and must follow a user interaction.
     */
    async init() {
        if (this.isInitialized) return;

        // Create the core context
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();

        /**
         * MASTER SIGNAL CHAIN CONSTRUCTION
         * [Voices] -> [Filter] -> [Compressor] -> [Master Gain] -> [Output]
         */

        // Final Output Volume
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.settings.volume, this.ctx.currentTime);

        // Dynamics Compressor (Limiter role)
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-15, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

        // Main Character Filter (Warm Jazz Tones)
        this.filter = this.ctx.createBiquadFilter();
        this.filter.type = 'lowpass';
        this.filter.frequency.setValueAtTime(2200, this.ctx.currentTime);
        this.filter.Q.setValueAtTime(1.0, this.ctx.currentTime);

        // Initialize spatial effects
        this.setupEffects();

        // Connect the chain
        this.filter.connect(this.compressor);
        this.compressor.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);

        this.isInitialized = true;
        console.log('AudioEngine: Advanced Signal Chain Initialized');
    }

    /**
     * Sets up a feedback delay loop with damping.
     * Simulates the acoustic reflections of a small jazz club.
     */
    setupEffects() {
        this.delay = this.ctx.createDelay(2.0);
        this.delayGain = this.ctx.createGain();
        this.delayLp = this.ctx.createBiquadFilter();

        // Configuration for "Jazz Space"
        this.delay.delayTime.setValueAtTime(0.4, this.ctx.currentTime);
        this.delayGain.gain.setValueAtTime(0.3, this.ctx.currentTime); // 30% feedback
        this.delayLp.frequency.setValueAtTime(1200, this.ctx.currentTime); // Darken the reflections
        this.delayLp.type = 'lowpass';

        // Connect internal loop: Delay -> Filter -> Gain -> Delay (Feedback)
        this.delay.connect(this.delayLp);
        this.delayLp.connect(this.delayGain);
        this.delayGain.connect(this.delay);

        // Connect to main chain
        this.delayGain.connect(this.filter);
    }

    /**
     * Triggers a rich, multi-oscillator note using Harmonic Synthesis.
     * Includes LFO-driven pitch vibrato for organic movement.
     * @param {number} freq Frequency of the fundamental note.
     */
    triggerNote(freq) {
        if (!this.isInitialized) return;

        const now = this.ctx.currentTime;

        // Note VCA (Envelope)
        const vca = this.ctx.createGain();
        vca.gain.setValueAtTime(0, now);

        // LFO setup for subtle vibrato
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.setValueAtTime(this.settings.lfoRate, now);
        lfoGain.gain.setValueAtTime(this.settings.lfoDepth, now);
        lfo.connect(lfoGain);

        /**
         * HARMONIC SYNTHESIS ENGINE
         * Generates a series of sine/triangle waves at integer multiples
         * of the fundamental frequency to create a rich, organ-like timbre.
         */
        const oscillators = this.settings.harmonicRatio.map((mix, i) => {
            const osc = this.ctx.createOscillator();
            const oscGain = this.ctx.createGain();

            // Map freq (fundamental, 2nd harmonic, 3rd, etc.)
            osc.frequency.setValueAtTime(freq * (i + 1), now);
            osc.type = i === 0 ? 'triangle' : 'sine';

            // Apply mix level and soft scaling
            const gainLevel = mix * 0.15 * (1.0 / (i + 1));
            oscGain.gain.setValueAtTime(gainLevel, now);

            // Inject vibrato if it's the fundamental
            if (i === 0) lfoGain.connect(osc.detune);

            osc.connect(oscGain);
            oscGain.connect(vca);
            return osc;
        });

        // ADSR ENVELOPE EXECUTION
        vca.gain.linearRampToValueAtTime(1.0, now + this.settings.attack);
        vca.gain.exponentialRampToValueAtTime(this.settings.sustain, now + this.settings.attack + this.settings.decay);

        // Calculated sustain phase
        const endSustain = now + this.settings.attack + this.settings.decay + 0.15;
        vca.gain.exponentialRampToValueAtTime(0.001, endSustain + this.settings.release);

        // Route to Filter and Delay
        vca.connect(this.filter);
        if (this.delay) vca.connect(this.delay);

        // Start all generators
        oscillators.forEach(osc => osc.start(now));
        lfo.start(now);

        // Cleanup Logic
        const stopTime = endSustain + this.settings.release;
        oscillators.forEach(osc => osc.stop(stopTime));
        lfo.stop(stopTime);

        const voice = { oscillators, vca, lfo };
        this.activeVoices.add(voice);

        // Automatic GC
        oscillators[0].onended = () => {
            vca.disconnect();
            this.activeVoices.delete(voice);
        };
    }

    /**
     * Updates synth parameters in real-time.
     * @param {string} key Configuration key.
     * @param {any} value New value.
     */
    updateSettings(key, value) {
        this.settings[key] = value;

        if (key === 'volume' && this.masterGain) {
            this.masterGain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.1);
        }

        if (key === 'lfoRate' && Array.from(this.activeVoices).length > 0) {
            // Optional: Update active voices? No, usually just for new notes.
        }
    }
}

export const audioEngine = new AudioEngine();
