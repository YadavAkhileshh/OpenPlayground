/**
 * audio.js - Audio Engine for Pendulum Sequencer
 * Manages Web Audio API for synthesized tone generation
 * with envelope control and multiple waveform support
 */

class AudioEngine {
    /**
     * Create a new audio engine
     */
    constructor() {
        // Initialize Web Audio API context
        this.audioContext = null;
        this.masterGain = null;
        this.initialized = false;

        // Audio settings
        this.masterVolume = 0.7;
        this.waveform = 'sine';
        this.noteDuration = 0.2;

        // Envelope settings (ADSR)
        this.envelope = {
            attack: 0.01,
            decay: 0.05,
            sustain: 0.7,
            release: 0.1
        };

        // Active oscillators (for cleanup)
        this.activeOscillators = new Set();
    }

    /**
     * Initialize the audio context
     * Must be called after user interaction due to browser autoplay policies
     */
    async initialize() {
        if (this.initialized) return;

        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create master gain node
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.masterVolume;
            this.masterGain.connect(this.audioContext.destination);

            this.initialized = true;
            console.log('Audio engine initialized');
        } catch (error) {
            console.error('Failed to initialize audio context:', error);
        }
    }

    /**
     * Play a tone at the specified frequency
     * @param {number} frequency - Frequency in Hz
     * @param {number} duration - Duration in seconds (optional)
     * @param {number} velocity - Note velocity 0-1 (optional)
     */
    playTone(frequency, duration = null, velocity = 1.0) {
        if (!this.initialized) {
            console.warn('Audio engine not initialized');
            return;
        }

        const currentTime = this.audioContext.currentTime;
        const noteDuration = duration || this.noteDuration;

        // Create oscillator
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = this.waveform;
        oscillator.frequency.value = frequency;

        // Create gain node for envelope
        const gainNode = this.audioContext.createGain();

        // Apply ADSR envelope
        const attackTime = this.envelope.attack;
        const decayTime = this.envelope.decay;
        const sustainLevel = this.envelope.sustain * velocity;
        const releaseTime = this.envelope.release;

        // Attack phase
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(velocity, currentTime + attackTime);

        // Decay phase
        gainNode.gain.linearRampToValueAtTime(
            sustainLevel,
            currentTime + attackTime + decayTime
        );

        // Sustain phase (hold at sustain level)
        const sustainDuration = noteDuration - attackTime - decayTime - releaseTime;

        // Release phase
        gainNode.gain.setValueAtTime(
            sustainLevel,
            currentTime + attackTime + decayTime + sustainDuration
        );
        gainNode.gain.linearRampToValueAtTime(
            0,
            currentTime + noteDuration
        );

        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        // Start and stop oscillator
        oscillator.start(currentTime);
        oscillator.stop(currentTime + noteDuration);

        // Track active oscillator
        this.activeOscillators.add(oscillator);

        // Clean up after note ends
        oscillator.onended = () => {
            oscillator.disconnect();
            gainNode.disconnect();
            this.activeOscillators.delete(oscillator);
        };
    }

    /**
     * Map pendulum length to frequency
     * Longer strings = lower pitch (inverse relationship)
     * @param {number} length - Pendulum length in meters
     * @param {number} baseFrequency - Base frequency in Hz
     * @returns {number} - Mapped frequency
     */
    lengthToFrequency(length, baseFrequency = 440) {
        // Map length (0.1 to 5.0 meters) to frequency range
        // Using inverse relationship: longer = lower pitch
        const minLength = 0.1;
        const maxLength = 5.0;
        const minFreq = 220;  // A3
        const maxFreq = 880;  // A5

        // Normalize length to 0-1 range
        const normalized = (length - minLength) / (maxLength - minLength);

        // Invert and map to frequency range (exponential for musical perception)
        const inverted = 1 - normalized;
        const frequency = minFreq * Math.pow(maxFreq / minFreq, inverted);

        return frequency;
    }

    /**
     * Map angle to frequency modulation
     * @param {number} angle - Pendulum angle in radians
     * @returns {number} - Frequency multiplier
     */
    angleToFrequencyMod(angle) {
        // Subtle frequency modulation based on angle
        const normalized = Math.abs(angle) / Math.PI;
        return 1 + (normalized * 0.1); // Up to 10% modulation
    }

    /**
     * Set the master volume
     * @param {number} volume - Volume level 0-1
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));

        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(
                this.masterVolume,
                this.audioContext.currentTime
            );
        }
    }

    /**
     * Set the waveform type
     * @param {string} waveform - Waveform type ('sine', 'triangle', 'square', 'sawtooth')
     */
    setWaveform(waveform) {
        const validWaveforms = ['sine', 'triangle', 'square', 'sawtooth'];
        if (validWaveforms.includes(waveform)) {
            this.waveform = waveform;
        }
    }

    /**
     * Set the note duration
     * @param {number} duration - Duration in seconds
     */
    setNoteDuration(duration) {
        this.noteDuration = Math.max(0.05, Math.min(2.0, duration));
    }

    /**
     * Set envelope parameters
     * @param {Object} envelope - Envelope parameters {attack, decay, sustain, release}
     */
    setEnvelope(envelope) {
        if (envelope.attack !== undefined) {
            this.envelope.attack = Math.max(0.001, Math.min(1, envelope.attack));
        }
        if (envelope.decay !== undefined) {
            this.envelope.decay = Math.max(0.001, Math.min(1, envelope.decay));
        }
        if (envelope.sustain !== undefined) {
            this.envelope.sustain = Math.max(0, Math.min(1, envelope.sustain));
        }
        if (envelope.release !== undefined) {
            this.envelope.release = Math.max(0.001, Math.min(2, envelope.release));
        }
    }

    /**
     * Stop all currently playing sounds
     */
    stopAll() {
        this.activeOscillators.forEach(oscillator => {
            try {
                oscillator.stop();
                oscillator.disconnect();
            } catch (e) {
                // Oscillator may have already stopped
            }
        });
        this.activeOscillators.clear();
    }

    /**
     * Resume audio context (required after page load in some browsers)
     */
    async resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    /**
     * Get the current audio context state
     * @returns {string} - Audio context state
     */
    getState() {
        return this.audioContext ? this.audioContext.state : 'not initialized';
    }

    /**
     * Create a musical scale from pendulum length
     * @param {number} length - Base length
     * @param {string} scale - Scale type ('major', 'minor', 'pentatonic')
     * @returns {Array} - Array of frequencies
     */
    createScale(length, scale = 'pentatonic') {
        const baseFreq = this.lengthToFrequency(length);

        const scaleIntervals = {
            major: [0, 2, 4, 5, 7, 9, 11, 12],
            minor: [0, 2, 3, 5, 7, 8, 10, 12],
            pentatonic: [0, 2, 4, 7, 9, 12]
        };

        const intervals = scaleIntervals[scale] || scaleIntervals.pentatonic;

        return intervals.map(semitones => {
            return baseFreq * Math.pow(2, semitones / 12);
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioEngine;
}
