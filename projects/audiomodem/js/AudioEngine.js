/**
 * AudioEngine.js
 * Manages the Web Audio API context, input/output streams, and global audio state.
 * 
 * Part of the AudioModem Project.
 */

class AudioEngine {
    constructor() {
        this.context = null;
        this.analyzer = null;
        this.microphone = null;
        this.oscillator = null;
        this.gainNode = null;
        this.initialized = false;
        
        // Settings
        this.fftSize = 2048;
        this.smoothing = 0.8;
    }

    /**
     * Initializes the AudioContext after user interaction.
     * @returns {Promise<boolean>} Success state.
     */
    async initialize() {
        if (this.initialized) return true;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();
            
            // Create analyzer for visualization and demodulation
            this.analyzer = this.context.createAnalyser();
            this.analyzer.fftSize = this.fftSize;
            this.analyzer.smoothingTimeConstant = this.smoothing;

            // Setup transmission node
            this.gainNode = this.context.createGain();
            this.gainNode.gain.value = 0;
            this.gainNode.connect(this.context.destination);

            this.initialized = true;
            console.log("AudioEngine: Initialized successfully.");
            return true;
        } catch (error) {
            console.error("AudioEngine: Initialization failed.", error);
            return false;
        }
    }

    /**
     * Requests microphone access and connects to analyzer.
     * @returns {Promise<MediaStream>}
     */
    async startMicrophone() {
        await this.initialize();
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                } 
            });
            
            this.microphone = this.context.createMediaStreamSource(stream);
            this.microphone.connect(this.analyzer);
            
            console.log("AudioEngine: Microphone stream active.");
            return stream;
        } catch (error) {
            console.error("AudioEngine: Microphone access denied.", error);
            throw error;
        }
    }

    /**
     * Starts a tone at a specific frequency for modulation.
     * @param {number} frequency - Frequency in Hz.
     * @param {number} duration - Seconds to play (0 for continuous).
     */
    playTone(frequency, duration = 0) {
        if (!this.initialized) return;

        // Cleanup existing oscillator
        this.stopTone();

        this.oscillator = this.context.createOscillator();
        this.oscillator.type = 'sine';
        this.oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
        
        this.oscillator.connect(this.gainNode);
        
        // Use ramp to avoid clicking
        this.gainNode.gain.cancelScheduledValues(this.context.currentTime);
        this.gainNode.gain.setTargetAtTime(0.5, this.context.currentTime, 0.01);
        
        this.oscillator.start();

        if (duration > 0) {
            const stopTime = this.context.currentTime + duration;
            this.gainNode.gain.setTargetAtTime(0, stopTime - 0.01, 0.01);
            this.oscillator.stop(stopTime);
        }
    }

    /**
     * Stops current transmission tone.
     */
    stopTone() {
        if (this.oscillator) {
            try {
                this.gainNode.gain.setTargetAtTime(0, this.context.currentTime, 0.01);
                this.oscillator.stop(this.context.currentTime + 0.05);
            } catch (e) {
                // Already stopped
            }
            this.oscillator = null;
        }
    }

    /**
     * Sets frequency of current oscillator.
     * @param {number} frequency 
     */
    setFrequency(frequency) {
        if (this.oscillator) {
            // Smoothly transition between frequencies to maintain phase continuity where possible
            this.oscillator.frequency.setTargetAtTime(frequency, this.context.currentTime, 0.005);
        }
    }

    /**
     * Gets frequency data for FFT analysis.
     * @returns {Uint8Array}
     */
    getFrequencyData() {
        if (!this.analyzer) return new Uint8Array(0);
        const data = new Uint8Array(this.analyzer.frequencyBinCount);
        this.analyzer.getByteFrequencyData(data);
        return data;
    }

    /**
     * Gets time domain data for waveform.
     * @returns {Uint8Array}
     */
    getTimeData() {
        if (!this.analyzer) return new Uint8Array(0);
        const data = new Uint8Array(this.analyzer.frequencyBinCount);
        this.analyzer.getByteTimeDomainData(data);
        return data;
    }
}

// Export singleton instance
window.audioEngine = new AudioEngine();
