/**
 * DNAMusic Constants and Configuration
 * Maps genetic data to musical properties with scientific precision.
 */

export const CONFIG = {
    AUDIO: {
        BASE_FREQ: 440, // A4 Reference Frequency
        MASTER_GAIN: 0.5,
        LOOKAHEAD: 0.1, // Seconds
        SCHEDULE_AHEAD: 0.2, // Seconds
        // Compressor Settings
        COMPRESSOR: {
            THRESHOLD: -24,
            KNEE: 30,
            RATIO: 12,
            ATTACK: 0.003,
            RELEASE: 0.25
        },
        // Reverb Settings
        REVERB: {
            DURATION: 2.5,
            DECAY: 2.0,
            REVERSE: false
        }
    },
    DNA: {
        BASES: ['A', 'C', 'G', 'T'],
        BINARY_MAP: {
            '00': 'A', // Adenine
            '01': 'C', // Cytosine
            '10': 'G', // Guanine
            '11': 'T'  // Thymine
        },
        BASE_PAIRS: {
            'A': 'T',
            'T': 'A',
            'C': 'G',
            'G': 'C'
        }
    },
    // Visualizer Settings
    VISUALS: {
        COLOR_A: '#3b82f6',
        COLOR_C: '#eab308',
        COLOR_G: '#22c55e',
        COLOR_T: '#ef4444',
        ROTATION_SPEED_IDLE: 0.01,
        ROTATION_SPEED_PLAY: 0.05,
        PARTICLE_COUNT: 100
    }
};

/**
 * The Genetic Code mapped to Musical Properties.
 * 
 * Logic:
 * - Amino Acid properties trigger Chord Qualities.
 * - Hydrophobic (Non-polar) -> Minor (Introspective, contained)
 * - Polar (Hydrophilic) -> Major (Open, bright)
 * - Basic (+) -> Dominant/Add9 (Active, forward moving)
 * - Acidic (-) -> Diminished/Suspended (Unstable, seeking resolution)
 * - Stop Codons -> Pause/Silence
 * 
 * Data Sources:
 * - IUPAC-IUB Joint Commission on Biochemical Nomenclature (JCBN)
 * - Standard Genetic Code
 */
export const CODON_MAP = {
    // Phenylalanine (Non-polar) -> F Minor
    'TTT': {
        amino: 'Phenylalanine',
        abbr: 'Phe',
        letter: 'F',
        note: 'F',
        quality: 'min',
        type: 'Hydrophobic',
        chem: 'Aromatic',
        mass: 165.19
    },
    'TTC': {
        amino: 'Phenylalanine',
        abbr: 'Phe',
        letter: 'F',
        note: 'F',
        quality: 'min7',
        type: 'Hydrophobic',
        chem: 'Aromatic',
        mass: 165.19
    },

    // Leucine (Non-polar) -> G Minor / A Minor (variable)
    'TTA': { amino: 'Leucine', abbr: 'Leu', letter: 'L', note: 'G', quality: 'min', type: 'Hydrophobic', chem: 'Aliphatic', mass: 131.17 },
    'TTG': { amino: 'Leucine', abbr: 'Leu', letter: 'L', note: 'G', quality: 'min7', type: 'Hydrophobic', chem: 'Aliphatic', mass: 131.17 },
    'CTT': { amino: 'Leucine', abbr: 'Leu', letter: 'L', note: 'A', quality: 'min', type: 'Hydrophobic', chem: 'Aliphatic', mass: 131.17 },
    'CTC': { amino: 'Leucine', abbr: 'Leu', letter: 'L', note: 'A', quality: 'min7', type: 'Hydrophobic', chem: 'Aliphatic', mass: 131.17 },
    'CTA': { amino: 'Leucine', abbr: 'Leu', letter: 'L', note: 'E', quality: 'min', type: 'Hydrophobic', chem: 'Aliphatic', mass: 131.17 },
    'CTG': { amino: 'Leucine', abbr: 'Leu', letter: 'L', note: 'E', quality: 'min9', type: 'Hydrophobic', chem: 'Aliphatic', mass: 131.17 },

    // Isoleucine (Non-polar) -> D Minor
    'ATT': { amino: 'Isoleucine', abbr: 'Ile', letter: 'I', note: 'D', quality: 'min', type: 'Hydrophobic', chem: 'Aliphatic', mass: 131.17 },
    'ATC': { amino: 'Isoleucine', abbr: 'Ile', letter: 'I', note: 'D', quality: 'min7', type: 'Hydrophobic', chem: 'Aliphatic', mass: 131.17 },
    'ATA': { amino: 'Isoleucine', abbr: 'Ile', letter: 'I', note: 'D', quality: 'min9', type: 'Hydrophobic', chem: 'Aliphatic', mass: 131.17 },

    // Methionine (Start/Non-polar) -> C Major (The Root)
    'ATG': { amino: 'Methionine', abbr: 'Met', letter: 'M', note: 'C', quality: 'maj7', type: 'Start', chem: 'Sulfur-containing', mass: 149.21 },

    // Valine (Non-polar) -> B Minor
    'GTT': { amino: 'Valine', abbr: 'Val', letter: 'V', note: 'B', quality: 'min', type: 'Hydrophobic', chem: 'Aliphatic', mass: 117.15 },
    'GTC': { amino: 'Valine', abbr: 'Val', letter: 'V', note: 'B', quality: 'min7', type: 'Hydrophobic', chem: 'Aliphatic', mass: 117.15 },
    'GTA': { amino: 'Valine', abbr: 'Val', letter: 'V', note: 'B', quality: 'min', type: 'Hydrophobic', chem: 'Aliphatic', mass: 117.15 },
    'GTG': { amino: 'Valine', abbr: 'Val', letter: 'V', note: 'B', quality: 'sus4', type: 'Hydrophobic', chem: 'Aliphatic', mass: 117.15 },

    // Serine (Polar) -> C Major / G Major
    'TCT': { amino: 'Serine', abbr: 'Ser', letter: 'S', note: 'C', quality: 'maj', type: 'Polar', chem: 'Hydroxyl-containing', mass: 105.09 },
    'TCC': { amino: 'Serine', abbr: 'Ser', letter: 'S', note: 'C', quality: 'maj9', type: 'Polar', chem: 'Hydroxyl-containing', mass: 105.09 },
    'TCA': { amino: 'Serine', abbr: 'Ser', letter: 'S', note: 'G', quality: 'maj', type: 'Polar', chem: 'Hydroxyl-containing', mass: 105.09 },
    'TCG': { amino: 'Serine', abbr: 'Ser', letter: 'S', note: 'G', quality: 'maj7', type: 'Polar', chem: 'Hydroxyl-containing', mass: 105.09 },
    'AGT': { amino: 'Serine', abbr: 'Ser', letter: 'S', note: 'F', quality: 'maj', type: 'Polar', chem: 'Hydroxyl-containing', mass: 105.09 },
    'AGC': { amino: 'Serine', abbr: 'Ser', letter: 'S', note: 'F', quality: 'maj7', type: 'Polar', chem: 'Hydroxyl-containing', mass: 105.09 },

    // Proline (Non-polar/Rigid) -> Eb Major (Steady)
    'CCT': { amino: 'Proline', abbr: 'Pro', letter: 'P', note: 'Eb', quality: 'maj', type: 'Hydrophobic', chem: 'Cyclic', mass: 115.13 },
    'CCC': { amino: 'Proline', abbr: 'Pro', letter: 'P', note: 'Eb', quality: 'maj7', type: 'Hydrophobic', chem: 'Cyclic', mass: 115.13 },
    'CCA': { amino: 'Proline', abbr: 'Pro', letter: 'P', note: 'Eb', quality: 'add9', type: 'Hydrophobic', chem: 'Cyclic', mass: 115.13 },
    'CCG': { amino: 'Proline', abbr: 'Pro', letter: 'P', note: 'Eb', quality: '6', type: 'Hydrophobic', chem: 'Cyclic', mass: 115.13 },

    // Threonine (Polar) -> Bb Major
    'ACT': { amino: 'Threonine', abbr: 'Thr', letter: 'T', note: 'Bb', quality: 'maj', type: 'Polar', chem: 'Hydroxyl-containing', mass: 119.12 },
    'ACC': { amino: 'Threonine', abbr: 'Thr', letter: 'T', note: 'Bb', quality: 'maj7', type: 'Polar', chem: 'Hydroxyl-containing', mass: 119.12 },
    'ACA': { amino: 'Threonine', abbr: 'Thr', letter: 'T', note: 'Bb', quality: 'add9', type: 'Polar', chem: 'Hydroxyl-containing', mass: 119.12 },
    'ACG': { amino: 'Threonine', abbr: 'Thr', letter: 'T', note: 'Bb', quality: '6', type: 'Polar', chem: 'Hydroxyl-containing', mass: 119.12 },

    // Alanine (Non-polar) -> Ab Major
    'GCT': { amino: 'Alanine', abbr: 'Ala', letter: 'A', note: 'Ab', quality: 'maj', type: 'Hydrophobic', chem: 'Aliphatic', mass: 89.09 },
    'GCC': { amino: 'Alanine', abbr: 'Ala', letter: 'A', note: 'Ab', quality: 'maj7', type: 'Hydrophobic', chem: 'Aliphatic', mass: 89.09 },
    'GCA': { amino: 'Alanine', abbr: 'Ala', letter: 'A', note: 'Ab', quality: 'maj9', type: 'Hydrophobic', chem: 'Aliphatic', mass: 89.09 },
    'GCG': { amino: 'Alanine', abbr: 'Ala', letter: 'A', note: 'Ab', quality: 'maj', type: 'Hydrophobic', chem: 'Aliphatic', mass: 89.09 },

    // Tyrosine (Polar) -> A Major
    'TAT': { amino: 'Tyrosine', abbr: 'Tyr', letter: 'Y', note: 'A', quality: 'maj', type: 'Polar', chem: 'Aromatic', mass: 181.19 },
    'TAC': { amino: 'Tyrosine', abbr: 'Tyr', letter: 'Y', note: 'A', quality: 'maj7', type: 'Polar', chem: 'Aromatic', mass: 181.19 },

    // Stop Codons -> Silence / Resolution
    'TAA': { amino: 'Stop Codon', abbr: 'Stop', letter: '*', note: null, quality: 'stop', type: 'Stop', chem: 'Termination', mass: 0 },
    'TAG': { amino: 'Stop Codon', abbr: 'Stop', letter: '*', note: null, quality: 'stop', type: 'Stop', chem: 'Termination', mass: 0 },
    'TGA': { amino: 'Stop Codon', abbr: 'Stop', letter: '*', note: null, quality: 'stop', type: 'Stop', chem: 'Termination', mass: 0 },

    // Histidine (Basic aka Positive Charge) -> E Dominant
    'CAT': { amino: 'Histidine', abbr: 'His', letter: 'H', note: 'E', quality: 'dom7', type: 'Basic', chem: 'Basic', mass: 155.16 },
    'CAC': { amino: 'Histidine', abbr: 'His', letter: 'H', note: 'E', quality: 'dom9', type: 'Basic', chem: 'Basic', mass: 155.16 },

    // Glutamine (Polar) -> F# Major
    'CAA': { amino: 'Glutamine', abbr: 'Gln', letter: 'Q', note: 'F#', quality: 'maj', type: 'Polar', chem: 'Amide', mass: 146.15 },
    'CAG': { amino: 'Glutamine', abbr: 'Gln', letter: 'Q', note: 'F#', quality: 'maj7', type: 'Polar', chem: 'Amide', mass: 146.15 },

    // Asparagine (Polar) -> Db Major
    'AAT': { amino: 'Asparagine', abbr: 'Asn', letter: 'N', note: 'Db', quality: 'maj', type: 'Polar', chem: 'Amide', mass: 132.12 },
    'AAC': { amino: 'Asparagine', abbr: 'Asn', letter: 'N', note: 'Db', quality: 'maj7', type: 'Polar', chem: 'Amide', mass: 132.12 },

    // Lysine (Basic) -> G Dominant
    'AAA': { amino: 'Lysine', abbr: 'Lys', letter: 'K', note: 'G', quality: 'dom7', type: 'Basic', chem: 'Basic', mass: 146.19 },
    'AAG': { amino: 'Lysine', abbr: 'Lys', letter: 'K', note: 'G', quality: 'dom9', type: 'Basic', chem: 'Basic', mass: 146.19 },

    // Aspartic Acid (Acidic) -> D Diminished
    'GAT': { amino: 'Aspartic Acid', abbr: 'Asp', letter: 'D', note: 'D', quality: 'dim', type: 'Acidic', chem: 'Acidic', mass: 133.10 },
    'GAC': { amino: 'Aspartic Acid', abbr: 'Asp', letter: 'D', note: 'D', quality: 'dim7', type: 'Acidic', chem: 'Acidic', mass: 133.10 },

    // Glutamic Acid (Acidic) -> E Diminished
    'GAA': { amino: 'Glutamic Acid', abbr: 'Glu', letter: 'E', note: 'E', quality: 'dim', type: 'Acidic', chem: 'Acidic', mass: 147.13 },
    'GAG': { amino: 'Glu', abbr: 'Glu', letter: 'E', note: 'E', quality: 'dim7', type: 'Acidic', chem: 'Acidic', mass: 147.13 },

    // Cysteine (Polar/Sulfur) -> B Major with tension
    'TGT': { amino: 'Cysteine', abbr: 'Cys', letter: 'C', note: 'B', quality: 'maj7#11', type: 'Polar', chem: 'Sulfur-containing', mass: 121.16 },
    'TGC': { amino: 'Cysteine', abbr: 'Cys', letter: 'C', note: 'B', quality: 'maj7', type: 'Polar', chem: 'Sulfur-containing', mass: 121.16 },

    // Tryptophan (Non-polar) -> C# Minor
    'TGG': { amino: 'Tryptophan', abbr: 'Trp', letter: 'W', note: 'C#', quality: 'min9', type: 'Hydrophobic', chem: 'Aromatic', mass: 204.23 },

    // Arginine (Basic) -> A Dominant
    'CGT': { amino: 'Arginine', abbr: 'Arg', letter: 'R', note: 'A', quality: 'dom7', type: 'Basic', chem: 'Basic', mass: 174.20 },
    'CGC': { amino: 'Arginine', abbr: 'Arg', letter: 'R', note: 'A', quality: 'dom7b9', type: 'Basic', chem: 'Basic', mass: 174.20 },
    'CGA': { amino: 'Arginine', abbr: 'Arg', letter: 'R', note: 'A', quality: 'dom9', type: 'Basic', chem: 'Basic', mass: 174.20 },
    'CGG': { amino: 'Arginine', abbr: 'Arg', letter: 'R', note: 'A', quality: 'dom13', type: 'Basic', chem: 'Basic', mass: 174.20 },
    'AGA': { amino: 'Arginine', abbr: 'Arg', letter: 'R', note: 'A', quality: 'sus4', type: 'Basic', chem: 'Basic', mass: 174.20 },
    'AGG': { amino: 'Arginine', abbr: 'Arg', letter: 'R', note: 'A', quality: '7sus4', type: 'Basic', chem: 'Basic', mass: 174.20 },

    // Glycine (Non-polar/Small) -> Gb Major (Simple, pentatonic feel)
    'GGT': { amino: 'Glycine', abbr: 'Gly', letter: 'G', note: 'Gb', quality: 'maj', type: 'Hydrophobic', chem: 'Aliphatic', mass: 75.07 },
    'GGC': { amino: 'Glycine', abbr: 'Gly', letter: 'G', note: 'Gb', quality: 'maj6', type: 'Hydrophobic', chem: 'Aliphatic', mass: 75.07 },
    'GGA': { amino: 'Glycine', abbr: 'Gly', letter: 'G', note: 'Gb', quality: 'maj9', type: 'Hydrophobic', chem: 'Aliphatic', mass: 75.07 },
    'GGG': { amino: 'Glycine', abbr: 'Gly', letter: 'G', note: 'Gb', quality: 'maj7', type: 'Hydrophobic', chem: 'Aliphatic', mass: 75.07 }
};
