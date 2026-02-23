/**
 * audio.js
 * Vanilla Web Audio API engine for generative ambient noise and degradation effects.
 */

import { randomRange, pick } from '../utils/random.js';
import { clamp } from '../utils/math.js';

export class AudioEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.humOsc = null;
        this.humGain = null;
        this.noiseNode = null;
        this.noiseGain = null;
        this.isMuted = true;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        // Master Chain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.5;
        this.masterGain.connect(this.ctx.destination);

        // 1. Ambient Hum (The "Heartbeat")
        this.humOsc = this.ctx.createOscillator();
        this.humOsc.type = 'sine';
        this.humOsc.frequency.value = 60; // 60Hz hum

        this.humGain = this.ctx.createGain();
        this.humGain.gain.value = 0.05; // Quiet

        this.humOsc.connect(this.humGain);
        this.humGain.connect(this.masterGain);

        this.humOsc.start();

        // 2. Static / Crackle Generator (Buffer Source)
        const bufferSize = this.ctx.sampleRate * 2; // 2 seconds of noise
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        this.noiseBuffer = buffer;
        this.initialized = true;
        this.isMuted = false;
        console.log("AudioEngine: Initialized.");
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    update(chaosLevel) {
        if (!this.initialized || this.isMuted) return;

        // Modulate Hum based on chaos
        const targetFreq = 60 - (chaosLevel * 40);
        const detune = (Math.random() - 0.5) * chaosLevel * 100;

        this.humOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
        this.humOsc.detune.setTargetAtTime(detune, this.ctx.currentTime, 0.1);

        if (Math.random() < chaosLevel * 0.05) {
            this.triggerGlitch(chaosLevel);
        }
    }

    triggerGlitch(intensity) {
        const src = this.ctx.createBufferSource();
        src.buffer = this.noiseBuffer;

        const gain = this.ctx.createGain();
        gain.gain.value = intensity * 0.2;

        const filter = this.ctx.createBiquadFilter();
        filter.type = Math.random() > 0.5 ? 'highpass' : 'lowpass';
        filter.frequency.value = randomRange(100, 5000);

        src.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        const duration = randomRange(0.05, 0.2);
        src.start();
        src.stop(this.ctx.currentTime + duration);

        setTimeout(() => {
            src.disconnect();
            gain.disconnect();
            filter.disconnect();
        }, duration * 1000 + 100);
    }
}
