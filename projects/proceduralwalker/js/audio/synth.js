/**
 * AudioSynth Class
 * Generates procedural sound effects using Web Audio API.
 */
class AudioSynth {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3; // Lower volume
        this.masterGain.connect(this.ctx.destination);
    }

    resume() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    /**
     * Plays a procedural step sound.
     * @param {string} type - 'metal' | 'ground'
     */
    playStep(type = 'metal') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        const time = this.ctx.currentTime;

        if (type === 'metal') {
            // Metallic Clank
            osc.type = 'square';
            osc.frequency.setValueAtTime(MathUtils.randomRange(200, 400), time);
            osc.frequency.exponentialRampToValueAtTime(50, time + 0.1);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(3000, time);
            filter.frequency.exponentialRampToValueAtTime(100, time + 0.1);

            gain.gain.setValueAtTime(0.5, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

            osc.start(time);
            osc.stop(time + 0.1);
        } else {
            // Thud
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(100, time);
            osc.frequency.exponentialRampToValueAtTime(20, time + 0.15);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(500, time);

            gain.gain.setValueAtTime(0.8, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

            osc.start(time);
            osc.stop(time + 0.2);
        }
    }

    playAmbience() {
        // Drone sound
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(50, this.ctx.currentTime);

        gain.gain.value = 0.05;

        osc.start();
        // Keep playing
    }
}
