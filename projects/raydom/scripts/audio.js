/**
 * @fileoverview Audio Engine for RayDOM.
 * Handles procedural sound synthesis for ambient noise, footsteps, and interactions.
 * Built using the Web Audio API to avoid external assets.
 */

export class AudioEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.isInitialized = false;

        // Sound state
        this.ambientOsc = null;
        this.lastFootstepTime = 0;
        this.footstepInterval = 400; // ms
    }

    /**
     * Initializes the Web Audio context. 
     * Must be called after a user gesture (e.g., clicking the loader).
     */
    init() {
        if (this.isInitialized) return;

        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.3;
            this.masterGain.connect(this.ctx.destination);

            this.startAmbientDrone();
            this.isInitialized = true;
            console.log("AudioEngine: Initialized successfully.");
        } catch (e) {
            console.error("AudioEngine: Failed to initialize Web Audio context.", e);
        }
    }

    /**
     * Creates a low-frequency ambient drone to enhance atmosphere.
     */
    startAmbientDrone() {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc1.type = 'sawtooth';
        osc1.frequency.value = 40; // Low hum

        osc2.type = 'square';
        osc2.frequency.value = 40.5; // Slight detune for phasing

        lfo.type = 'sine';
        lfo.frequency.value = 0.1; // Very slow modulation
        lfoGain.gain.value = 5;

        filter.type = 'lowpass';
        filter.frequency.value = 200;
        filter.Q.value = 10;

        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);
        lfoGain.connect(osc2.frequency);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(this.masterGain);

        osc1.start();
        osc2.start();
        lfo.start();

        this.ambientOsc = [osc1, osc2, lfo];
    }

    /**
     * Synthesizes a footstep sound (noise-based).
     */
    playFootstep() {
        if (!this.isInitialized) return;
        const now = Date.now();
        if (now - this.lastFootstepTime < this.footstepInterval) return;

        this.lastFootstepTime = now;

        const bufferSize = this.ctx.sampleRate * 0.1;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        source.start();
    }

    /**
     * Plays a high-pitched beep for UI interactions.
     * @param {number} freq - Frequency of the beep.
     */
    playBeep(freq = 880) {
        if (!this.isInitialized) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq / 2, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    /**
     * Plays a mechanical sliding sound for doors.
     */
    playDoorSound() {
        if (!this.isInitialized) return;

        const duration = 1.0;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(60, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + duration);

        filter.type = 'lowpass';
        filter.frequency.value = 300;

        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.1);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    /**
     * Synthesizes a weapon fire effect.
     */
    playFire() {
        if (!this.isInitialized) return;

        const osc = this.ctx.createOscillator();
        const noise = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();

        // Simple noise buffer for the "crack"
        const bufferSize = this.ctx.sampleRate * 0.1;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        noise.buffer = buffer;

        osc.type = 'square';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

        osc.connect(gain);
        noise.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        noise.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }
}
