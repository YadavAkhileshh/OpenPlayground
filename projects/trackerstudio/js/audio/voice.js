/**
 * voice.js
 * SampleLoader: Manages audio buffers (synthesized chip waveforms).
 * Voice: Fires a single note with pitch shifting, volume, and effects.
 * Feature: 5 built-in chip synth instruments (Square, Saw, Triangle, Noise, Sine).
 */

export class SampleLoader {
    constructor(ctx) {
        this.ctx = ctx;
        this.samples = new Map();
    }

    /**
     * Generate a chip-synth waveform buffer at a given base frequency.
     * @param {string} type - 'square'|'sawtooth'|'triangle'|'noise'|'sine'
     * @param {number} freq - Base frequency in Hz (default C4 = 261.63)
     * @param {number} duration - Duration in seconds
     */
    generateWaveform(type, freq = 261.63, duration = 0.5) {
        const sr = this.ctx.sampleRate;
        const len = Math.floor(sr * duration);
        const buffer = this.ctx.createBuffer(1, len, sr);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < len; i++) {
            const t = i / sr;
            const phase = (t * freq) % 1.0; // 0..1 sawtooth phase
            let sample = 0;

            switch (type) {
                case 'square':
                    sample = phase < 0.5 ? 0.25 : -0.25;
                    break;
                case 'sawtooth':
                    sample = (phase * 2 - 1) * 0.2;
                    break;
                case 'triangle':
                    sample = (phase < 0.5 ? phase * 4 - 1 : 3 - phase * 4) * 0.25;
                    break;
                case 'noise':
                    sample = (Math.random() * 2 - 1) * 0.15;
                    break;
                case 'sine':
                    sample = Math.sin(t * freq * 2 * Math.PI) * 0.25;
                    break;
                default:
                    sample = Math.sin(t * freq * 2 * Math.PI) * 0.25;
            }

            // Amplitude envelope: fast attack, exponential decay
            const env = Math.exp(-t * 4.0);
            data[i] = sample * env;
        }

        return buffer;
    }

    /**
     * Pre-generate all 5 instrument buffers and store them.
     */
    generateAllInstruments() {
        const types = ['square', 'sawtooth', 'triangle', 'noise', 'sine'];
        types.forEach((type, idx) => {
            const buf = this.generateWaveform(type);
            this.samples.set(`inst${idx + 1}`, buf);
        });
    }

    get(name) {
        return this.samples.get(name) || null;
    }
}

/**
 * Voice: A single triggered note instance.
 * Supports playbackRate for pitch shifting (resampling).
 */
export class Voice {
    constructor(ctx, destination) {
        this.ctx = ctx;
        this.destination = destination;
        this.source = null;
        this.gainNode = null;
    }

    /**
     * Trigger a note.
     * @param {AudioBuffer} buffer - The sample buffer
     * @param {number} pitch - Playback rate (1.0 = original pitch)
     * @param {number} volume - 0.0 to 1.0
     * @param {number} startTime - AudioContext time to start
     */
    trigger(buffer, pitch = 1.0, volume = 1.0, startTime = 0) {
        this.stop();

        this.source = this.ctx.createBufferSource();
        this.source.buffer = buffer;
        this.source.playbackRate.value = Math.max(0.01, pitch);

        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.value = Math.max(0, Math.min(1, volume));

        this.source.connect(this.gainNode);
        this.gainNode.connect(this.destination);

        this.source.start(startTime);
        this.source.onended = () => { this.source = null; };
    }

    stop() {
        if (this.source) {
            try { this.source.stop(); } catch (e) { /* already stopped */ }
            this.source = null;
        }
    }
}
