/**
 * Audio System
 * Synthesized SFX.
 */
export class AudioSystem {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.gain.value = 0.3;
    }

    playTone(freq, duration, type = 'sine') {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playHit() {
        this.playTone(880, 0.1, 'triangle');
    }

    playSuccess() {
        this.playTone(440, 0.1, 'sine');
        setTimeout(() => this.playTone(554, 0.1, 'sine'), 100);
        setTimeout(() => this.playTone(659, 0.2, 'sine'), 200);
    }

    playWormhole() {
        this.playTone(100, 0.5, 'sawtooth');
    }
}
