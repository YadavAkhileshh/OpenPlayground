/**
 * Audio Engine: Handles Web Audio API processing and frequency analysis.
 */

class AudioEngine {
    constructor() {
        this.ctx = null;
        this.analyser = null;
        this.source = null;
        this.dataArray = null;
        this.isPlaying = false;
        this.audioElement = new Audio();

        this.onFrequenciesUpdate = null; // Callback for rendering
    }

    init() {
        if (this.ctx && this.ctx.state !== 'closed') return;

        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.ctx.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.8;

            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);

            // Important: Allow cross-origin for analysis
            this.audioElement.crossOrigin = "anonymous";

            if (!this.source) {
                this.source = this.ctx.createMediaElementSource(this.audioElement);
                this.source.connect(this.analyser);
                this.analyser.connect(this.ctx.destination);
                console.log("AUDIO_ENGINE::INITIALIZED_SYSTEM_ROUTING");
            }
        } catch (e) {
            console.error("AUDIO_ENGINE::CRITICAL_FAILURE", e);
        }
    }

    loadTrack(file) {
        return new Promise((resolve, reject) => {
            if (this.audioElement.src) {
                URL.revokeObjectURL(this.audioElement.src);
            }
            const url = URL.createObjectURL(file);
            this.audioElement.src = url;
            this.audioElement.load();
            this.audioElement.oncanplay = () => {
                console.log("AUDIO_ENGINE::STREAM_READY");
                resolve(file.name);
            };
            this.audioElement.onerror = () => reject('ERROR_LOADING_FREQUENCY_STREAM');
        });
    }

    async play() {
        if (!this.ctx) this.init();
        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
        this.audioElement.play().catch(e => console.warn("PLAYBACK_DEFERRED", e));
        this.isPlaying = true;
    }

    pause() {
        this.audioElement.pause();
        this.isPlaying = false;
    }

    getFrequencyData() {
        if (!this.analyser) return null;
        this.analyser.getByteFrequencyData(this.dataArray);
        return this.dataArray;
    }

    // Returns a smoothed average of frequencies in specific bands
    getAudioStats() {
        const data = this.getFrequencyData();
        if (!data) return { bass: 0, mid: 0, high: 0, avg: 0 };

        const bass = data.slice(0, 10).reduce((a, b) => a + b) / 10;
        const mid = data.slice(10, 40).reduce((a, b) => a + b) / 30;
        const high = data.slice(40, 100).reduce((a, b) => a + b) / 60;
        const avg = data.reduce((a, b) => a + b) / data.length;

        return { bass, mid, high, avg };
    }
}

export const audioEngine = new AudioEngine();
