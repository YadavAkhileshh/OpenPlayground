/**
 * @file AudioEngine.js
 * @description Integrated sound engine using the Web Audio API.
 * Provides procedural sound generation based on physics events and states.
 * 
 * Line Count Target Contribution: ~150 lines.
 */

export default class AudioEngine {
    constructor() {
        this.ctx = null;
        this.masterVolume = 0.2;
        this.isInitialized = false;

        // Oscillators for ambient wind/tension
        this.windOsc = null;
        this.tensionOsc = null;
        this.mainGain = null;
    }

    /**
     * Lazy-initializes the AudioContext on first user interaction.
     * Prevents browser autoplay blocking.
     */
    init() {
        if (this.isInitialized) return;

        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.mainGain = this.ctx.createGain();
            this.mainGain.gain.value = this.masterVolume;
            this.mainGain.connect(this.ctx.destination);

            this.setupTensionSynth();
            this.isInitialized = true;
            console.log("[AudioEngine] Web Audio initialized successfully.");
        } catch (e) {
            console.error("[AudioEngine] Failed to initialize Web Audio:", e);
        }
    }

    /**
     * Sets up a low-frequency oscillator that maps to cloth tension.
     * Creates a "straining" sound when the cloth is under high stress.
     */
    setupTensionSynth() {
        this.tensionOsc = this.ctx.createOscillator();
        this.tensionGain = this.ctx.createGain();

        this.tensionOsc.type = 'sine';
        this.tensionOsc.frequency.value = 100;
        this.tensionGain.gain.value = 0; // Silent by default

        this.tensionOsc.connect(this.tensionGain);
        this.tensionGain.connect(this.mainGain);
        this.tensionOsc.start();
    }

    /**
     * Updates the tension synth parameters in real-time.
     * @param {number} tension - Normalized global tension value.
     */
    updateTension(tension) {
        if (!this.isInitialized) return;

        const freq = 100 + tension * 400;
        const volume = Math.min(0.5, tension * 0.5);

        this.tensionOsc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.1);
        this.tensionGain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.1);
    }

    /**
     * Plays a "snap" or "rip" sound effect.
     * Uses FM synthesis to create a harsh, percussive sound.
     * @param {number} intensity - How "hard" the tear was.
     */
    playTearSound(intensity = 1.0) {
        if (!this.isInitialized) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800 * intensity, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.3 * intensity, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.mainGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    /**
     * Plays a subtle "thud" for collisions.
     */
    playCollisionSound(velocity = 1.0) {
        if (!this.isInitialized) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.1 * velocity, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(this.mainGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    /**
     * Resume context if it was suspended (browser policy).
     */
    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
}
