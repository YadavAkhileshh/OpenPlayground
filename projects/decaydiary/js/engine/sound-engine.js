/**
 * sound-engine.js
 * Generates procedural audio feedback for writing and decay events.
 * 
 * Uses the Web Audio API to synthesize minimalist harmonic tones,
 * creating an immersive and contemplative atmosphere.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.isActive = false;

        // Harmonic series for "Void" theme
        this.scales = {
            'void': [220, 247.5, 275, 330, 371.25, 440],
            'parchment': [261.63, 293.66, 329.63, 349.23, 392.00, 440.00],
            'dusk': [196, 220, 233.08, 261.63, 293.66, 329.63]
        };

        this.currentScale = 'void';
    }

    /**
     * Initializes the audio context (must be triggered by user gesture).
     */
    init() {
        if (this.ctx) return;

        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.1; // Low default volume
            this.masterGain.connect(this.ctx.destination);

            this.isActive = true;
            console.log("SoundEngine: Synthesizer online.");

            this.setupSubscriptions();
        } catch (e) {
            console.warn("SoundEngine: Web Audio API not supported.", e);
        }
    }

    /**
     * Wire up listeners for system events.
     */
    setupSubscriptions() {
        if (typeof eventBus === 'undefined') return;

        eventBus.on(EVENTS.CHAR_ADDED, () => this.playTone('high'));
        eventBus.on(EVENTS.CHAR_EXPIRED, () => this.playTone('low'));
        eventBus.on(EVENTS.THEME_CHANGED, (theme) => {
            this.currentScale = theme.name.toLowerCase();
        });
    }

    /**
     * Synthesizes a minimalist tone.
     * @param {string} type - 'high' (creation) | 'low' (decay)
     */
    playTone(type) {
        if (!this.isActive || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const oscillator = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        // Select frequency from scale
        const scale = this.scales[this.currentScale] || this.scales.void;
        const baseFreq = type === 'high' ? scale[Math.floor(Math.random() * scale.length)] : scale[0] / 2;

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

        // Decay envelope
        gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.5);

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        oscillator.start();
        oscillator.stop(this.ctx.currentTime + 1.5);
    }

    /**
     * Updates volume based on global settings.
     * @param {number} val (0.0 to 1.0)
     */
    setVolume(val) {
        if (this.masterGain) {
            this.masterGain.gain.setTargetAtTime(val * 0.2, this.ctx.currentTime, 0.1);
        }
    }
}

// Global instance
const soundEngine = new SoundEngine();
