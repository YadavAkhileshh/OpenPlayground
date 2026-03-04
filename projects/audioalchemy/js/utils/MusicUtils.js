/**
 * MusicUtils.js
 * Utilities for musical calculations, frequency conversion, and scale quantization.
 */

export const MusicUtils = {
    /**
     * Concert A frequency
     */
    A4: 440,

    /**
     * Note names
     */
    NOTE_NAMES: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],

    /**
     * Scale intervals (semitones)
     */
    SCALES: {
        CHROMATIC: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        MAJOR: [0, 2, 4, 5, 7, 9, 11],
        MINOR: [0, 2, 3, 5, 7, 8, 10],
        PENTATONIC_MAJOR: [0, 2, 4, 7, 9],
        PENTATONIC_MINOR: [0, 3, 5, 7, 10],
        DORIAN: [0, 2, 3, 5, 7, 9, 10],
        MIXOLYDIAN: [0, 2, 4, 5, 7, 9, 10],
        BLUES: [0, 3, 5, 6, 7, 10]
    },

    /**
     * Convert MIDI note number to Frequency
     * @param {number} midi - MIDI Note Number (0-127)
     * @returns {number} Frequency in Hz
     */
    midiToFreq(midi) {
        return this.A4 * Math.pow(2, (midi - 69) / 12);
    },

    /**
     * Convert Frequency to MIDI note number
     * @param {number} freq - Frequency in Hz
     * @returns {number} MIDI Note Number
     */
    freqToMidi(freq) {
        return Math.round(69 + 12 * Math.log2(freq / this.A4));
    },

    /**
     * Quantize a raw 0-1 value to the nearest note in a scale
     * @param {number} value - Normalized value 0-1
     * @param {number} rootMidi - Root note MIDI number (e.g., 60 for C4)
     * @param {string} scaleName - Key from SCALES object
     * @param {number} octaves - Number of octaves to span
     * @returns {number} Frequency of the quantized note
     */
    quantize(value, rootMidi = 60, scaleName = 'MINOR', octaves = 2) {
        const scale = this.SCALES[scaleName] || this.SCALES.CHROMATIC;

        // Map 0-1 to total semitones range
        const totalSemitones = octaves * 12;
        const inputSemitone = Math.floor(value * totalSemitones);

        // Find octave and note index
        const octave = Math.floor(inputSemitone / 12);
        const noteIndex = inputSemitone % 12;

        // Find nearest note in scale
        // Simple search: find closest interval in scale array
        let closestInterval = scale[0];
        let minDiff = 999;

        for (let interval of scale) {
            const diff = Math.abs(noteIndex - interval);
            if (diff < minDiff) {
                minDiff = diff;
                closestInterval = interval;
            }
        }

        const targetMidi = rootMidi + (octave * 12) + closestInterval;
        return this.midiToFreq(targetMidi);
    },

    /**
     * Get the name of a MIDI note
     * @param {number} midi 
     * @returns {string} e.g. "C4"
     */
    getNoteName(midi) {
        const note = this.NOTE_NAMES[midi % 12];
        const octave = Math.floor(midi / 12) - 1;
        return `${note}${octave}`;
    }
};
