/**
 * typing-jazz/js/scales.js
 * 
 * MUSICAL THEORY MODULE
 * 
 * This file contains the harmonic framework for TypingJazz. It defines 
 * intervals, scale degrees, and chord progressions used for quantization.
 * 
 * THE JAZZ SCALE SYSTEM:
 * In jazz, scales (modes) are often associated with specific chord types
 * and emotional contexts. This module maps those relationships to user input.
 * 
 * FREQUENCIES:
 * All frequencies are calculated using Equal Temperament (12-TET) based on A4 = 440Hz.
 */

/**
 * SCALES OBJECT
 * Contains interval sets (in half-steps from root) for various musical modes.
 */
const SCALES = {
    // Standard Major (Ionian) - Bright, happy, resolved
    major: [0, 2, 4, 5, 7, 9, 11],

    // Natural Minor (Aeolian) - Sad, dark, serious
    minor: [0, 2, 3, 5, 7, 8, 10],

    // Dorian Mode - The classic "jazz minor" feel (ii chord in Major)
    dorian: [0, 2, 3, 5, 7, 9, 10],

    // Mixolydian Mode - Dominant sound, bluesy but major (V chord)
    mixolydian: [0, 2, 4, 5, 7, 9, 10],

    // Lydian Mode - Ethereal, "dreamy" major with a raised 4th
    lydian: [0, 2, 4, 6, 7, 9, 11],

    // Phrygian Mode - Spanish/Exotic dark minor feel
    phrygian: [0, 1, 3, 5, 7, 8, 10],

    // Locrian Mode - Unstable, diminished feel
    locrian: [0, 1, 3, 5, 6, 8, 10],

    // Blues Scale - The heart of improvisational jazz
    blues: [0, 3, 5, 6, 7, 10],

    // Altered Scale - Used for "outside" tension notes
    altered: [0, 1, 3, 4, 6, 8, 10],

    // Whole Tone - Floating, non-directional sound
    wholeTone: [0, 2, 4, 6, 8, 10],

    // Pentatonic Major - Simplified, folk-like
    pentatonicMajor: [0, 2, 4, 7, 9],

    // Pentatonic Minor - Bluesy, rock-like
    pentatonicMinor: [0, 3, 5, 7, 10],

    // Chromatic - Total freedom, every note available
    chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
};

/**
 * SENTIMENT MAPPING
 * Maps keywords to musical scales to reflect the "mood" of the typed text.
 */
const SENTIMENT_MAP = {
    happy: 'major',
    sad: 'minor',
    blue: 'blues',
    dark: 'phrygian',
    dreamy: 'lydian',
    wild: 'altered',
    free: 'chromatic',
    calm: 'pentatonicMajor',
    tense: 'locrian'
};

/**
 * PROGRESSIONS
 * Defines a series of harmonic contexts (segments) that the user cycles through.
 * Standard Jazz: ii -> V -> I -> turnaround
 */
const PROGRESSIONS = [
    { scale: 'dorian', baseNote: 'D', label: 'ii (Subdominant)' },
    { scale: 'mixolydian', baseNote: 'G', label: 'V (Dominant)' },
    { scale: 'major', baseNote: 'C', label: 'I (Tonic)' },
    { scale: 'altered', baseNote: 'G', label: 'V Alt (Tension)' },
    { scale: 'blues', baseNote: 'C', label: 'Resolution (Blues)' }
];

/**
 * Frequency Map Generation
 * Pre-calculates frequencies for 8 octaves to ensure low-latency access.
 */
const NOTE_FREQUENCIES = (() => {
    const freqs = {};
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    // From C0 (MIDI 12) to B8 (MIDI 119)
    for (let octave = 0; octave <= 8; octave++) {
        for (let i = 0; i < 12; i++) {
            const noteName = notes[i] + octave;
            const midiNumber = (octave + 1) * 12 + i;

            // Standard formula: f = 440 * 2^((n - 69) / 12)
            freqs[noteName] = 440 * Math.pow(2, (midiNumber - 69) / 12);
        }
    }
    return freqs;
})();

/**
 * getFrequencyFromScale
 * Converts a scale degree index into a real frequency.
 * Handles wrapping for multiple octaves.
 * 
 * @param {string} scaleName Key into the SCALES object
 * @param {string} rootNote The fundamental note (e.g. 'C4')
 * @param {number} index The scale degree requested (0-indexed)
 * @returns {number} Frequency in Hz
 */
function getFrequencyFromScale(scaleName, rootNote, index) {
    const scale = SCALES[scaleName] || SCALES.major;

    // Parse root note components
    const rootName = rootNote.replace(/[0-9]/g, '');
    const rootOctave = parseInt(rootNote.replace(/[^0-9]/g, ''));

    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const rootIndex = notes.indexOf(rootName);

    // Determine which octave we are in based on index
    const degree = Math.abs(index) % scale.length;
    const octaveShift = Math.floor(index / scale.length);

    // Calculate final semitone offset from C0
    const interval = scale[degree];
    const totalHalfStepsFromRoot = interval;
    const finalNoteIndex = (rootIndex + totalHalfStepsFromRoot) % 12;
    const finalOctaveShift = Math.floor((rootIndex + totalHalfStepsFromRoot) / 12);

    const finalOctave = rootOctave + octaveShift + finalOctaveShift;
    const finalNoteName = notes[finalNoteIndex];

    const freq = NOTE_FREQUENCIES[finalNoteName + finalOctave];
    return freq || 440; // Fallback to A4
}

export { SCALES, PROGRESSIONS, NOTE_FREQUENCIES, SENTIMENT_MAP, getFrequencyFromScale };

