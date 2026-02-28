/**
 * Modulator.js
 * Encapsulates the FSK (Frequency Shift Keying) modulation logic.
 * Responsible for playing a sequence of bits as audio tones.
 * 
 * Part of the AudioModem Project.
 */

class Modulator {
    constructor(audioEngine) {
        this.audioEngine = audioEngine;
        this.isPlaying = false;

        // FSK Parameters
        this.freq0 = 1200; // Hz for binary 0
        this.freq1 = 2200; // Hz for binary 1
        this.baudRate = 10; // Bits per second (Low for high reliability)
        this.bitDuration = 1 / this.baudRate;

        this.queue = [];
        this.timer = null;
        this.onComplete = null;
        this.onBitStart = null;
    }

    /**
     * Transmits an array of bits as audio.
     * @param {number[]} bits - Array of 0s and 1s.
     * @param {Function} callback - Called when transmission ends.
     */
    transmit(bits, onBitStart = null, onComplete = null) {
        if (this.isPlaying) return;

        this.isPlaying = true;
        this.queue = [...bits];
        this.onBitStart = onBitStart;
        this.onComplete = onComplete;

        this.audioEngine.initialize().then(() => {
            this.processNextBit();
        });
    }

    /**
     * Processes the next bit in the queue.
     */
    processNextBit() {
        if (this.queue.length === 0) {
            this.stop();
            return;
        }

        const bit = this.queue.shift();
        const frequency = bit === 1 ? this.freq1 : this.freq0;

        if (this.onBitStart) {
            this.onBitStart(bit, this.queue.length);
        }

        // Start the tone for this bit
        if (this.audioEngine.oscillator === null) {
            this.audioEngine.playTone(frequency);
        } else {
            this.audioEngine.setFrequency(frequency);
        }

        // Schedule next bit
        this.timer = setTimeout(() => {
            this.processNextBit();
        }, this.bitDuration * 1000);
    }

    /**
     * Stops current transmission.
     */
    stop() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }

        this.audioEngine.stopTone();
        this.isPlaying = false;
        this.queue = [];

        if (this.onComplete) {
            this.onComplete();
        }
    }

    /**
     * Configures modulator parameters.
     * @param {Object} params 
     */
    setParameters({ freq0, freq1, baudRate }) {
        if (freq0) this.freq0 = freq0;
        if (freq1) this.freq1 = freq1;
        if (baudRate) {
            this.baudRate = baudRate;
            this.bitDuration = 1 / baudRate;
        }
    }
}

window.modulator = new Modulator(window.audioEngine);
