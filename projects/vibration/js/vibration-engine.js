/**
 * ============================================
 * VIBRATION COMPOSER - VIBRATION ENGINE
 * Vibration API Wrapper & Pattern Execution
 * ============================================
 */

class VibrationEngine {
    constructor() {
        this.isSupported = this.checkSupport();
        this.isPlaying = false;
        this.currentTimeout = null;
        this.vibrationQueue = [];
        this.onVibrationCallback = null;

        // Intensity mapping (0-1 to milliseconds)
        this.intensityMap = {
            min: 50,
            max: 200
        };

        // Audio fallback for non-vibration devices
        this.audioContext = null;
        this.useAudio = false;
        this.initAudio();
    }

    /**
     * Initialize Web Audio API for audio fallback
     */
    initAudio() {
        try {
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();

            // Use audio if vibration not supported
            this.useAudio = !this.isSupported;

            console.log('Audio fallback initialized:', this.useAudio ? 'ENABLED' : 'DISABLED');
        } catch (error) {
            console.warn('Web Audio API not available:', error);
            this.audioContext = null;
        }
    }

    /**
     * Play audio tone as vibration fallback
     * @param {number} intensity - Intensity value (0-1)
     */
    playAudioBeat(intensity = 0.8) {
        if (!this.audioContext) return;

        // Resume audio context if suspended (browser autoplay policy)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const now = this.audioContext.currentTime;

        // Create oscillator for percussive sound
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Frequency based on intensity (lower = deeper, higher = sharper)
        const baseFreq = 80;
        const freqRange = 120;
        oscillator.frequency.setValueAtTime(
            baseFreq + (intensity * freqRange),
            now
        );

        // Use square wave for percussive sound
        oscillator.type = 'square';

        // Volume envelope based on intensity
        const volume = 0.3 * intensity;
        gainNode.gain.setValueAtTime(volume, now);

        // Quick attack and decay for percussive sound
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        // Start and stop
        oscillator.start(now);
        oscillator.stop(now + 0.1);
    }

    /**
     * Check if Vibration API is supported
     * @returns {boolean} True if supported
     */
    checkSupport() {
        return 'vibrate' in navigator || 'mozVibrate' in navigator || 'webkitVibrate' in navigator;
    }

    /**
     * Get the vibration function (handles vendor prefixes)
     * @returns {Function} Vibration function
     */
    getVibrationFunction() {
        return navigator.vibrate || navigator.mozVibrate || navigator.webkitVibrate;
    }

    /**
     * Convert intensity (0-1) to vibration duration in milliseconds
     * @param {number} intensity - Intensity value between 0 and 1
     * @returns {number} Duration in milliseconds
     */
    intensityToDuration(intensity) {
        const clamped = Math.max(0, Math.min(1, intensity));
        return Math.round(this.intensityMap.min + (clamped * (this.intensityMap.max - this.intensityMap.min)));
    }

    /**
     * Create a vibration pattern array from beats
     * @param {Array} beats - Array of beat objects {position, intensity}
     * @param {number} beatDuration - Duration of one beat in milliseconds
     * @returns {Array} Vibration pattern [vibrate, pause, vibrate, pause, ...]
     */
    createPattern(beats, beatDuration) {
        if (!beats || beats.length === 0) {
            return [];
        }

        // Sort beats by position
        const sortedBeats = [...beats].sort((a, b) => a.position - b.position);

        const pattern = [];
        let lastPosition = 0;

        sortedBeats.forEach(beat => {
            const gap = beat.position - lastPosition;

            // Add pause before this beat if there's a gap
            if (gap > 0) {
                if (pattern.length > 0) {
                    // Add to previous pause or create new one
                    pattern.push(gap * beatDuration);
                } else {
                    // First beat isn't at position 0, add initial pause
                    pattern.push(gap * beatDuration);
                    pattern.push(0); // No vibration yet
                }
            }

            // Add vibration duration based on intensity
            const duration = this.intensityToDuration(beat.intensity);

            if (pattern.length === 0) {
                pattern.push(duration);
            } else if (pattern.length % 2 === 0) {
                // Even index = vibration
                pattern.push(duration);
            } else {
                // Odd index = pause, need to add vibration
                pattern.push(0); // End pause
                pattern.push(duration); // Start vibration
            }

            lastPosition = beat.position + 1;
        });

        // Ensure pattern ends properly
        if (pattern.length % 2 === 1) {
            pattern.push(0); // Add final pause
        }

        return pattern;
    }

    /**
     * Play a single vibration pulse
     * @param {number} duration - Duration in milliseconds
     * @param {number} intensity - Intensity value (0-1)
     */
    playPulse(duration = null, intensity = 0.8) {
        if (!this.isSupported) {
            console.warn('Vibration API not supported');
            return;
        }

        const vibrateDuration = duration !== null ? duration : this.intensityToDuration(intensity);

        try {
            const vibrate = this.getVibrationFunction();
            vibrate.call(navigator, vibrateDuration);

            // Trigger callback for visual feedback
            if (this.onVibrationCallback) {
                this.onVibrationCallback(intensity);
            }
        } catch (error) {
            console.error('Vibration error:', error);
        }
    }

    /**
     * Play a vibration pattern
     * @param {Array} pattern - Vibration pattern array
     */
    playPattern(pattern) {
        if (!this.isSupported) {
            console.warn('Vibration API not supported');
            return;
        }

        if (!pattern || pattern.length === 0) {
            return;
        }

        try {
            const vibrate = this.getVibrationFunction();
            vibrate.call(navigator, pattern);
        } catch (error) {
            console.error('Vibration pattern error:', error);
        }
    }

    /**
     * Play a beat with specific intensity
     * @param {number} intensity - Intensity value (0-1)
     */
    playBeat(intensity = 0.8) {
        // Play vibration if supported
        if (this.isSupported) {
            this.playPulse(null, intensity);
        }

        // Play audio if enabled (fallback or always on)
        if (this.useAudio && this.audioContext) {
            this.playAudioBeat(intensity);
        }

        // Trigger visual feedback callback
        if (this.onVibrationCallback) {
            this.onVibrationCallback(intensity);
        }
    }

    /**
     * Stop all vibrations
     */
    stop() {
        if (!this.isSupported) {
            return;
        }

        try {
            const vibrate = this.getVibrationFunction();
            vibrate.call(navigator, 0);

            // Clear any pending timeouts
            if (this.currentTimeout) {
                clearTimeout(this.currentTimeout);
                this.currentTimeout = null;
            }

            this.isPlaying = false;
            this.vibrationQueue = [];
        } catch (error) {
            console.error('Stop vibration error:', error);
        }
    }

    /**
     * Schedule a vibration to play after a delay
     * @param {number} delay - Delay in milliseconds
     * @param {number} intensity - Intensity value (0-1)
     * @returns {Promise} Resolves when vibration completes
     */
    scheduleVibration(delay, intensity = 0.8) {
        return new Promise((resolve) => {
            this.currentTimeout = setTimeout(() => {
                this.playBeat(intensity);
                resolve();
            }, delay);
        });
    }

    /**
     * Set callback for vibration events (for visual feedback)
     * @param {Function} callback - Callback function
     */
    onVibration(callback) {
        this.onVibrationCallback = callback;
    }

    /**
     * Test vibration with a simple pattern
     */
    test() {
        if (!this.isSupported) {
            console.warn('Vibration API not supported');
            return;
        }

        // Simple test pattern: short, pause, long
        const testPattern = [100, 100, 200];
        this.playPattern(testPattern);
    }

    /**
     * Get support status message
     * @returns {Object} Status object with supported flag and message
     */
    getSupportStatus() {
        let message = '';

        if (this.isSupported) {
            message = 'Vibration API supported';
        } else if (this.useAudio && this.audioContext) {
            message = 'Audio mode (vibration not supported)';
        } else {
            message = 'Vibration API not supported on this device';
        }

        return {
            supported: this.isSupported,
            hasAudio: this.useAudio && this.audioContext !== null,
            message: message
        };
    }
}

/**
 * ============================================
 * PRESET PATTERNS
 * Pre-defined vibration rhythm patterns
 * ============================================
 */

const PRESET_PATTERNS = {
    /**
     * Basic Beat - Simple 4/4 kick pattern
     */
    basic: {
        name: 'Basic Beat',
        tracks: [
            {
                beats: [
                    { position: 0, intensity: 1.0 },
                    { position: 4, intensity: 1.0 },
                    { position: 8, intensity: 1.0 },
                    { position: 12, intensity: 1.0 }
                ]
            },
            { beats: [] },
            { beats: [] },
            { beats: [] }
        ]
    },

    /**
     * Heartbeat - Lub-dub rhythm
     */
    heartbeat: {
        name: 'Heartbeat',
        tracks: [
            {
                beats: [
                    { position: 0, intensity: 0.9 },
                    { position: 1, intensity: 0.6 },
                    { position: 4, intensity: 0.9 },
                    { position: 5, intensity: 0.6 },
                    { position: 8, intensity: 0.9 },
                    { position: 9, intensity: 0.6 },
                    { position: 12, intensity: 0.9 },
                    { position: 13, intensity: 0.6 }
                ]
            },
            { beats: [] },
            { beats: [] },
            { beats: [] }
        ]
    },

    /**
     * Morse SOS - ... --- ...
     */
    morse: {
        name: 'Morse SOS',
        tracks: [
            {
                beats: [
                    // S (...)
                    { position: 0, intensity: 0.5 },
                    { position: 1, intensity: 0.5 },
                    { position: 2, intensity: 0.5 },
                    // O (---)
                    { position: 4, intensity: 1.0 },
                    { position: 6, intensity: 1.0 },
                    { position: 8, intensity: 1.0 },
                    // S (...)
                    { position: 10, intensity: 0.5 },
                    { position: 11, intensity: 0.5 },
                    { position: 12, intensity: 0.5 }
                ]
            },
            { beats: [] },
            { beats: [] },
            { beats: [] }
        ]
    },

    /**
     * Gallop - Horse gallop rhythm
     */
    gallop: {
        name: 'Gallop',
        tracks: [
            {
                beats: [
                    { position: 0, intensity: 0.8 },
                    { position: 2, intensity: 0.6 },
                    { position: 3, intensity: 0.8 },
                    { position: 4, intensity: 0.8 },
                    { position: 6, intensity: 0.6 },
                    { position: 7, intensity: 0.8 },
                    { position: 8, intensity: 0.8 },
                    { position: 10, intensity: 0.6 },
                    { position: 11, intensity: 0.8 },
                    { position: 12, intensity: 0.8 },
                    { position: 14, intensity: 0.6 },
                    { position: 15, intensity: 0.8 }
                ]
            },
            { beats: [] },
            { beats: [] },
            { beats: [] }
        ]
    },

    /**
     * Techno - Electronic dance pattern
     */
    techno: {
        name: 'Techno',
        tracks: [
            {
                beats: [
                    { position: 0, intensity: 1.0 },
                    { position: 4, intensity: 1.0 },
                    { position: 8, intensity: 1.0 },
                    { position: 12, intensity: 1.0 }
                ]
            },
            {
                beats: [
                    { position: 2, intensity: 0.6 },
                    { position: 6, intensity: 0.6 },
                    { position: 10, intensity: 0.6 },
                    { position: 14, intensity: 0.6 }
                ]
            },
            {
                beats: [
                    { position: 3, intensity: 0.4 },
                    { position: 7, intensity: 0.4 },
                    { position: 11, intensity: 0.4 },
                    { position: 15, intensity: 0.4 }
                ]
            },
            { beats: [] }
        ]
    },

    /**
     * Shaker - Rapid alternating pulses
     */
    shaker: {
        name: 'Shaker',
        tracks: [
            { beats: [] },
            {
                beats: [
                    { position: 0, intensity: 0.4 },
                    { position: 1, intensity: 0.4 },
                    { position: 2, intensity: 0.4 },
                    { position: 3, intensity: 0.4 },
                    { position: 4, intensity: 0.4 },
                    { position: 5, intensity: 0.4 },
                    { position: 6, intensity: 0.4 },
                    { position: 7, intensity: 0.4 },
                    { position: 8, intensity: 0.4 },
                    { position: 9, intensity: 0.4 },
                    { position: 10, intensity: 0.4 },
                    { position: 11, intensity: 0.4 },
                    { position: 12, intensity: 0.4 },
                    { position: 13, intensity: 0.4 },
                    { position: 14, intensity: 0.4 },
                    { position: 15, intensity: 0.4 }
                ]
            },
            { beats: [] },
            { beats: [] }
        ]
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VibrationEngine, PRESET_PATTERNS };
}
