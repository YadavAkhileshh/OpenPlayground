// ============================================
// CONSTANTS & CONFIGURATION
// ============================================

const CONFIG = {
    // Audio Configuration
    AUDIO: {
        // Frequency range for pitch control
        MIN_FREQUENCY: 20,
        MAX_FREQUENCY: 2000,
        DEFAULT_FREQUENCY: 440,

        // Volume settings
        MIN_VOLUME: 0,
        MAX_VOLUME: 1,
        DEFAULT_VOLUME: 0.5,

        // Filter settings
        MIN_FILTER_FREQ: 100,
        MAX_FILTER_FREQ: 8000,
        DEFAULT_FILTER_FREQ: 1000,

        MIN_FILTER_Q: 0.1,
        MAX_FILTER_Q: 30,
        DEFAULT_FILTER_Q: 1,

        // Distortion settings
        MIN_DISTORTION: 0,
        MAX_DISTORTION: 100,
        DEFAULT_DISTORTION: 0,

        // Smoothing time for parameter changes (prevents clicks)
        PARAM_SMOOTH_TIME: 0.05,

        // Default waveform type
        DEFAULT_WAVEFORM: 'sine',
        DEFAULT_FILTER_TYPE: 'lowpass'
    },

    // Scroll Configuration
    SCROLL: {
        // Smoothing factor for scroll interpolation (0-1)
        SMOOTH_FACTOR: 0.15,

        // Dead zone threshold (ignore small movements)
        DEAD_ZONE: 0.01,

        // Velocity decay rate
        VELOCITY_DECAY: 0.9,

        // Maximum velocity
        MAX_VELOCITY: 100,

        // Scroll event throttle (ms)
        THROTTLE_MS: 16 // ~60fps
    },

    // Visualization Configuration
    VISUALIZATION: {
        // Waveform settings
        WAVEFORM_BUFFER_SIZE: 2048,
        WAVEFORM_LINE_WIDTH: 2,
        WAVEFORM_COLOR: '#00ffcc',
        WAVEFORM_GLOW: 10,

        // Spectrum analyzer settings
        SPECTRUM_FFT_SIZE: 2048,
        SPECTRUM_BAR_COUNT: 64,
        SPECTRUM_BAR_GAP: 2,
        SPECTRUM_MIN_DB: -90,
        SPECTRUM_MAX_DB: -10,

        // Animation frame rate
        TARGET_FPS: 60,
        FRAME_TIME: 1000 / 60
    },

    // Arpeggiator Configuration
    ARPEGGIATOR: {
        // Pattern types
        PATTERNS: ['up', 'down', 'updown', 'random'],

        // Speed range (notes per second)
        MIN_SPEED: 1,
        MAX_SPEED: 10,
        DEFAULT_SPEED: 4,

        // Interval options (semitones)
        INTERVALS: {
            third: 3,
            fifth: 5,
            seventh: 7,
            octave: 12
        },

        // Number of steps in arpeggio
        STEP_COUNT: 4
    },

    // Loop Recorder Configuration
    LOOP: {
        // Maximum recording time (seconds)
        MAX_DURATION: 30,

        // Recording sample rate (samples per second)
        SAMPLE_RATE: 60,

        // Playback loop behavior
        LOOP_ENABLED: true,

        // Timeline canvas settings
        TIMELINE_HEIGHT: 80,
        TIMELINE_COLOR: '#00ffcc'
    },

    // Gesture Detection Configuration
    GESTURE: {
        // Minimum points to detect a gesture
        MIN_POINTS: 10,

        // Maximum time between points (ms)
        MAX_TIME_GAP: 100,

        // Path simplification tolerance
        SIMPLIFY_TOLERANCE: 5,

        // Gesture types
        TYPES: {
            CIRCLE: 'circle',
            ZIGZAG: 'zigzag',
            DIAGONAL: 'diagonal',
            LINE: 'line'
        },

        // Detection thresholds
        CIRCLE_THRESHOLD: 0.7,
        ZIGZAG_THRESHOLD: 3,
        DIAGONAL_THRESHOLD: 0.3
    },

    // Preset Configuration
    PRESET: {
        // Storage key for localStorage
        STORAGE_KEY: 'scrollsynth_presets',

        // Maximum number of presets
        MAX_PRESETS: 20,

        // Default presets
        DEFAULTS: [
            {
                name: 'Deep Bass',
                waveform: 'sine',
                volume: 60,
                filterType: 'lowpass',
                filterQ: 30,
                distortion: 0
            },
            {
                name: 'Bright Lead',
                waveform: 'sawtooth',
                volume: 50,
                filterType: 'highpass',
                filterQ: 50,
                distortion: 20
            },
            {
                name: 'Warm Pad',
                waveform: 'triangle',
                volume: 40,
                filterType: 'bandpass',
                filterQ: 70,
                distortion: 5
            }
        ]
    },

    // UI Configuration
    UI: {
        // Loader animation duration (ms)
        LOADER_DURATION: 2000,

        // Panel transition duration (ms)
        PANEL_TRANSITION: 400,

        // Update intervals
        PITCH_UPDATE_INTERVAL: 50,
        UI_UPDATE_INTERVAL: 100,

        // Note names for pitch display
        NOTE_NAMES: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],

        // Reference frequency for A4
        A4_FREQUENCY: 440
    },

    // Touch/Mobile Configuration
    TOUCH: {
        // Enable touch support
        ENABLED: true,

        // Multi-touch gesture support
        MULTI_TOUCH: true,

        // Touch sensitivity multiplier
        SENSITIVITY: 1.5,

        // Prevent default touch behaviors
        PREVENT_DEFAULT: true
    }
};

// Musical note utilities
const MUSIC = {
    // Convert frequency to MIDI note number
    frequencyToMidi(frequency) {
        return 12 * Math.log2(frequency / 440) + 69;
    },

    // Convert MIDI note number to frequency
    midiToFrequency(midi) {
        return 440 * Math.pow(2, (midi - 69) / 12);
    },

    // Get note name from frequency
    frequencyToNote(frequency) {
        const midi = Math.round(this.frequencyToMidi(frequency));
        const octave = Math.floor(midi / 12) - 1;
        const noteIndex = midi % 12;
        return CONFIG.UI.NOTE_NAMES[noteIndex] + octave;
    },

    // Get nearest note frequency
    getNearestNoteFrequency(frequency) {
        const midi = Math.round(this.frequencyToMidi(frequency));
        return this.midiToFrequency(midi);
    }
};

// Math utilities
const MATH = {
    // Linear interpolation
    lerp(start, end, t) {
        return start + (end - start) * t;
    },

    // Clamp value between min and max
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    // Map value from one range to another
    map(value, inMin, inMax, outMin, outMax) {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    },

    // Normalize value to 0-1 range
    normalize(value, min, max) {
        return (value - min) / (max - min);
    },

    // Exponential scaling for frequency (sounds more natural)
    exponentialScale(value, min, max) {
        const minLog = Math.log(min);
        const maxLog = Math.log(max);
        const scale = (maxLog - minLog) / 1;
        return Math.exp(minLog + scale * value);
    },

    // Inverse exponential scaling
    inverseExponentialScale(value, min, max) {
        const minLog = Math.log(min);
        const maxLog = Math.log(max);
        return (Math.log(value) - minLog) / (maxLog - minLog);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, MUSIC, MATH };
}
