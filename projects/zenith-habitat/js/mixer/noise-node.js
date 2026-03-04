/**
 * Generates procedural noise (White, Pink, Brown) using a ScriptProcessor or AudioBuffer.
 * This avoids loading large files for static/noise.
 */
export default class NoiseNode {
    constructor(ctx, type = 'white') {
        this.ctx = ctx;
        this.type = type;
        this.node = null;
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.value = 0;
    }

    setup() {
        const bufferSize = 2 * this.ctx.sampleRate; // 2 seconds buffer
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        if (this.type === 'white') {
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
        } else if (this.type === 'pink') {
            let b0, b1, b2, b3, b4, b5, b6;
            b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168981;
                data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                data[i] *= 0.11; // (roughly) compensate for gain
                b6 = white * 0.115926;
            }
        } else if (this.type === 'brown') {
            let lastOut = 0.0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                data[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = data[i];
                data[i] *= 3.5;
            }
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(this.gainNode);
        source.start(0);
        this.node = source;
    }

    connect(destination) {
        this.gainNode.connect(destination);
    }

    setVolume(value) {
        // Smooth transition
        this.gainNode.gain.setTargetAtTime(value, this.ctx.currentTime, 0.1);

        // Lazy init
        if (!this.node && value > 0) {
            this.setup();
        }
    }
}
