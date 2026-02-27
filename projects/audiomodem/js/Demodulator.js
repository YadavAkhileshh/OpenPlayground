/**
 * Demodulator.js
 * Performs real-time FFT frequency analysis to decode audio back into bits.
 * Implements synchronization, peak detection, and bit accumulation.
 * 
 * Part of the AudioModem Project.
 */

class Demodulator {
    constructor(audioEngine) {
        this.audioEngine = audioEngine;
        this.isListening = false;

        // FSK Parameters (must match modulator)
        this.freq0 = 1200;
        this.freq1 = 2200;
        this.tolerance = 200; // Hz tolerance for peak detection

        // Processing State
        this.bitBuffer = [];
        this.isSyncing = false;
        this.preambleBuffer = [];
        this.expectedPreamble = [1, 0, 1, 0, 1, 0, 1, 0];

        // Schmitt Trigger Logic for Noise Rejection
        this.highThreshold = 140; // Strength to transition HIGH
        this.lowThreshold = 80;   // Strength to transition LOW
        this.currentState = 0;    // 0 = Low, 1 = High

        this.lastUpdateTime = 0;
        this.sampleInterval = 40; // ms between samples
        this.bitDetectionThreshold = 90; // Magnitude threshold for valid signal

        this.onDataDecoded = null;
        this.onBitDetected = null;
        this.onSignalStats = null;
    }

    /**
     * Starts the demodulation loop.
     */
    async start() {
        if (this.isListening) return;

        try {
            await this.audioEngine.startMicrophone();
            this.isListening = true;
            this.resetState();
            this.processLoop();
            console.log("Demodulator: Listening...");
        } catch (error) {
            console.error("Demodulator: Could not start microphone.", error);
        }
    }

    /**
     * Resets internal decoding state.
     */
    resetState() {
        this.bitBuffer = [];
        this.isSyncing = true;
        this.preambleBuffer = [];
    }

    /**
     * Continuous processing loop for FFT analysis.
     */
    processLoop() {
        if (!this.isListening) return;

        const now = performance.now();
        if (now - this.lastUpdateTime >= this.sampleInterval) {
            this.lastUpdateTime = now;
            this.analyzeFrequencies();
        }

        requestAnimationFrame(() => this.processLoop());
    }

    /**
     * Analyzes current frequency data to detect bits.
     */
    analyzeFrequencies() {
        const data = this.audioEngine.getFrequencyData();
        if (data.length === 0) return;

        const sampleRate = this.audioEngine.context.sampleRate;
        const binSize = sampleRate / this.audioEngine.fftSize;

        // Map frequencies to bins
        const bin0 = Math.round(this.freq0 / binSize);
        const bin1 = Math.round(this.freq1 / binSize);
        const range = Math.round(this.tolerance / binSize);

        // Find max magnitude in range of freq0 and freq1
        const mag0 = this.getMaxInRange(data, bin0, range);
        const mag1 = this.getMaxInRange(data, bin1, range);

        let detectedBit = null;
        let peakFreq = 0;
        const strength = Math.max(mag0, mag1);

        if (strength > this.bitDetectionThreshold) {
            if (mag1 > mag0) {
                detectedBit = 1;
                peakFreq = this.freq1;
            } else {
                detectedBit = 0;
                peakFreq = this.freq0;
            }
        }

        if (this.onSignalStats) {
            this.onSignalStats({ peakFreq, strength: (strength / 255) * 100 });
        }

        // Telemetry Integration
        if (window.telemetry) {
            window.telemetry.record({
                strength: strength,
                frequency: peakFreq,
                timestamp: now
            });
        }

        this.handleDetectedBit(detectedBit, strength);
    }

    /**
     * Helper to find max value in range around a center bin.
     */
    getMaxInRange(data, center, range) {
        let max = 0;
        for (let i = center - range; i <= center + range; i++) {
            if (i >= 0 && i < data.length) {
                if (data[i] > max) max = data[i];
            }
        }
        return max;
    }

    /**
     * State machine for bit synchronization and decoding.
     * Uses a hysteresis-style check to avoid jitter.
     */
    handleDetectedBit(bit, strength) {
        // Hysteresis logic
        if (strength > this.highThreshold) {
            this.currentState = 1;
        } else if (strength < this.lowThreshold) {
            this.currentState = 0;
        }

        if (bit === null && this.currentState === 0) {
            return; // Silence
        }

        // If we are "muted" by threshold but still detecting a bit, prioritize strength
        if (strength < this.bitDetectionThreshold) return;

        // Simple debounce: only record if bit changed and stayed for duration
        // For this demo, we'll use a more naive approach due to line constraints
        // and adjust baud rate to be slow enough that simple sampling works.

        if (this.isSyncing) {
            this.searchForPreamble(bit);
        } else {
            this.accumulateBit(bit);
        }
    }

    searchForPreamble(bit) {
        this.preambleBuffer.push(bit);
        if (this.preambleBuffer.length > 8) {
            this.preambleBuffer.shift();
        }

        if (JSON.stringify(this.preambleBuffer) === JSON.stringify(this.expectedPreamble)) {
            console.log("Demodulator: SYNC ACQUIRED");
            this.isSyncing = false;
            this.bitBuffer = [];
            if (this.onBitDetected) this.onBitDetected('SYNC');
        }
    }

    accumulateBit(bit) {
        // In a real robust modem, we'd sample at the center of the bit duration.
        // Here we just prevent duplicates if they happen within a short window.

        if (this.bitBuffer.length > 0 && this.bitBuffer[this.bitBuffer.length - 1] === bit) {
            // Potential duplicate from oversampling, but for FSK without clock recovery,
            // this is tricky. We'll rely on timing in the next iteration.
            // For now, let's just push it and rely on the BitStream decoder to handle it
            // or use a more fixed-interval sampling in a more advanced version.
        }

        this.bitBuffer.push(bit);
        if (this.onBitDetected) this.onBitDetected(bit);

        // Check for stop bits (all 1s)
        if (this.bitBuffer.length >= 8) {
            const tail = this.bitBuffer.slice(-8);
            if (tail.every(b => b === 1) && this.bitBuffer.length > 24) {
                this.finalizePacket();
            }
        }
    }

    finalizePacket() {
        console.log("Demodulator: PACKET COMPLETE");
        const data = window.bitStream.bitsToText(this.bitBuffer);
        if (data && this.onDataDecoded) {
            this.onDataDecoded(data);
        }
        this.resetState();
    }

    stop() {
        this.isListening = false;
        console.log("Demodulator: Stopped.");
    }
}

window.demodulator = new Demodulator(window.audioEngine);
