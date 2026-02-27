/**
 * @file audio.js
 * @description Real-time audio synthesis for wind tunnel sonification.
 * Uses Web Audio API to generate wind noise based on flow speed and turbulence.
 */

export class WindAudio {
    constructor() {
        this.ctx = null;
        this.noiseNode = null;
        this.gainNode = null;
        this.filterNode = null;
        this.active = false;

        // Initialize on first user interaction to handle autoplay policy
        this.init();
    }

    init() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();

            // Create White Noise Buffer
            const bufferSize = 2 * this.ctx.sampleRate;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            // Source
            this.noiseNode = this.ctx.createBufferSource();
            this.noiseNode.buffer = buffer;
            this.noiseNode.loop = true;

            // Filter (Lowpass for wind "whoosh")
            this.filterNode = this.ctx.createBiquadFilter();
            this.filterNode.type = 'lowpass';
            this.filterNode.frequency.value = 400;

            // Gain (Volume)
            this.gainNode = this.ctx.createGain();
            this.gainNode.gain.value = 0;

            // Chain
            this.noiseNode.connect(this.filterNode);
            this.filterNode.connect(this.gainNode);
            this.gainNode.connect(this.ctx.destination);

            this.noiseNode.start(0);
            this.active = true;
            console.log("Audio Engine Initialized.");

        } catch (e) {
            console.error("Web Audio API not supported", e);
        }
    }

    /**
     * Update audio parameters based on simulation state.
     * @param {number} speed - Average flow speed (0.0 - 0.2 typically)
     * @param {number} turbulence - Turbulence intensity (optional)
     */
    update(speed, turbulence = 0) {
        if (!this.active || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        // Map speed to volume and cutoff frequency
        // Speed range: 0.0 to 0.15

        const normSpeed = Math.min(speed / 0.15, 1.0);

        // Volume: Quadratic scale
        const targetVol = normSpeed * normSpeed * 0.5;
        this.gainNode.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.1);

        // Frequency: 200Hz -> 1200Hz
        const targetFreq = 200 + normSpeed * 1000;
        this.filterNode.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);

        // Q factor randomization for turbulence feel?
        // this.filterNode.Q.value = turbulence * 10;
    }

    stop() {
        if (this.gainNode) this.gainNode.gain.value = 0;
    }
}
