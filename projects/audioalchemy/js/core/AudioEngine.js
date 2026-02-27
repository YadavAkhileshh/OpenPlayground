/**
 * AudioEngine Singleton.
 * Manages the global AudioContext and master output chain.
 * Handles the creation of the context, the master limiter to prevent clipping,
 * and the analyser node for visualization.
 */
export class AudioEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.limiter = null;
        this.analyser = null;
        this.isRunning = false;
    }

    async init() {
        if (this.ctx) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        // Master Output Chain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.5; // Default volume

        // Limiter to prevent clipping
        this.limiter = this.ctx.createDynamicsCompressor();
        this.limiter.threshold.value = -1;
        this.limiter.knee.value = 40;
        this.limiter.ratio.value = 12;
        this.limiter.attack.value = 0.003;
        this.limiter.release.value = 0.25;

        // Analyser for visualization
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 2048;

        // Connect chain: MasterGain -> Limiter -> Analyser -> Destination
        this.masterGain.connect(this.limiter);
        this.limiter.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);

        // Resume context if suspended (browser autoplay policy)
        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }

        this.isRunning = true;
        console.log("Audio Engine Initialized at", this.ctx.sampleRate, "Hz");
    }

    get time() {
        return this.ctx ? this.ctx.currentTime : 0;
    }

    createOscillator() { return this.ctx.createOscillator(); }
    createGain() { return this.ctx.createGain(); }
    createBiquadFilter() { return this.ctx.createBiquadFilter(); }
    createConstantSource() {
        if (this.ctx.createConstantSource) {
            return this.ctx.createConstantSource();
        } else {
            // Polyfill for older Safari
            const buff = this.ctx.createBuffer(1, 1, this.ctx.sampleRate);
            buff.getChannelData(0)[0] = 1;
            const src = this.ctx.createBufferSource();
            src.buffer = buff;
            src.loop = true;
            return src;
        }
    }
}

export const audioCtx = new AudioEngine();
