/**
 * Audio Engine
 * Generates procedural ambient drones using Web Audio API.
 */

export class AudioEngine {
    constructor() {
        this.ctx = null;
        this.oscillators = [];
        this.gainNode = null;
        this.filterNode = null;
        this.isStarted = false;

        // Parameters
        this.baseFreq = 60; // Low drone
    }

    start() {
        if (this.isStarted) return;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();

            this.gainNode = this.ctx.createGain();
            this.gainNode.gain.value = 0.1;
            this.gainNode.connect(this.ctx.destination);

            this.filterNode = this.ctx.createBiquadFilter();
            this.filterNode.type = 'lowpass';
            this.filterNode.frequency.value = 200;
            this.filterNode.connect(this.gainNode);

            // Create drone oscillators
            this.createOscillator(this.baseFreq, 'sine');
            this.createOscillator(this.baseFreq * 1.5, 'sine');
            this.createOscillator(this.baseFreq * 0.5, 'triangle');

            this.isStarted = true;
        } catch (e) {
            console.warn('Audio not supported or blocked', e);
        }
    }

    createOscillator(freq, type) {
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        osc.type = type;
        osc.frequency.value = freq;

        const lfo = this.ctx.createOscillator();
        lfo.frequency.value = Math.random() * 0.5;
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 5;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();

        osc.connect(this.filterNode);
        osc.start();

        this.oscillators.push({ osc, lfo });
    }

    update(intensity) {
        if (!this.ctx || !this.isStarted) return;

        // Modulate filter based on activity (ribbons/particles)
        // intensity is 0-1
        const targetFreq = 200 + intensity * 800;
        this.filterNode.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.5);

        const targetGain = 0.1 + intensity * 0.2;
        this.gainNode.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.5);
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
}
