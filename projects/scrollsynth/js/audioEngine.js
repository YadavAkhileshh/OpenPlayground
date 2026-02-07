// ============================================
// AUDIO ENGINE
// ============================================

/**
 * AudioEngine manages the Web Audio API synthesis and effects
 */
class AudioEngine {
    constructor() {
        this.context = null;
        this.oscillator = null;
        this.gainNode = null;
        this.filterNode = null;
        this.distortionNode = null;
        this.analyserNode = null;
        this.compressor = null;
        this.params = null;
        this.isInitialized = false;
        this.isPlaying = false;

        // Current settings
        this.settings = {
            waveform: CONFIG.AUDIO.DEFAULT_WAVEFORM,
            frequency: CONFIG.AUDIO.DEFAULT_FREQUENCY,
            volume: CONFIG.AUDIO.DEFAULT_VOLUME,
            filterType: CONFIG.AUDIO.DEFAULT_FILTER_TYPE,
            filterFreq: CONFIG.AUDIO.DEFAULT_FILTER_FREQ,
            filterQ: CONFIG.AUDIO.DEFAULT_FILTER_Q,
            distortion: CONFIG.AUDIO.DEFAULT_DISTORTION
        };
    }

    /**
     * Initialize the audio context and create audio graph
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            // Create audio context
            this.context = new (window.AudioContext || window.webkitAudioContext)();

            // Create parameter helper
            this.params = new AudioParams(this.context);

            // Create audio nodes
            this.createAudioGraph();

            this.isInitialized = true;
            console.log('Audio engine initialized');
        } catch (error) {
            console.error('Failed to initialize audio engine:', error);
            throw error;
        }
    }

    /**
     * Create the audio processing graph
     */
    createAudioGraph() {
        // Create oscillator
        this.oscillator = this.context.createOscillator();
        this.oscillator.type = this.settings.waveform;
        this.oscillator.frequency.value = this.settings.frequency;

        // Create gain node for volume control
        this.gainNode = this.context.createGain();
        this.gainNode.gain.value = 0; // Start silent

        // Create filter
        this.filterNode = this.context.createBiquadFilter();
        this.filterNode.type = this.settings.filterType;
        this.filterNode.frequency.value = this.settings.filterFreq;
        this.filterNode.Q.value = this.settings.filterQ;

        // Create distortion (waveshaper)
        this.distortionNode = this.context.createWaveShaper();
        this.distortionNode.curve = this.params.makeDistortionCurve(this.settings.distortion);
        this.distortionNode.oversample = '4x';

        // Create analyser for visualization
        this.analyserNode = this.context.createAnalyser();
        this.analyserNode.fftSize = CONFIG.VISUALIZATION.SPECTRUM_FFT_SIZE;
        this.analyserNode.smoothingTimeConstant = 0.8;

        // Create compressor to prevent clipping
        this.compressor = this.context.createDynamicsCompressor();
        this.compressor.threshold.value = -20;
        this.compressor.knee.value = 10;
        this.compressor.ratio.value = 12;
        this.compressor.attack.value = 0.003;
        this.compressor.release.value = 0.25;

        // Connect the audio graph
        // oscillator -> filter -> distortion -> gain -> analyser -> compressor -> destination
        this.oscillator.connect(this.filterNode);
        this.filterNode.connect(this.distortionNode);
        this.distortionNode.connect(this.gainNode);
        this.gainNode.connect(this.analyserNode);
        this.analyserNode.connect(this.compressor);
        this.compressor.connect(this.context.destination);

        // Start oscillator
        this.oscillator.start();
    }

    /**
     * Start audio playback
     */
    start() {
        if (!this.isInitialized) {
            console.error('Audio engine not initialized');
            return;
        }

        if (this.isPlaying) return;

        // Resume context if suspended (browser autoplay policy)
        if (this.context.state === 'suspended') {
            this.context.resume();
        }

        // Fade in volume
        this.params.smoothTransition(this.gainNode.gain, this.settings.volume, 0.1);
        this.isPlaying = true;
    }

    /**
     * Stop audio playback
     */
    stop() {
        if (!this.isPlaying) return;

        // Fade out volume
        this.params.smoothTransition(this.gainNode.gain, 0, 0.1);
        this.isPlaying = false;
    }

    /**
     * Set oscillator frequency
     * @param {number} frequency - Frequency in Hz
     */
    setFrequency(frequency) {
        if (!this.isInitialized) return;

        const clampedFreq = MATH.clamp(
            frequency,
            CONFIG.AUDIO.MIN_FREQUENCY,
            CONFIG.AUDIO.MAX_FREQUENCY
        );

        this.settings.frequency = clampedFreq;
        this.params.exponentialTransition(this.oscillator.frequency, clampedFreq);
    }

    /**
     * Set volume
     * @param {number} volume - Volume (0-1)
     */
    setVolume(volume) {
        if (!this.isInitialized) return;

        const clampedVolume = MATH.clamp(volume, 0, 1);
        this.settings.volume = clampedVolume;

        if (this.isPlaying) {
            this.params.smoothTransition(this.gainNode.gain, clampedVolume);
        }
    }

    /**
     * Set waveform type
     * @param {string} type - Waveform type (sine, square, sawtooth, triangle)
     */
    setWaveform(type) {
        if (!this.isInitialized) return;

        this.settings.waveform = type;
        this.oscillator.type = type;
    }

    /**
     * Set filter frequency
     * @param {number} frequency - Filter frequency in Hz
     */
    setFilterFrequency(frequency) {
        if (!this.isInitialized) return;

        const clampedFreq = MATH.clamp(
            frequency,
            CONFIG.AUDIO.MIN_FILTER_FREQ,
            CONFIG.AUDIO.MAX_FILTER_FREQ
        );

        this.settings.filterFreq = clampedFreq;
        this.params.exponentialTransition(this.filterNode.frequency, clampedFreq);
    }

    /**
     * Set filter Q (resonance)
     * @param {number} q - Filter Q value
     */
    setFilterQ(q) {
        if (!this.isInitialized) return;

        const clampedQ = MATH.clamp(
            q,
            CONFIG.AUDIO.MIN_FILTER_Q,
            CONFIG.AUDIO.MAX_FILTER_Q
        );

        this.settings.filterQ = clampedQ;
        this.params.smoothTransition(this.filterNode.Q, clampedQ);
    }

    /**
     * Set filter type
     * @param {string} type - Filter type (lowpass, highpass, bandpass)
     */
    setFilterType(type) {
        if (!this.isInitialized) return;

        this.settings.filterType = type;
        this.filterNode.type = type;
    }

    /**
     * Set distortion amount
     * @param {number} amount - Distortion amount (0-100)
     */
    setDistortion(amount) {
        if (!this.isInitialized) return;

        const clampedAmount = MATH.clamp(amount, 0, 100);
        this.settings.distortion = clampedAmount;
        this.distortionNode.curve = this.params.makeDistortionCurve(clampedAmount);
    }

    /**
     * Get analyser node for visualization
     * @returns {AnalyserNode}
     */
    getAnalyser() {
        return this.analyserNode;
    }

    /**
     * Get current settings
     * @returns {Object}
     */
    getSettings() {
        return { ...this.settings };
    }

    /**
     * Load settings from preset
     * @param {Object} preset - Preset settings
     */
    loadSettings(preset) {
        if (!this.isInitialized) return;

        if (preset.waveform) this.setWaveform(preset.waveform);
        if (preset.volume !== undefined) this.setVolume(preset.volume / 100);
        if (preset.filterType) this.setFilterType(preset.filterType);
        if (preset.filterQ !== undefined) {
            const q = this.params.normalizedToFilterQ(preset.filterQ / 100);
            this.setFilterQ(q);
        }
        if (preset.distortion !== undefined) this.setDistortion(preset.distortion);
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this.oscillator) {
            this.oscillator.stop();
            this.oscillator.disconnect();
        }

        if (this.context) {
            this.context.close();
        }

        this.isInitialized = false;
        this.isPlaying = false;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioEngine;
}
