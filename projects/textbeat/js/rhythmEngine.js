/**
 * TextBeat - Rhythm Engine Module
 * Converts text data into 16-step drum patterns
 */

const RhythmEngine = (function () {
    'use strict';

    const STEPS = 16; // 16-step sequencer

    /**
     * Create a 16-step pattern from rhythm data
     * @param {Object} rhythmData - Rhythm metadata from text parser
     * @param {number} bpm - Beats per minute
     * @returns {Object} - 16-step pattern with timing
     */
    function createPattern(rhythmData, bpm = 120) {
        const pattern = {
            steps: STEPS,
            bpm: bpm,
            stepDuration: (60 / bpm) / 4, // Duration of each 16th note in seconds
            lanes: {
                kick: new Array(STEPS).fill(null),
                snare: new Array(STEPS).fill(null),
                tom: new Array(STEPS).fill(null),
                hihat: new Array(STEPS).fill(null),
                cymbal: new Array(STEPS).fill(null)
            }
        };

        // If no rhythm data, return empty pattern
        if (!rhythmData || rhythmData.vowelCount === 0) {
            return pattern;
        }

        // Map vowels to beats across 16 steps
        const { drumGroups, syllableCount } = rhythmData;

        // Process each drum type
        Object.keys(drumGroups).forEach(drumType => {
            const vowels = drumGroups[drumType];
            if (vowels.length === 0) return;

            // Distribute vowels across 16 steps
            const positions = mapVowelsToBeatPositions(vowels, syllableCount);

            positions.forEach(pos => {
                if (pos >= 0 && pos < STEPS) {
                    // Set velocity based on position and density
                    const velocity = calculateVelocity(pos, positions.length);
                    pattern.lanes[drumType][pos] = {
                        active: true,
                        velocity: velocity
                    };
                }
            });
        });

        // Add variation and ghost notes for more musical feel
        addMusicalVariation(pattern, rhythmData);

        return pattern;
    }

    /**
     * Map vowels to beat positions (0-15)
     * @param {Array} vowels - Array of vowel objects
     * @param {number} totalSyllables - Total syllable count
     * @returns {Array} - Array of step positions
     */
    function mapVowelsToBeatPositions(vowels, totalSyllables) {
        if (vowels.length === 0) return [];

        const positions = [];

        // Strategy: distribute vowels evenly across 16 steps
        const stepSize = STEPS / vowels.length;

        vowels.forEach((vowel, index) => {
            // Calculate position with some variation
            let position = Math.floor(index * stepSize);

            // Add slight randomization for more natural feel
            // but keep it deterministic based on vowel index
            const variation = (index % 3) - 1; // -1, 0, or 1
            position = Math.max(0, Math.min(STEPS - 1, position + variation));

            positions.push(position);
        });

        return positions;
    }

    /**
     * Calculate velocity for a beat based on position
     * @param {number} position - Step position (0-15)
     * @param {number} totalBeats - Total number of beats
     * @returns {number} - Velocity value (0-1)
     */
    function calculateVelocity(position, totalBeats) {
        // Emphasize beats on quarter notes (0, 4, 8, 12)
        const isQuarterNote = position % 4 === 0;
        const isEighthNote = position % 2 === 0;

        let velocity = 0.7; // Base velocity

        if (isQuarterNote) {
            velocity = 1.0; // Strong beats
        } else if (isEighthNote) {
            velocity = 0.85; // Medium beats
        }

        // Add slight variation based on density
        if (totalBeats > 8) {
            velocity *= 0.9; // Reduce velocity for dense patterns
        }

        return Math.max(0.5, Math.min(1.0, velocity));
    }

    /**
     * Add musical variation and ghost notes
     * @param {Object} pattern - The pattern object to modify
     * @param {Object} rhythmData - Rhythm metadata
     */
    function addMusicalVariation(pattern, rhythmData) {
        const { density } = rhythmData;

        // Add hi-hat on eighth notes if pattern is sparse
        if (density === 'sparse') {
            for (let i = 0; i < STEPS; i += 2) {
                if (!pattern.lanes.hihat[i]) {
                    pattern.lanes.hihat[i] = {
                        active: true,
                        velocity: 0.5,
                        ghost: true // Mark as ghost note
                    };
                }
            }
        }

        // Add kick on downbeats if missing
        const downbeats = [0, 4, 8, 12];
        downbeats.forEach(beat => {
            if (!pattern.lanes.kick[beat] && Math.random() > 0.5) {
                pattern.lanes.kick[beat] = {
                    active: true,
                    velocity: 0.8,
                    ghost: true
                };
            }
        });

        // Add snare on backbeats (4, 12) if missing
        const backbeats = [4, 12];
        backbeats.forEach(beat => {
            if (!pattern.lanes.snare[beat] && Math.random() > 0.6) {
                pattern.lanes.snare[beat] = {
                    active: true,
                    velocity: 0.75,
                    ghost: true
                };
            }
        });
    }

    /**
     * Map syllables to beat positions
     * @param {Array} syllables - Array of syllable data
     * @returns {Array} - Array of beat positions
     */
    function mapSyllablesToBeats(syllables) {
        if (!syllables || syllables.length === 0) return [];

        const beats = [];
        const stepSize = STEPS / syllables.length;

        syllables.forEach((syllable, index) => {
            const position = Math.floor(index * stepSize);
            beats.push({
                position: position,
                stress: syllable.stress || 1.0
            });
        });

        return beats;
    }

    /**
     * Generate a variation of an existing pattern
     * @param {Object} pattern - The original pattern
     * @returns {Object} - A new varied pattern
     */
    function generateVariation(pattern) {
        const newPattern = JSON.parse(JSON.stringify(pattern)); // Deep clone

        // Randomly remove some ghost notes
        Object.keys(newPattern.lanes).forEach(drumType => {
            newPattern.lanes[drumType].forEach((beat, index) => {
                if (beat && beat.ghost && Math.random() > 0.7) {
                    newPattern.lanes[drumType][index] = null;
                }
            });
        });

        // Add some new ghost notes
        const positions = [1, 3, 5, 7, 9, 11, 13, 15]; // Off-beats
        positions.forEach(pos => {
            if (Math.random() > 0.8) {
                const drums = ['hihat', 'cymbal'];
                const drum = drums[Math.floor(Math.random() * drums.length)];
                if (!newPattern.lanes[drum][pos]) {
                    newPattern.lanes[drum][pos] = {
                        active: true,
                        velocity: 0.4,
                        ghost: true
                    };
                }
            }
        });

        return newPattern;
    }

    /**
     * Quantize a pattern to specific subdivisions
     * @param {Object} pattern - The pattern to quantize
     * @param {number} subdivision - Subdivision (2, 4, 8, 16)
     * @returns {Object} - Quantized pattern
     */
    function quantizePattern(pattern, subdivision = 4) {
        const quantized = JSON.parse(JSON.stringify(pattern));
        const stepSize = STEPS / subdivision;

        Object.keys(quantized.lanes).forEach(drumType => {
            const newLane = new Array(STEPS).fill(null);

            quantized.lanes[drumType].forEach((beat, index) => {
                if (beat && beat.active) {
                    // Snap to nearest subdivision
                    const quantizedPos = Math.round(index / stepSize) * stepSize;
                    if (quantizedPos < STEPS) {
                        newLane[quantizedPos] = beat;
                    }
                }
            });

            quantized.lanes[drumType] = newLane;
        });

        return quantized;
    }

    /**
     * Get pattern statistics
     * @param {Object} pattern - The pattern to analyze
     * @returns {Object} - Pattern statistics
     */
    function getPatternStats(pattern) {
        const stats = {
            totalBeats: 0,
            beatsPerDrum: {},
            density: 0,
            hasGhostNotes: false
        };

        Object.keys(pattern.lanes).forEach(drumType => {
            let count = 0;
            pattern.lanes[drumType].forEach(beat => {
                if (beat && beat.active) {
                    count++;
                    stats.totalBeats++;
                    if (beat.ghost) {
                        stats.hasGhostNotes = true;
                    }
                }
            });
            stats.beatsPerDrum[drumType] = count;
        });

        stats.density = stats.totalBeats / STEPS;

        return stats;
    }

    /**
     * Convert pattern to a human-readable string
     * @param {Object} pattern - The pattern to convert
     * @returns {string} - String representation
     */
    function patternToString(pattern) {
        let str = '';
        const drums = ['kick', 'snare', 'tom', 'hihat', 'cymbal'];

        drums.forEach(drum => {
            str += `${drum.padEnd(8)}: `;
            pattern.lanes[drum].forEach(beat => {
                str += beat && beat.active ? '■ ' : '□ ';
            });
            str += '\n';
        });

        return str;
    }

    // Public API
    return {
        createPattern,
        mapVowelsToBeatPositions,
        mapSyllablesToBeats,
        calculateVelocity,
        generateVariation,
        quantizePattern,
        getPatternStats,
        patternToString,
        STEPS
    };
})();
