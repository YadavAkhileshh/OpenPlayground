/**
 * AudioSystem.js
 * 
 * Generates procedural audio using the Web Audio API. 
 * Allows for sound effects without external assets.
 */

import { GameEvents } from '../core/EventManager.js';
import { EVENTS } from '../core/Constants.js';

export class AudioSystem {
    constructor() {
        this.ctx = null;
        this.masterVolume = 0.3;

        // Initialize on first user interaction because browsers block auto-play
        this.isInitialized = false;

        // Bind event listeners
        window.addEventListener('mousedown', () => this.init());
        window.addEventListener('keydown', () => this.init());
        window.addEventListener('touchstart', () => this.init());
    }

    init() {
        if (this.isInitialized) return;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.isInitialized = true;
            console.log('AudioSystem initialized');

            // Subscribe to game events to play sounds
            this.subscribeToEvents();

        } catch (e) {
            console.error('Web Audio API not supported', e);
        }
    }

    subscribeToEvents() {
        GameEvents.on(EVENTS.INPUT_MOVE, () => this.playTone(440, 'sine', 0.1));
        GameEvents.on(EVENTS.INPUT_ATTACK, () => this.playTone(150, 'sawtooth', 0.3, 'lowpass'));
        GameEvents.on(EVENTS.INPUT_DASH, () => this.playTone(600, 'square', 0.2));
        GameEvents.on(EVENTS.PLAYER_DIED, () => this.playDateathSound());
    }

    /**
     * Plays a simple synthesized tone.
     * @param {number} freq - Frequency in Hz.
     * @param {string} type - Waveform type (sine, square, sawtooth, triangle).
     * @param {number} duration - Duration in seconds.
     * @param {string} filterType - Optional filter (lowpass, highpass).
     */
    playTone(freq, type = 'sine', duration = 0.1, filterType = null) {
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        // Envelope
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(this.masterVolume, this.ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        // Connections
        if (filterType) {
            const filter = this.ctx.createBiquadFilter();
            filter.type = filterType;
            filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
            osc.connect(filter);
            filter.connect(gain);
        } else {
            osc.connect(gain);
        }

        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playDateathSound() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 1);

        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 1);
    }
}
