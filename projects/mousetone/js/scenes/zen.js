/**
 * File: zen.js
 * MouseTone Module
 * Copyright (c) 2026
 */
import { Scene } from '../core/scene.js';
import { AudioEffects } from '../audio/effects.js';

export class ZenScene extends Scene {
    constructor(ctx, audioCtx) {
        super(ctx, audioCtx);
        this.effects = new AudioEffects(audioCtx);
        this.effects.input.connect(audioCtx.destination);

        // Sine waves for chords
        this.oscs = [];
        this.gains = [];
        const freqs = [110, 165, 196, 220, 261]; // Major 9th ish

        freqs.forEach(f => {
            const osc = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            osc.frequency.value = f;
            osc.type = 'sine';
            g.gain.value = 0;
            osc.connect(g);
            g.connect(this.effects.input);
            osc.start();
            this.oscs.push(osc);
            this.gains.push(g);
        });
    }

    async enter() {
        this.effects.setReverb(1.0); // Massive wash
        this.effects.setDelay(0.5, 0.6, 0.3);
    }

    async exit() {
        this.gains.forEach(g => g.gain.setTargetAtTime(0, this.audioCtx.currentTime, 1.0));
    }

    handleInput(type, data) {
        if (type === 'mousemove') {
            const { x, y } = data;
            const now = this.audioCtx.currentTime;

            // Swell volume based on X
            this.gains.forEach((g, i) => {
                const dist = 1 - Math.abs(x - (i / this.gains.length));
                const target = Math.pow(dist, 4) * 0.2;
                g.gain.setTargetAtTime(target, now, 1.0); // Slow attack
            });

            // Detune based on Y
            this.oscs.forEach((osc, i) => {
                osc.frequency.setTargetAtTime(osc.frequency.value * (1 + y * 0.01), now, 0.5);
            });
        }
    }

    render() {
        this.ctx.fillStyle = 'rgba(20, 30, 40, 0.05)'; // Very slow fade
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Gentle expanding circles
        if (Math.random() < 0.05) {
            this.ctx.strokeStyle = `hsla(180, 50%, 80%, 0.1)`;
            this.ctx.beginPath();
            this.ctx.arc(Math.random() * this.width, Math.random() * this.height, Math.random() * 200, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }
}
