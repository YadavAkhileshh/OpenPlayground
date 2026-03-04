/**
 * AUDIO ENGINE
 * Handles microphone input, FFT analysis, and Pitch Detection.
 */

class AudioEngine {
    constructor() {
        this.audioCtx = null;
        this.analyser = null;
        this.microphone = null;
        this.isInitialized = false;
        
        this.fftSize = 2048;
        this.sampleRate = 0;
        this.freqData = null;
        this.timeData = null;
        
        this.currentPitch = 0;
        this.pitchBuffer = [];
        this.bufferSize = 5; // For smoothing
        
        // Whistle range configuration (Hz)
        this.minPitch = 500;
        this.maxPitch = 2500;
        this.minVolume = -50; // dB
    }

    async initialize() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.sampleRate = this.audioCtx.sampleRate;
            
            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = this.fftSize;
            this.analyser.smoothingTimeConstant = 0.8;
            
            this.microphone = this.audioCtx.createMediaStreamSource(stream);
            this.microphone.connect(this.analyser);
            
            this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
            this.timeData = new Float32Array(this.analyser.fftSize);
            
            this.isInitialized = true;
            console.log("Audio Engine Initialized at", this.sampleRate, "Hz");
            return true;
        } catch (err) {
            console.error("Audio initialization failed:", err);
            return false;
        }
    }

    getPitch() {
        if (!this.isInitialized) return 0;

        this.analyser.getFloatTimeDomainData(this.timeData);
        
        // Check volume - filter out silence
        if (this.getRMS() < 0.01) return 0;

        // Use Autocorrelation for pitch detection
        const pitch = this.autoCorrelate(this.timeData, this.sampleRate);
        
        if (pitch > this.minPitch && pitch < this.maxPitch) {
            // Smooth the pitch
            this.pitchBuffer.push(pitch);
            if (this.pitchBuffer.length > this.bufferSize) this.pitchBuffer.shift();
            
            this.currentPitch = this.pitchBuffer.reduce((a, b) => a + b) / this.pitchBuffer.length;
            return this.currentPitch;
        }
        
        return 0;
    }

    getFrequencyData() {
        if (!this.isInitialized) return new Uint8Array(0);
        this.analyser.getByteFrequencyData(this.freqData);
        return this.freqData;
    }

    getRMS() {
        let sum = 0;
        for (let i = 0; i < this.timeData.length; i++) {
            sum += this.timeData[i] * this.timeData[i];
        }
        return Math.sqrt(sum / this.timeData.length);
    }

    /**
     * Pitch detection algorithm: Autocorrelation
     * Finds the fundamental frequency by looking for periodic patterns
     */
    autoCorrelate(buf, sampleRate) {
        let SIZE = buf.length;
        let MAX_SAMPLES = Math.floor(SIZE / 2);
        let best_offset = -1;
        let best_correlation = 0;
        let rms = 0;
        let foundGoodTarget = false;
        let correlations = new Array(MAX_SAMPLES);

        for (let i = 0; i < SIZE; i++) {
            let val = buf[i];
            rms += val * val;
        }
        rms = Math.sqrt(rms / SIZE);
        if (rms < 0.01) return -1;

        let lastCorrelation = 1;
        for (let offset = 0; offset < MAX_SAMPLES; offset++) {
            let correlation = 0;

            for (let i = 0; i < MAX_SAMPLES; i++) {
                correlation += Math.abs((buf[i]) - (buf[i + offset]));
            }
            correlation = 1 - (correlation / MAX_SAMPLES);
            correlations[offset] = correlation;

            if ((correlation > 0.9) && (correlation > lastCorrelation)) {
                foundGoodTarget = true;
                if (correlation > best_correlation) {
                    best_correlation = correlation;
                    best_offset = offset;
                }
            } else if (foundGoodTarget) {
                let shift = (correlations[best_offset + 1] - correlations[best_offset - 1]) / correlations[best_offset];
                return sampleRate / (best_offset + (8 * shift));
            }
            lastCorrelation = correlation;
        }
        if (best_correlation > 0.01) {
            return sampleRate / best_offset;
        }
        return -1;
    }
}

window.AudioEngine = AudioEngine;
