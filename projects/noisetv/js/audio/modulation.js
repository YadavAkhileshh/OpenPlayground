/**
 * AudioModulation - Advanced audio effects and LFOs.
 */
export class AudioModulation {
    /**
     * Creates a Pink Noise buffer (1/f noise).
     */
    static createPinkNoise(ctx, duration = 2) {
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);

        let b0, b1, b2, b3, b4, b5, b6;
        b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750312;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            output[i] *= 0.11; // estimate
            b6 = white * 0.115926;
        }
        return buffer;
    }

    /**
     * Creates a Brownian Noise buffer (1/f² noise).
     */
    static createBrownianNoise(ctx, duration = 2) {
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);

        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            const out = (lastOut + (0.02 * white)) / 1.02;
            output[i] = out * 3.5; // volume adjustment
            lastOut = out;
        }
        return buffer;
    }

    /**
     * Simple low frequency oscillator for frequency drift.
     */
    static setupDrift(ctx, targetParam, intensity) {
        const lfo = ctx.createOscillator();
        const gain = ctx.createGain();

        lfo.frequency.value = 0.5; // 0.5Hz drift
        gain.gain.value = intensity * 100; // Drift amount in Hz

        lfo.connect(gain);
        gain.connect(targetParam);
        lfo.start();

        return { lfo, gain };
    }
}
