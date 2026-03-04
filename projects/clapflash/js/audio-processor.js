import { Utils, CONSTANTS } from './utils.js';

class AudioProcessor {
    constructor() {
        this.ctx = null;
        this.analyser = null;
        this.mic = null;
        this.isRunning = false;
        this.threshold = CONSTANTS.DEFAULT_THRESHOLD;

        // Data Buffers
        this.freqData = null;
        this.timeData = null;

        // State
        this.prevAmp = 0;
        this.noiseFloor = 0.1;

        // Callbacks
        this.onStrike = null;
        this.onLevel = null;
        this.onDraw = null;
    }

    async init() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
            });

            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.mic = this.ctx.createMediaStreamSource(stream);
            this.analyser = this.ctx.createAnalyser();

            this.analyser.fftSize = CONSTANTS.FFT_SIZE;
            this.analyser.smoothingTimeConstant = CONSTANTS.SMOOTHING_TIME;

            this.mic.connect(this.analyser);

            this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
            this.timeData = new Uint8Array(this.analyser.fftSize);

            this.isRunning = true;
            this.loop();
            return true;
        } catch (e) {
            Utils.log('Mic denied: ' + e.message, 'error');
            return false;
        }
    }

    loop() {
        if (!this.isRunning) return;

        this.analyser.getByteFrequencyData(this.freqData);
        this.analyser.getByteTimeDomainData(this.timeData);

        // Calculate Amplitude (RMS-ish)
        let sum = 0;
        for (let i = 0; i < this.timeData.length; i++) {
            const v = (this.timeData[i] - 128) / 128;
            sum += v * v;
        }
        const amp = Math.sqrt(sum / this.timeData.length) * 2.5;
        const normalizedAmp = Utils.clamp(amp, 0, 1);

        // --- SPECTRAL CLAP DETECTION ---
        // Claps are heavy in the 2kHz - 8kHz range
        // frequencyBinCount = fftSize / 2 (e.g., 1024)
        // sampleRate = Usually 44100 or 48000
        // binFreq = i * sampleRate / fftSize
        // For 48k/2048: each bin is ~23Hz. 2kHz is around bin 85.

        let highFreqEnergy = 0;
        const startBin = Math.floor(2000 * this.analyser.fftSize / this.ctx.sampleRate);
        const endBin = Math.floor(8000 * this.analyser.fftSize / this.ctx.sampleRate);

        for (let i = startBin; i <= endBin; i++) {
            highFreqEnergy += this.freqData[i];
        }
        const spectralIntensity = (highFreqEnergy / (endBin - startBin + 1)) / 255;

        // Logic check
        const delta = Utils.getDelta(normalizedAmp, this.prevAmp);
        const isSpike = delta > CONSTANTS.SPIKE_DELTA;
        const isLoud = normalizedAmp > this.threshold;
        const isCrisp = spectralIntensity > 0.3; // High frequency content check

        if (isLoud && isSpike && isCrisp) {
            if (this.onStrike) this.onStrike({ intensity: normalizedAmp, crispness: spectralIntensity });
        }

        // Reporting
        if (this.onLevel) this.onLevel(normalizedAmp);
        if (this.onDraw) this.onDraw(this.timeData, this.freqData);

        this.prevAmp = normalizedAmp;
        requestAnimationFrame(() => this.loop());
    }

    toggle(state) {
        this.isRunning = state;
        if (state && this.ctx?.state === 'suspended') this.ctx.resume();
        if (state) this.loop();
    }

    setThreshold(v) {
        this.threshold = Utils.clamp(v, CONSTANTS.MIN_THRESHOLD, 1);
    }
}

export const Audio = new AudioProcessor();
