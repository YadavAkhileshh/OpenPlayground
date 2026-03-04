/**
 * File: js/scenes/flow.js
 * MouseTone Scene
 * Copyright (c) 2026
 * 
 * The default "Flow" mode. 
 * Features liquid particle trails and continuous FM synthesis drones.
 * Designed to be relaxing and fluid.
 */
import { Scene } from '../core/scene.js';
import { AudioEffects } from '../audio/effects.js';

export class FlowScene extends Scene {
    /**
     * @param {CanvasRenderingContext2D} ctx 
     * @param {AudioContext} audioCtx 
     */
    constructor(ctx, audioCtx) {
        super(ctx, audioCtx);

        // Audio Effects Chain
        this.effects = new AudioEffects(audioCtx);
        this.effects.input.connect(audioCtx.destination);

        this.oscillators = [];
        this.particles = [];
        this.hue = 0; // Base hue for cycling colors

        this.currentVoice = null;
    }

    /**
     * Creates a simple FM synth voice structure.
     * Carrier -> Gain -> Effects
     * Modulator -> ModGain -> Carrier.frequency
     * @returns {Object} map of nodes
     */
    createVoice() {
        const carrier = this.audioCtx.createOscillator();
        const mod = this.audioCtx.createOscillator();
        const modGain = this.audioCtx.createGain();
        const gain = this.audioCtx.createGain();

        mod.connect(modGain);
        modGain.connect(carrier.frequency);
        carrier.connect(gain);
        gain.connect(this.effects.input);

        carrier.start();
        mod.start();

        return { carrier, mod, modGain, gain };
    }

    async enter() {
        // Configure effects for a spacious, fluid feel
        this.effects.setDelay(0.3, 0.5, 0.4);
        this.effects.setReverb(0.3);
    }

    async exit() {
        // Cleanup active voice if exists
        if (this.currentVoice) {
            this.currentVoice.carrier.stop();
            this.currentVoice.mod.stop();
            this.currentVoice = null;
        }
    }

    handleInput(type, data) {
        if (type === 'mousemove') {
            const { x, y, speed, width, height } = data;
            const now = this.audioCtx.currentTime;

            // --- Visuals ---
            // Spawn particles based on speed
            const count = Math.floor(speed * 0.5) + 1;
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: data.rawX,
                    y: data.rawY,
                    vx: (Math.random() - 0.5) * speed * 0.2, // Random spread
                    vy: (Math.random() - 0.5) * speed * 0.2,
                    size: Math.random() * 5 + 2,
                    life: 1.0,
                    color: `hsl(${this.hue + Math.random() * 40}, 100%, 50%)`
                });
            }

            // --- Audio ---
            // Continuous Drone/Pad logic based on position

            if (!this.currentVoice) {
                this.currentVoice = this.createVoice();
                this.currentVoice.gain.gain.value = 0;
            }

            // Map X to Carrier Frequency (Pitch)
            // Range 100Hz - 600Hz
            const minFreq = 100;
            const maxFreq = 600;
            const targetFreq = minFreq + (x * (maxFreq - minFreq));
            this.currentVoice.carrier.frequency.setTargetAtTime(targetFreq, now, 0.1);

            // Map Y to Modulator Frequency Ratio
            // Higher Y = more complex, inharmonic spectrum
            const modRatio = 1 + (y * 2);
            this.currentVoice.mod.frequency.setTargetAtTime(targetFreq * modRatio, now, 0.1);

            // Map Y to Modulation Depth (Index)
            this.currentVoice.modGain.gain.setTargetAtTime(y * 500, now, 0.1);

            // Map Speed to Volume
            const vol = Math.min(speed / 20, 0.5);
            this.currentVoice.gain.gain.setTargetAtTime(vol, now, 0.1);
        }
    }

    update(dt) {
        // Could implement auto-decay logic here if mouse stops moving
    }

    render() {
        // Trail effect: Draw semi-transparent background to create trails
        this.ctx.fillStyle = 'rgba(13, 13, 13, 0.2)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.hue += 0.5; // Cycle hue

        // Update and draw particles
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02; // Fade out

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                i--;
                continue;
            }

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.fill();
        }
    }
}
