/**
 * HARMONICA JS v2.0 - AUDIO ENGINE
 * Advanced Web Audio API synthesis engine with effects
 */

class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.analyser = null;
        this.reverbNode = null;

        // Active note components
        this.oscillator = null;
        this.gainNode = null;
        this.vibratoLFO = null;
        this.vibratoGain = null;

        // State
        this.initialized = false;
        this.activeNote = null;
        this.currentFrequency = 0;

        // Settings
        this.settings = {
            volume: AUDIO_CONFIG.defaultVolume,
            waveform: AUDIO_CONFIG.defaultWaveform,
            vibratoEnabled: true,
            vibratoDepth: AUDIO_CONFIG.vibratoDepth,
            vibratoSpeed: AUDIO_CONFIG.vibratoSpeed,
            bendEnabled: true,
            bendRange: AUDIO_CONFIG.bendRange,
            reverbEnabled: false,
            reverbMix: AUDIO_CONFIG.reverbMix
        };
    }

    /**
     * Initialize Web Audio API
     */
    initialize() {
        if (this.initialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create master gain
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.settings.volume;

            // Create analyser for visualization
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.8;

            // Connect analyser to master
            this.masterGain.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);

            // Create reverb
            this.createReverb();

            this.initialized = true;
            console.log('✓ Audio Engine initialized');
            this.updateStatus('Ready');

        } catch (error) {
            console.error('Audio initialization failed:', error);
            this.updateStatus('Error');
        }
    }

    /**
     * Create simple reverb using convolver
     */
    createReverb() {
        this.reverbNode = this.audioContext.createConvolver();
        this.reverbGain = this.audioContext.createGain();
        this.reverbGain.gain.value = 0;

        // Create impulse response for reverb
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * 2; // 2 second reverb
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
            }
        }

        this.reverbNode.buffer = impulse;
    }

    /**
     * Play a note with full synthesis chain
     */
    playNote(frequency, noteName, isBlow) {
        if (!this.initialized) this.initialize();

        // Ensure context is running (browser policy)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        // Stop any existing note
        this.stopNote();

        const now = this.audioContext.currentTime;
        this.currentFrequency = frequency;

        // Create main oscillator
        this.oscillator = this.audioContext.createOscillator();
        this.oscillator.type = this.settings.waveform;
        this.oscillator.frequency.value = frequency;

        // Create gain envelope node
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.setValueAtTime(0, now);
        this.gainNode.gain.linearRampToValueAtTime(
            AUDIO_CONFIG.sustainLevel,
            now + AUDIO_CONFIG.attackTime
        );

        // Add vibrato if enabled
        if (this.settings.vibratoEnabled) {
            this.vibratoLFO = this.audioContext.createOscillator();
            this.vibratoLFO.frequency.value = this.settings.vibratoSpeed;
            this.vibratoLFO.type = 'sine';

            this.vibratoGain = this.audioContext.createGain();
            this.vibratoGain.gain.value = this.settings.vibratoDepth;

            this.vibratoLFO.connect(this.vibratoGain);
            this.vibratoGain.connect(this.oscillator.frequency);
            this.vibratoLFO.start(now);
        }

        // Connect audio graph
        this.oscillator.connect(this.gainNode);

        if (this.settings.reverbEnabled) {
            // Dry signal
            this.gainNode.connect(this.masterGain);
            // Wet signal (reverb)
            this.gainNode.connect(this.reverbNode);
            this.reverbNode.connect(this.reverbGain);
            this.reverbGain.connect(this.masterGain);
            this.reverbGain.gain.value = this.settings.reverbMix;
        } else {
            this.gainNode.connect(this.masterGain);
        }

        // Start oscillator
        this.oscillator.start(now);

        // Store active note info
        this.activeNote = { frequency, noteName, isBlow };

        this.updateStatus('Playing');
        this.updateFrequencyDisplay(frequency);
    }

    /**
     * Apply pitch bend
     */
    applyPitchBend(semitones) {
        if (!this.oscillator || !this.activeNote || !this.settings.bendEnabled) return;

        const bendAmount = semitones * this.settings.bendRange;
        const bendRatio = Math.pow(2, bendAmount / 12);
        const targetFreq = this.activeNote.frequency * bendRatio;

        const now = this.audioContext.currentTime;
        this.oscillator.frequency.cancelScheduledValues(now);
        this.oscillator.frequency.setValueAtTime(this.oscillator.frequency.value, now);
        this.oscillator.frequency.linearRampToValueAtTime(targetFreq, now + 0.1);

        this.updateFrequencyDisplay(targetFreq);
    }

    /**
     * Stop current note with release envelope
     */
    stopNote() {
        if (!this.oscillator) return;

        const now = this.audioContext.currentTime;

        // Apply release envelope
        this.gainNode.gain.cancelScheduledValues(now);
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
        this.gainNode.gain.linearRampToValueAtTime(0, now + AUDIO_CONFIG.releaseTime);

        // Stop oscillators after release
        this.oscillator.stop(now + AUDIO_CONFIG.releaseTime);
        if (this.vibratoLFO) {
            this.vibratoLFO.stop(now + AUDIO_CONFIG.releaseTime);
        }

        // Cleanup after release
        setTimeout(() => {
            if (this.oscillator) this.oscillator.disconnect();
            if (this.gainNode) this.gainNode.disconnect();
            if (this.vibratoLFO) this.vibratoLFO.disconnect();
            if (this.vibratoGain) this.vibratoGain.disconnect();
        }, AUDIO_CONFIG.releaseTime * 1000 + 50);

        // Clear references
        this.oscillator = null;
        this.gainNode = null;
        this.vibratoLFO = null;
        this.vibratoGain = null;
        this.activeNote = null;

        this.updateStatus('Ready');
        this.updateFrequencyDisplay(0);
    }

    /**
     * Get analyser data for visualization
     */
    getAnalyserData() {
        if (!this.analyser) return null;

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteTimeDomainData(dataArray);

        return { dataArray, bufferLength };
    }

    /**
     * Update settings
     */
    updateSettings(setting, value) {
        this.settings[setting] = value;

        // Apply changes to active note if applicable
        if (setting === 'volume' && this.masterGain) {
            this.masterGain.gain.value = value;
        }

        if (setting === 'waveform' && this.oscillator) {
            this.oscillator.type = value;
        }

        if (setting === 'vibratoDepth' && this.vibratoGain) {
            this.vibratoGain.gain.value = value;
        }

        if (setting === 'vibratoSpeed' && this.vibratoLFO) {
            this.vibratoLFO.frequency.value = value;
        }

        if (setting === 'reverbMix' && this.reverbGain) {
            this.reverbGain.gain.value = value;
        }
    }

    /**
     * UI update helpers
     */
    updateStatus(status) {
        const statusElement = document.getElementById('engineStatus');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    updateFrequencyDisplay(frequency) {
        const freqElement = document.getElementById('freqValue');
        if (freqElement) {
            freqElement.textContent = frequency > 0 ? frequency.toFixed(2) : '—';
        }
    }

    /**
     * Get current state
     */
    isPlaying() {
        return this.activeNote !== null;
    }

    getCurrentNote() {
        return this.activeNote;
    }
}

console.log('✓ Audio Engine loaded');