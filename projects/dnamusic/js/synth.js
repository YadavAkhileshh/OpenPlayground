/**
 * BioSynth - Organic Audio Engine
 * Uses Web Audio API to generate sounds based on genetic data.
 * Enhanced with Delay, LFO, and Dynamics.
 */
import { CONFIG } from './constants.js';

export class BioSynth {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.reverb = null;
        this.delay = null;
        this.lfo = null;
        this.filterNode = null;
        this.isInitialized = false;
        this.activeVoices = [];
    }

    async init() {
        if (this.isInitialized) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        // Master Gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = CONFIG.AUDIO.MASTER_GAIN;

        // Effects Chain Setup
        this.setupEffectsChain();

        // Global LFO for "Breathing" effect
        this.setupLFO();

        this.isInitialized = true;
        console.log("BioSynth Initialized: 44.1kHz / Stereo");
    }

    setupEffectsChain() {
        // 1. Compressor (Dynamics)
        const compressor = this.ctx.createDynamicsCompressor();
        compressor.threshold.value = CONFIG.AUDIO.COMPRESSOR.THRESHOLD;
        compressor.knee.value = CONFIG.AUDIO.COMPRESSOR.KNEE;
        compressor.ratio.value = CONFIG.AUDIO.COMPRESSOR.RATIO;
        compressor.attack.value = CONFIG.AUDIO.COMPRESSOR.ATTACK;
        compressor.release.value = CONFIG.AUDIO.COMPRESSOR.RELEASE;

        // 2. Reverb (Space)
        this.reverb = this.ctx.createConvolver();
        this.reverb.buffer = this.createImpulseResponse(
            CONFIG.AUDIO.REVERB.DURATION,
            CONFIG.AUDIO.REVERB.DECAY,
            CONFIG.AUDIO.REVERB.REVERSE
        );
        const reverbGain = this.ctx.createGain();
        reverbGain.gain.value = 0.4; // Wet mix

        // 3. Stereo Delay (Echo)
        this.delay = this.ctx.createDelay(5.0);
        this.delay.delayTime.value = 0.4; // 400ms delay
        const delayFeedback = this.ctx.createGain();
        delayFeedback.gain.value = 0.3; // 30% feedback
        const delayFilter = this.ctx.createBiquadFilter();
        delayFilter.frequency.value = 1000; // Dampen repeats

        // Delay Loop
        this.delay.connect(delayFeedback);
        delayFeedback.connect(delayFilter);
        delayFilter.connect(this.delay);

        // Connect Graph
        // Master -> Compressor -> Destination
        // Master -> Reverb -> Compressor
        // Master -> Delay -> Compressor

        this.masterGain.connect(compressor);

        this.masterGain.connect(reverbGain);
        reverbGain.connect(compressor);

        this.masterGain.connect(this.delay);
        this.delay.connect(compressor);

        compressor.connect(this.ctx.destination);
    }

    setupLFO() {
        // LFO modulates the global filter cutoff of voices if we routed that way,
        // but since voices are transient, we can just store the LFO and connect gently.
        // Actually, let's make an LFO that we connect to every new voice's filter.

        this.lfo = this.ctx.createOscillator();
        this.lfo.type = 'sine';
        this.lfo.frequency.value = 0.1; // Slow breathing (10s cycle)
        this.lfo.start();
    }

    /**
     * Resume context (browsers require user gesture)
     */
    async resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
    }

    /**
     * Plays a chord based on frequencies and quality.
     * @param {Object} chordData - Contains frequencies array and quality string.
     * @param {number} duration - Duration in seconds.
     * @param {number} time - Scheduling time (audio context time).
     */
    playChord(chordData, duration = 1.0, time = 0) {
        if (!this.ctx) return;
        const now = time || this.ctx.currentTime;

        // If silence/stop
        if (!chordData.frequencies || chordData.frequencies.length === 0) {
            return;
        }

        chordData.frequencies.forEach((freq, index) => {
            if (!freq) return;
            this.createVoice(freq, chordData.quality, now, duration, index);
        });
    }

    /**
     * Creates a single oscillator voice with envelope.
     */
    createVoice(freq, quality, startTime, duration, index) {
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        // Timbre based on quality
        let type = 'sine';
        let detuneAmount = 0;

        if (quality.includes('maj')) {
            type = 'triangle';
            detuneAmount = 5;
        }
        if (quality.includes('min')) {
            type = 'sine';
            detuneAmount = 3;
        }
        if (quality.includes('dom')) {
            type = 'sawtooth';
            detuneAmount = 8;
        }
        if (quality.includes('dim')) {
            type = 'square';
            detuneAmount = 10;
        }
        if (quality.includes('stop')) {
            return;
        }

        osc.type = type;
        osc.frequency.value = freq;

        // Detune Logic
        // Spread voices slightly for "chorus" effect
        if (index > 0) {
            // Alternating + / - detune
            const sign = index % 2 === 0 ? 1 : -1;
            osc.detune.value = sign * detuneAmount * index;
        }

        // Filter settings
        filter.type = 'lowpass';
        filter.Q.value = 1;
        // Base cutoff
        filter.frequency.setValueAtTime(800, startTime);
        // Filter Envelope (Wauuuuh effect)
        filter.frequency.exponentialRampToValueAtTime(3000, startTime + 0.1);
        filter.frequency.exponentialRampToValueAtTime(800, startTime + duration);

        // Connect LFO Modulator for movement
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 200; // Modulate filter by +/- 200Hz
        this.lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        // Envelope (ADSR)
        const attack = 0.05;
        const decay = 0.2;
        const sustain = 0.4;
        const release = 0.8; // Long tail

        // Gain Graph
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.1, startTime + attack); // Attack
        gainNode.gain.exponentialRampToValueAtTime(0.1 * sustain, startTime + attack + decay); // Decay
        gainNode.gain.setValueAtTime(0.1 * sustain, startTime + duration - release); // Sustain hold
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration); // Release

        // Connections
        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);

        // Play
        osc.start(startTime);
        osc.stop(startTime + duration + 1.0); // Allow tail

        // Cleanup
        osc.onended = () => {
            gainNode.disconnect();
            filter.disconnect();
            lfoGain.disconnect();
        };

        this.activeVoices.push({ osc, gainNode });
    }

    stopAll() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        this.activeVoices.forEach(voice => {
            try {
                voice.gainNode.gain.cancelScheduledValues(now);
                voice.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
                voice.osc.stop(now + 0.1);
            } catch (e) {
                // Ignore errors on already stopped nodes
            }
        });
        this.activeVoices = [];
    }

    createImpulseResponse(duration, decay, reverse) {
        const sampleRate = this.ctx.sampleRate;
        const length = sampleRate * duration;
        const impulse = this.ctx.createBuffer(2, length, sampleRate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);

        for (let i = 0; i < length; i++) {
            const n = reverse ? length - i : i;
            // Pink Noise Approximation
            const white = Math.random() * 2 - 1;
            left[i] = white * Math.pow(1 - n / length, decay);
            right[i] = white * Math.pow(1 - n / length, decay);
        }
        return impulse;
    }
}
