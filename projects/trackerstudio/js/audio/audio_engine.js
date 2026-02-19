/**
 * audio_engine.js
 * Core AudioContext wrapper and master signal chain.
 * Features: Master gain, analyser for oscilloscope + spectrum.
 */
export class AudioEngine {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();

        // Master gain node
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.8;

        // Analyser for oscilloscope
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 2048;
        this.analyser.smoothingTimeConstant = 0.8;

        // Analyser for spectrum
        this.spectrumAnalyser = this.ctx.createAnalyser();
        this.spectrumAnalyser.fftSize = 256;
        this.spectrumAnalyser.smoothingTimeConstant = 0.75;

        // Signal chain: MasterGain -> Analyser -> SpectrumAnalyser -> Destination
        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.spectrumAnalyser);
        this.spectrumAnalyser.connect(this.ctx.destination);

        this.isPlaying = false;
    }

    async init() {
        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
    }

    get time() {
        return this.ctx.currentTime;
    }

    setMasterVolume(val) {
        this.masterGain.gain.setTargetAtTime(
            Math.max(0, Math.min(1, val)),
            this.ctx.currentTime,
            0.01
        );
    }
}
