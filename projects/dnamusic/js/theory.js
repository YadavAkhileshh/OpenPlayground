/**
 * Music Theory Engine
 * Handles Scale generation, Chord voicing, and Frequency calculations.
 * Expanded with more scales and robust frequency logic.
 */

export class MusicTheory {
    constructor() {
        this.baseFreq = 440; // A4
        this.notes = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

        // Interval patterns (semitones)
        this.intervals = {
            // Major / Minor
            'maj': [0, 4, 7],
            'min': [0, 3, 7],
            'dim': [0, 3, 6],
            'aug': [0, 4, 8],

            // 7ths
            'maj7': [0, 4, 7, 11],
            'min7': [0, 3, 7, 10],
            'dom7': [0, 4, 7, 10],
            'dim7': [0, 3, 6, 9],
            'm7b5': [0, 3, 6, 10],

            // Extensions
            'maj9': [0, 4, 7, 11, 14],
            'min9': [0, 3, 7, 10, 14],
            'dom9': [0, 4, 7, 10, 14],
            'maj7#11': [0, 4, 7, 11, 18],
            'dom7b9': [0, 4, 7, 10, 13],
            'dom13': [0, 4, 7, 10, 14, 21],

            // Suspended / 6ths
            'sus2': [0, 2, 7],
            'sus4': [0, 5, 7],
            '7sus4': [0, 5, 7, 10],
            'add9': [0, 4, 7, 14],
            '6': [0, 4, 7, 9],
            'min6': [0, 3, 7, 9],

            // Special
            'power': [0, 7, 12], // Power chord
            'stop': [] // Silence
        };

        // Scale Definitions (for future procedural generation features)
        this.scales = {
            'chromatic': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
            'major': [0, 2, 4, 5, 7, 9, 11],
            'minor': [0, 2, 3, 5, 7, 8, 10],
            'harmonic_minor': [0, 2, 3, 5, 7, 8, 11],
            'pentatonic_major': [0, 2, 4, 7, 9],
            'pentatonic_minor': [0, 3, 5, 7, 10],
            'blues': [0, 3, 5, 6, 7, 10],
            'whole_tone': [0, 2, 4, 6, 8, 10]
        };
    }

    /**
     * Returns the frequency of a note string (e.g., "C4", "A#3")
     * @param {string} note - Note name and optional octave
     * @returns {number} Frequency in Hz
     */
    getFrequency(note, octave = 4) {
        if (!note) return 0;

        // Normalize flats to sharps for lookup (e.g., Db -> C#)
        const flatMap = {
            'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
        };
        const normalizedNote = flatMap[note] || note;

        const noteIndex = this.notes.indexOf(normalizedNote) !== -1 ?
            this.notes.indexOf(normalizedNote) :
            this.notes.indexOf(note); // Fallback

        if (noteIndex === -1) return 0;

        // Formula: f = f0 * (a)^n
        // n = semitone distance from A4
        // A4 is (Index 9, Octave 4) -> Absolute Index = 9 + (4 * 12) = 57

        const a4Index = 9;
        const a4Octave = 4;
        const a4Abs = a4Index + (a4Octave * 12);

        const currentAbs = noteIndex + (octave * 12);
        const semitoneDist = currentAbs - a4Abs;

        return this.baseFreq * Math.pow(2, semitoneDist / 12);
    }

    /**
     * Generates a chord object with frequencies for a given root and quality.
     * @param {string} root - Root note (e.g., "C")
     * @param {string} quality - Chord quality (e.g., "maj7")
     * @param {number} octave - Base octave
     */
    getChord(root, quality, baseOctave = 3) {
        if (!root || quality === 'stop') {
            return {
                name: 'Silence',
                frequencies: [],
                notes: []
            };
        }

        const intervalPattern = this.intervals[quality] || this.intervals['maj'];
        const rootIndex = this.notes.indexOf(root);

        // Construct the chord
        const notes = [];
        const frequencies = [];

        intervalPattern.forEach(interval => {
            // Calculate actual note index wrapping around 12 semitones
            let index = rootIndex + interval;
            let octaveShift = Math.floor(index / 12);
            let normalizedIndex = index % 12;

            let noteName = this.notes[normalizedIndex];
            let noteOctave = baseOctave + octaveShift;

            notes.push(`${noteName}${noteOctave}`);
            frequencies.push(this.getFrequency(noteName, noteOctave));
        });

        // Add proper naming
        let prettyQuality = quality
            .replace('maj', 'Major ')
            .replace('min', 'Minor ')
            .replace('dom', '')
            .replace('dim', 'Diminished ')
            .replace('aug', 'Augmented ')
            .replace('sus', 'Suspended ');

        let prettyName = `${root} ${prettyQuality}`.trim();

        return {
            name: prettyName,
            frequencies: frequencies,
            notes: notes
        };
    }
}
