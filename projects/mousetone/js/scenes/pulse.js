/**
 * File: js/scenes/pulse.js
 * MouseTone Scene
 * Copyright (c) 2026
 * 
 * "Pulse" Mode.
 * Features a deep bass drone connected to physics-style visuals.
 * Mouse X controls filter frequency (brightness).
 * Mouse Y controls oscillator pitch (sub-bass).
 */
import { Scene } from '../core/scene.js';
import { AudioEffects } from '../audio/effects.js';

export class PulseScene extends Scene {
    /**
     * @param {CanvasRenderingContext2D} ctx 
     * @param {AudioContext} audioCtx 
     */
    constructor(ctx, audioCtx) {
        super(ctx, audioCtx);
        this.effects = new AudioEffects(audioCtx);
        this.effects.input.connect(audioCtx.destination);

        // Bass Drone Setup
        // Sawtooth -> Lowpass Filter -> Gain -> Effects
        this.osc = audioCtx.createOscillator();
        this.osc.type = 'sawtooth';

        this.filter = audioCtx.createBiquadFilter();
        this.filter.type = 'lowpass';

        this.gain = audioCtx.createGain();

        this.osc.connect(this.filter);
        this.filter.connect(this.gain);
        this.gain.connect(this.effects.input);

        this.osc.start();
        this.gain.gain.value = 0; // Start silent

        this.pulseSize = 0;
        this.targetPulse = 0;
    }

    async enter() {
        // Massive reverb for that "cinematic" feel
        this.effects.setReverb(0.8);
        this.effects.setDelay(0.0, 0.0, 0.0);
    }

    async exit() {
        // Fade out
        this.gain.gain.setTargetAtTime(0, this.audioCtx.currentTime, 0.5);
    }

    handleInput(type, data) {
        if (type === 'mousemove') {
            const { x, y } = data;
            const now = this.audioCtx.currentTime;

            // Mouse X -> Filter Cutoff
            // Exponential mapping for smoother filter sweeps
            const filterFreq = 50 + (x * x * 2000);
            this.filter.frequency.setTargetAtTime(filterFreq, now, 0.1);

            // Mouse Y -> Pitch (Deep Bass)
            // Range 30Hz - 80Hz
            const pitch = 30 + (y * 50);
            this.osc.frequency.setTargetAtTime(pitch, now, 0.1);

            // Volume -> always on when getting input, pulsing?
            this.gain.gain.setTargetAtTime(0.3, now, 0.2);

            // Visual pulse target
            this.targetPulse = x * 100;
        }
    }

    render() {
        // Clear with trails
        this.ctx.fillStyle = 'rgba(0,0,0,0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw pulsing circle in center
        const cx = this.width / 2;
        const cy = this.height / 2;

        // Smoothly interpolate size
        this.pulseSize += (this.targetPulse - this.pulseSize) * 0.1;

        this.ctx.beginPath();
        this.ctx.arc(cx, cy, 50 + this.pulseSize, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2 + (this.pulseSize / 20);
        this.ctx.stroke();

        this.targetPulse *= 0.95; // Decay pulse
    }
}
