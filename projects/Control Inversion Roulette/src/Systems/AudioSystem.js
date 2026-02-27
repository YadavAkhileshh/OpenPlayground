import { CONFIG } from '../Config/Constants.js';
import { MathUtils } from '../Utils/MathUtils.js';

/**
 * Audio System
 * 
 * Uses the Web Audio API to synthesize sound effects in real-time.
 * This avoids the need for external assets and allows for dynamic
 * sound generation (e.g., pitch shifting based on game state).
 */
export class AudioSystem {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.enabled = CONFIG.AUDIO.ENABLED;
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = CONFIG.AUDIO.VOLUME;
        this.masterGain.connect(this.ctx.destination);
    }

    /**
     * Play a shoot sound (high pitch, short decay).
     */
    playShoot() {
        if (!this.enabled) return;
        this.playTone(400, 'square', 0.1, 800, -1000);
    }

    /**
     * Play an explosion sound (noise/low pitch saw).
     */
    playExplosion() {
        if (!this.enabled) return;
        // Simple explosion simulation using low saw wave with frequency drop
        this.playTone(100, 'sawtooth', 0.3, 50, -100);
        this.playTone(80, 'square', 0.3, 20, -50);
    }

    /**
     * Play a hit sound.
     */
    playHit() {
        if (!this.enabled) return;
        this.playTone(200, 'sawtooth', 0.1, 100, -500);
    }

    /**
     * Play a powerup/swap sound.
     */
    playSwap() {
        if (!this.enabled) return;
        this.playTone(300, 'sine', 0.3, 600, 1000);
    }

    /**
     * Play Game Over sound.
     */
    playGameOver() {
        if (!this.enabled) return;
        this.playTone(300, 'sawtooth', 1.0, 50, -200);
        setTimeout(() => this.playTone(250, 'sawtooth', 1.0, 40, -100), 200);
    }

    /**
     * Generic tone generator.
     * @param {number} freq Start frequency
     * @param {string} type Oscillator type (sine, square, sawtooth, triangle)
     * @param {number} duration Duration in seconds
     * @param {number} endFreq End frequency (for slides)
     * @param {number} ramp Rate of frequency change
     */
    playTone(freq, type, duration, endFreq = null, ramp = 0) {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        if (endFreq) {
            osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration);
        } else if (ramp !== 0) {
            osc.frequency.linearRampToValueAtTime(freq + ramp, this.ctx.currentTime + duration);
        }

        gain.gain.setValueAtTime(CONFIG.AUDIO.VOLUME, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }
}
