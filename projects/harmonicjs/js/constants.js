/**
 * HARMONICA JS v2.0 - CONSTANTS & CONFIGURATION
 * Musical data and application constants
 */

// Standard C Diatonic Harmonica - Richter Tuning
const HARMONICA_NOTES = {
    1: {
        blow: 261.63,
        draw: 293.66,
        blowName: 'C4',
        drawName: 'D4'
    },
    2: {
        blow: 293.66,
        draw: 329.63,
        blowName: 'D4',
        drawName: 'E4'
    },
    3: {
        blow: 329.63,
        draw: 392.00,
        blowName: 'E4',
        drawName: 'G4'
    },
    4: {
        blow: 349.23,
        draw: 392.00,
        blowName: 'F4',
        drawName: 'G4'
    },
    5: {
        blow: 392.00,
        draw: 440.00,
        blowName: 'G4',
        drawName: 'A4'
    },
    6: {
        blow: 440.00,
        draw: 493.88,
        blowName: 'A4',
        drawName: 'B4'
    },
    7: {
        blow: 493.88,
        draw: 523.25,
        blowName: 'B4',
        drawName: 'C5'
    },
    8: {
        blow: 523.25,
        draw: 587.33,
        blowName: 'C5',
        drawName: 'D5'
    },
    9: {
        blow: 587.33,
        draw: 659.25,
        blowName: 'D5',
        drawName: 'E5'
    },
    10: {
        blow: 659.25,
        draw: 783.99,
        blowName: 'E5',
        drawName: 'G5'
    }
};

// Keyboard mapping for hole selection
const KEYBOARD_MAPPING = {
    '1': 1, '2': 2, '3': 3, '4': 4, '5': 5,
    '6': 6, '7': 7, '8': 8, '9': 9, '0': 10
};

// Audio configuration defaults
const AUDIO_CONFIG = {
    defaultVolume: 0.7,
    attackTime: 0.05,
    releaseTime: 0.15,
    sustainLevel: 0.7,
    defaultWaveform: 'triangle',
    vibratoDepth: 3,
    vibratoSpeed: 5,
    bendRange: 0.5,
    reverbMix: 0.3
};

// UI animation timings
const ANIMATION_TIMINGS = {
    holeActivation: 200,
    breathUpdate: 100,
    waveformUpdate: 50
};

// Color schemes
const COLORS = {
    blow: '#ff6b6b',
    draw: '#4ecdc4',
    primary: '#4facfe',
    secondary: '#00f2fe'
};

console.log('✓ Constants loaded');