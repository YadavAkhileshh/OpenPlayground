/**
 * File: chaos.js
 * MouseTone Module
 * Copyright (c) 2026
 */
import { Scene } from '../core/scene.js';
import { AudioEffects } from '../audio/effects.js';
import { LFO, SynthVoice } from '../audio/synth.js';

export class ChaosScene extends Scene {
    constructor(ctx, audioCtx) {
        super(ctx, audioCtx);
        this.effects = new AudioEffects(audioCtx);
        this.effects.input.connect(audioCtx.destination);

        // Distortion logic
        this.distortion = audioCtx.createWaveShaper();
        this.distortion.curve = this.makeDistortionCurve(400);
        this.distortion.oversample = '4x';

        this.noise = audioCtx.createBufferSource();
        // fill buffer
        const bufSize = audioCtx.sampleRate * 2;
        const buffer = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
        this.noise.buffer = buffer;
        this.noise.loop = true;

        this.noiseGain = audioCtx.createGain();
        this.noiseGain.gain.value = 0;

        this.noise.connect(this.distortion);
        this.distortion.connect(this.noiseGain);
        this.noiseGain.connect(this.effects.input);

        this.noise.start();

        this.glitchTimer = 0;
    }

    makeDistortionCurve(amount) {
        const k = typeof amount === 'number' ? amount : 50;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        for (let i = 0; i < n_samples; ++i) {
            const x = (i * 2) / n_samples - 1;
            curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }
        return curve;
    }

    async enter() {
        this.effects.setDelay(0.1, 0.8, 0.6); // Heavy slapback
        this.effects.setReverb(0.1);
    }

    handleInput(type, data) {
        if (type === 'mousemove') {
            const { x, y, speed } = data;
            const now = this.audioCtx.currentTime;

            // Random chaotic bursts
            if (Math.random() < 0.1 * speed) {
                this.noiseGain.gain.setValueAtTime(0.5, now);
                this.noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            }

            this.distortion.curve = this.makeDistortionCurve(y * 1000);
        }
    }

    render() {
        // Glitch visuals
        if (Math.random() < 0.1) {
            this.ctx.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
        }

        this.ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
        this.ctx.fillRect(Math.random() * this.width, Math.random() * this.height, 50, 50);

        // Reset transform
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Fade
        this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
}
