/**
 * Simple Audio Synthesizer for feedback.
 */
export class AudioEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    toggle(enabled) {
        this.enabled = enabled;
        if (enabled && !this.ctx) this.init();
    }

    playTone(freq, duration, type = 'sine') {
        if (!this.enabled || !this.ctx) return;

        // Resume if suspended (common in browsers)
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playStart() {
        this.playTone(440, 0.1, 'triangle');
        setTimeout(() => this.playTone(660, 0.2, 'triangle'), 100);
    }

    playVisit() {
        // Very short, quiet blip for visitation to avoid annoyance
        // Not playing for every node, maybe every 10th handled in logic to avoid lag/noise
    }

    playWall() {
        this.playTone(100, 0.1, 'sawtooth');
    }

    playWeight() {
        this.playTone(200, 0.1, 'sine');
    }

    playSuccess() {
        this.playTone(440, 0.1);
        setTimeout(() => this.playTone(554, 0.1), 100); // C#
        setTimeout(() => this.playTone(659, 0.3), 200); // E
    }

    playFail() {
        this.playTone(150, 0.3, 'sawtooth');
    }
}
