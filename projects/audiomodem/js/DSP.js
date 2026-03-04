/**
 * DSP.js
 * Digital Signal Processing utilities for AudioModem.
 * Includes windowing functions and specialized filters.
 * 
 * Part of the AudioModem Project.
 */

class DSP {
    /**
     * Applies a Hamming window to a buffer.
     * Prevents spectral leakage in FFT analysis.
     * @param {Float32Array|Uint8Array} buffer 
     * @returns {Float32Array}
     */
    static applyHammingWindow(buffer) {
        const n = buffer.length;
        const result = new Float32Array(n);
        for (let i = 0; i < n; i++) {
            const multiplier = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (n - 1));
            result[i] = buffer[i] * multiplier;
        }
        return result;
    }

    /**
     * Low-pass filter implementation.
     * @param {number[]} data 
     * @param {number} alpha - Smoothing factor (0-1).
     */
    static lowPass(data, alpha = 0.5) {
        const result = new Float32Array(data.length);
        result[0] = data[0];
        for (let i = 1; i < data.length; i++) {
            result[i] = alpha * data[i] + (1 - alpha) * result[i - 1];
        }
        return result;
    }

    /**
     * Decibel conversion from linear status.
     * @param {number} linear 
     */
    static toDecibels(linear) {
        return 20 * Math.log10(linear + 1e-6);
    }

    /**
     * Calculates the Root Mean Square (RMS) of a signal.
     * @param {Uint8Array} buffer 
     */
    static rms(buffer) {
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
            const val = (buffer[i] - 128) / 128; // Normalize to -1..1
            sum += val * val;
        }
        return Math.sqrt(sum / buffer.length);
    }

    /**
     * Specialized FSK Signal Filter.
     * Enhances frequencies around specific tones.
     */
    static fskEnhance(data, bin0, bin1, width = 5) {
        const result = new Uint8Array(data);
        for (let i = 0; i < data.length; i++) {
            if (Math.abs(i - bin0) < width || Math.abs(i - bin1) < width) {
                // Boost focal frequencies
                result[i] = Math.min(255, result[i] * 1.5);
            } else {
                // Attenuate noise
                result[i] = result[i] * 0.8;
            }
        }
        return result;
    }
}

window.dsp = DSP;
