/**
 * SoundManager.js
 * Handles synthesis or playback of sounds.
 * Using AudioContext for procedurally generated sounds to avoid external asset dependencies for the prototype.
 */

import { eventManager } from '../core/EventManager.js';
import { Events } from '../core/Settings.js';

export class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.enabled = true;

        eventManager.on(Events.PLAYER_JUMP, () => this.playJump());
        eventManager.on(Events.PLAYER_LAND, () => this.playLand());
        eventManager.on(Events.GAME_OVER, () => this.playGameOver());
        eventManager.on(Events.STROKE_CREATED, () => this.playScratch());
    }

    playTone(freq, duration, type = 'sine', vol = 0.1) {
        if (!this.enabled) return;

        // Resume context if suspended (browser auto-play policy)
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playJump() {
        this.playTone(400, 0.1, 'square', 0.05);
        setTimeout(() => this.playTone(600, 0.2, 'sine', 0.05), 50);
    }

    playLand() {
        this.playTone(100, 0.1, 'sawtooth', 0.1);
    }

    playScratch() {
        // Simulating a pen scratch sound with noise
        if (!this.enabled || Math.random() > 0.3) return; // Don't play every time

        const bufferSize = this.ctx.sampleRate * 0.1; // 0.1 seconds
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start();
    }

    playGameOver() {
        this.playTone(300, 0.3, 'sawtooth', 0.1);
        setTimeout(() => this.playTone(200, 0.4, 'sawtooth', 0.1), 300);
        setTimeout(() => this.playTone(100, 0.6, 'sawtooth', 0.1), 700);
    }
}
