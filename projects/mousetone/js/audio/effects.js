/**
 * File: js/audio/effects.js
 * MouseTone Module
 * Copyright (c) 2026
 * 
 * Manages the audio effects chain including Compressor, Delay, and Reverb.
 */
export class AudioEffects {
    /**
     * @param {AudioContext} ctx 
     */
    constructor(ctx) {
        this.ctx = ctx;
        this.input = ctx.createGain();
        this.output = ctx.createGain();

        // Compressor (Always on to prevent clipping)
        this.compressor = ctx.createDynamicsCompressor();
        this.compressor.threshold.value = -24;
        this.compressor.knee.value = 30;
        this.compressor.ratio.value = 12;
        this.compressor.attack.value = 0.003;
        this.compressor.release.value = 0.25;

        // Delay
        this.delay = ctx.createDelay(5.0);
        this.delay.delayTime.value = 0.3;
        this.delayFeedback = ctx.createGain();
        this.delayFeedback.gain.value = 0.4;
        this.delayGain = ctx.createGain();
        this.delayGain.gain.value = 0.0; // Dry by default

        // Reverb (Convolver)
        this.convolver = ctx.createConvolver();
        this.reverbGain = ctx.createGain();
        this.reverbGain.gain.value = 0.0; // Dry by default

        // Routing
        this.input.connect(this.compressor);

        // Dry path
        this.compressor.connect(this.output);

        // Delay path
        this.compressor.connect(this.delay);
        this.delay.connect(this.delayFeedback);
        this.delayFeedback.connect(this.delay);
        this.delay.connect(this.delayGain);
        this.delayGain.connect(this.output);

        // Reverb path
        this.compressor.connect(this.convolver);
        this.convolver.connect(this.reverbGain);
        this.reverbGain.connect(this.output);

        // Generate simple impulse response for reverb
        this.generateImpulseResponse();
    }

    /**
     * Generates a synthetic impulse response for the convolver reverb.
     * Uses random noise with an exponential decay envelope.
     */
    generateImpulseResponse() {
        const rate = this.ctx.sampleRate;
        const length = rate * 2.0; // 2 seconds
        const decay = 2.0;
        const impulse = this.ctx.createBuffer(2, length, rate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);

        for (let i = 0; i < length; i++) {
            // Noise decay
            const n = length - i;
            left[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
            right[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
        }
        this.convolver.buffer = impulse;
    }

    /**
     * Updates the Delay parameters.
     * @param {number} time - Delay time in seconds (e.g. 0.3).
     * @param {number} feedback - Feedback amount (0-1).
     * @param {number} mix - Wet mix amount (0-1).
     */
    setDelay(time, feedback, mix) {
        this.delay.delayTime.setTargetAtTime(time, this.ctx.currentTime, 0.1);
        this.delayFeedback.gain.setTargetAtTime(feedback, this.ctx.currentTime, 0.1);
        this.delayGain.gain.setTargetAtTime(mix, this.ctx.currentTime, 0.1);
    }

    /**
     * Updates the Reverb mix.
     * @param {number} mix - Reverb amount (0-1).
     */
    setReverb(mix) {
        this.reverbGain.gain.setTargetAtTime(mix, this.ctx.currentTime, 0.1);
    }
}
