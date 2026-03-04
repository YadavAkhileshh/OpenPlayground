/**
 * Manages the Web Audio API context and nodes
 */
export class AudioEngine {
    constructor() {
        this.ctx = null;
        this.initialized = false;
        this.masterGain = null;
        this.sourceNode = null;
        this.analyser = null;
    }

    init() {
        if (this.initialized) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.5; // Prevent clipping
        this.masterGain.connect(this.ctx.destination);

        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 2048;
        this.masterGain.connect(this.analyser); // Connect master to analyser for visualization

        this.initialized = true;
        console.log("Audio Engine Initialized");
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    /**
     * Play an audio buffer
     * @param {AudioBuffer} buffer 
     * @param {number} startTime 
     */
    playBuffer(buffer, onEndedCallback) {
        this.stop(); // Stop any existing sound

        this.sourceNode = this.ctx.createBufferSource();
        this.sourceNode.buffer = buffer;
        this.sourceNode.connect(this.masterGain);

        this.sourceNode.onended = () => {
            if (onEndedCallback) onEndedCallback();
            this.sourceNode = null;
        };

        this.sourceNode.start();
    }

    stop() {
        if (this.sourceNode) {
            try {
                this.sourceNode.stop();
            } catch (e) {
                // Ignore errors if already stopped
            }
            this.sourceNode.disconnect();
            this.sourceNode = null;
        }
    }

    createBuffer(channels, length, sampleRate) {
        return this.ctx.createBuffer(channels, length, sampleRate);
    }

    getSampleRate() {
        return this.ctx ? this.ctx.sampleRate : 44100;
    }

    getAnalyserData(array) {
        if (this.analyser) {
            this.analyser.getByteTimeDomainData(array);
        }
    }
}
