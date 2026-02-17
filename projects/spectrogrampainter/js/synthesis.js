/**
 * Core Logic for converting Image Data to Audio Buffer
 * Uses Additive Synthesis principles
 */
import { Utils } from './utils.js';

export class Synthesizer {
    constructor(audioEngine) {
        this.engine = audioEngine;
        this.settings = {
            duration: 4.0, // seconds
            minFreq: 100,
            maxFreq: 10000,
            logScale: true
        };
    }

    updateSettings(settings) {
        this.settings = { ...this.settings, ...settings };
    }

    /**
     * Generates an AudioBuffer from the provided ImageData
     * @param {ImageData} imageData 
     * @returns {Promise<AudioBuffer>}
     */
    async generateAudio(imageData) {
        if (!this.engine.initialized) this.engine.init();

        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        const sampleRate = this.engine.getSampleRate();
        const totalSamples = Math.floor(this.settings.duration * sampleRate);

        // Create Mono Buffer
        const audioBuffer = this.engine.createBuffer(1, totalSamples, sampleRate);
        const channelData = audioBuffer.getChannelData(0);

        // Pre-calculate frequencies for each row to save perf
        const rowFreqs = new Float32Array(height);
        for (let y = 0; y < height; y++) {
            // y=0 is top, high freq. y=height is bottom, low freq.
            // But Utils.yToFreq expects y coordinate. 
            // Let's pass the index directly and handle mapping carefully.
            // Using center of pixel row? 
            rowFreqs[y] = Utils.yToFreq(y + 0.5, this.settings.minFreq, this.settings.maxFreq, height, this.settings.logScale);
        }

        console.log(`Starting Synthesis: ${width}x${height} Image, ${this.settings.duration}s`);

        // --- Additive Synthesis Strategy ---
        // Iterate through time samples. 
        // Map sample index -> x coordinate in image.
        // For that column X, sum up sine waves for all Y where pixel is bright.

        // Optimization: Instead of 44100 * duration pixels lookups, we only look up pixels 'width' times.
        // We can interpolate between columns, but for pixel art style, strict column mapping is fine.
        // However, a 800px width image over 4 seconds = 200 pixels/sec. 
        // Audio has 44100 samples/sec. So ~220 samples per pixel column.

        const samplesPerPixel = totalSamples / width;

        // Outer loop: Image Columns (Time)
        // We process the audio buffer in chunks corresponding to image columns to reduce inner loop overhead
        // BUT strict column jumps cause clicking. We should smooth/interpolate amplitude.
        // For simplicity v1: Linear crossfade between columns?
        // Or simpler: Just calculate sample by sample, mapping sample_t to x.

        const PI2 = Math.PI * 2;
        let p = 0; // phase accumulator would be needed for EACH frequency if we did stateful synthesis.
        // Stateless synthesis (calc phase from time) is easier but can click if freq changes. 
        // Here Freq is constant for a given Row Y. Phase is just t * freq. So stateless is fine used per row.

        // To avoid massive lag, we can sum oscillators.
        // But 400 rows * 44100 samples = 17 million iterations per second of audio. Too slow for JS main thread?
        // 4s = 70 million ops. Might block UI.
        // We can optimize: Only process rows with brightness > threshold.

        // Build a sparse representation of the image first
        // x -> [ { freq, amp }, { freq, amp } ... ]
        const sparseData = [];
        for (let x = 0; x < width; x++) {
            const activeOscillators = [];
            for (let y = 0; y < height; y++) {
                // Pixel index: (y * width + x) * 4 (RGBA)
                const idx = (y * width + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                // Simple brightness: average or max? Max is safer for neon colors.
                const brightness = Math.max(r, g, b) / 255.0;

                if (brightness > 0.05) { // Noise floor
                    activeOscillators.push({
                        freq: rowFreqs[y],
                        amp: brightness
                    });
                }
            }
            sparseData[x] = activeOscillators;
        }

        // Now fill the buffer
        for (let i = 0; i < totalSamples; i++) {
            const t = i / sampleRate; // Time in seconds

            // Map time to X coordinate
            // t goes 0 -> duration
            // x goes 0 -> width
            const exactX = (t / this.settings.duration) * width;
            let currentX = Math.floor(exactX);
            // Clamp
            if (currentX >= width) currentX = width - 1;

            // Basic implementation: No interpolation between columns for now (pixelated sound)
            const oscillators = sparseData[currentX];

            let sampleValue = 0;
            const oscCount = oscillators.length;

            if (oscCount > 0) {
                // Sum sines
                for (let k = 0; k < oscCount; k++) {
                    const osc = oscillators[k];
                    // Wave = Amp * sin(2 * PI * freq * t)
                    // Random phase? Random phase helps prevent constructive interference spikes (clipping)
                    // For now, fixed phase.
                    sampleValue += osc.amp * Math.sin(PI2 * osc.freq * t);
                }
                // Normalize by sqrt(count) or some factor to prevent clipping?
                // Or just hard limits. 
                // With many oscillators, amplitude can get huge. 
                // Let's divide by a factor related to canvas height or max simultaneous "voices" expected.
                // A safe dynamic compression is better but expensive.
                // Fixed scaling:
                sampleValue /= Math.sqrt(oscCount + 10);
            }

            channelData[i] = sampleValue;
        }

        // Simple Limiter/Normalization pass to ensure we use full range but don't clip hard
        // Find max peak
        let maxPeak = 0;
        for (let i = 0; i < totalSamples; i++) {
            const abs = Math.abs(channelData[i]);
            if (abs > maxPeak) maxPeak = abs;
        }

        // Normalize to ~0.9 if too quiet or too loud
        if (maxPeak > 0.001) {
            const gain = 0.95 / maxPeak;
            for (let i = 0; i < totalSamples; i++) {
                channelData[i] *= gain;
            }
        }

        return audioBuffer;
    }
}
