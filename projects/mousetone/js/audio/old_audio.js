/**
 * File: old_audio.js
 * MouseTone Module
 * Copyright (c) 2026
 */
export class AudioEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.carrier = null;
        this.modulator = null;
        this.modulatorGain = null;
        this.filter = null;
        this.delay = null;
        this.feedback = null;
        this.isPlaying = false;
        this.volume = 0;
    }

    init() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        // Master Gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0;

        // Effects: Delay
        this.delay = this.ctx.createDelay();
        this.delay.delayTime.value = 0.3;
        this.feedback = this.ctx.createGain();
        this.feedback.gain.value = 0.4;

        // Filter
        this.filter = this.ctx.createBiquadFilter();
        this.filter.type = 'lowpass';
        this.filter.frequency.value = 1000;

        // Routing
        // carrier -> filter -> master -> destination
        //                   -> delay -> feedback -> delay -> master
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.connect(this.delay);
        this.delay.connect(this.feedback);
        this.feedback.connect(this.delay);
        this.feedback.connect(this.ctx.destination);

        // Nodes created on start to avoid stuck oscillators
    }

    start() {
        if (!this.ctx) this.init();
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        if (this.isPlaying) return;

        // FM Synthesis Setup
        this.carrier = this.ctx.createOscillator();
        this.carrier.type = 'sine';

        this.modulator = this.ctx.createOscillator();
        this.modulator.type = 'triangle';

        this.modulatorGain = this.ctx.createGain();

        // Modulator modulates Carrier frequency
        this.modulator.connect(this.modulatorGain);
        this.modulatorGain.connect(this.carrier.frequency);

        this.carrier.connect(this.filter);
        this.filter.connect(this.masterGain);

        this.carrier.start();
        this.modulator.start();

        this.isPlaying = true;
    }

    update(x, y, speed) {
        if (!this.isPlaying) return;

        const now = this.ctx.currentTime;

        // Map X to Pitch (Carrier Freq) 
        // Pentatonic scale-ish mapping or smooth? Smooth is better for "flow".
        // Range: 100Hz - 800Hz
        const minFreq = 100;
        const maxFreq = 800;
        const targetFreq = minFreq + (x * (maxFreq - minFreq));
        this.carrier.frequency.setTargetAtTime(targetFreq, now, 0.1);

        // Map Y to Modulation Index (Modulator Gain) and Filter
        // Higher Y = more complex sound (more modulation)
        const modIndex = y * 500;
        this.modulatorGain.gain.setTargetAtTime(modIndex, now, 0.1);

        // Map Y to Modulator Frequency (harmonic relationship)
        // Simple ratios: 0.5, 1, 1.5, 2, etc.
        const modRatio = 1 + (Math.floor(y * 5) * 0.5);
        this.modulator.frequency.setTargetAtTime(targetFreq * modRatio, now, 0.1);

        // Filter cutoff based on speed/intensity
        const baseCutoff = 200;
        const maxCutoff = 3000;
        const targetCutoff = baseCutoff + (Math.min(speed / 50, 1) * (maxCutoff - baseCutoff));
        this.filter.frequency.setTargetAtTime(targetCutoff, now, 0.1);

        // Volume based on movement (fade out if still)
        // If moving, volume up. If stop, decay.
        const targetVol = Math.min(speed / 20, 0.8) + 0.1; // Base level 0.1 for ambience
        this.masterGain.gain.setTargetAtTime(targetVol, now, 0.2);
    }
}
