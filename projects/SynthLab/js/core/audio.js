/**
 * Singleton Audio Engine
 * Wraps the Web Audio API Context and handles global state.
 */
class AudioEngine {
    constructor() {
        this.context = null;
        this.isRunning = false;
        
        // Master Output Node (Limiter/Compressor)
        this.masterGain = null;
        this.analyser = null;
    }

    init() {
        if (this.context) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioContext();

        // Master Chain: Nodes -> MasterGain -> Analyser -> Destination
        this.masterGain = this.context.createGain();
        this.masterGain.gain.value = 0.8; // Headroom

        this.analyser = this.context.createAnalyser();
        this.analyser.fftSize = 2048;

        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.context.destination);
    }

    async resume() {
        if (!this.context) this.init();
        if (this.context.state === 'suspended') {
            await this.context.resume();
        }
        this.isRunning = true;
    }

    suspend() {
        if (this.context) {
            this.context.suspend();
            this.isRunning = false;
        }
    }

    get currentTime() {
        return this.context ? this.context.currentTime : 0;
    }
}

export const audioCtx = new AudioEngine();