import { textToBinary, binaryToDNA, groupCodons } from './utils.js';
import { CODON_MAP } from './constants.js';

export class DNAEncoder {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Encodes text into a full genetic sequence with musical metadata.
     * @param {string} text - The input text to sequence.
     * @returns {Array} - Array of objects containing codon, amino acid, and musical data.
     */
    encode(text) {
        if (!text) return [];

        // 1. Text -> Binary Arrays (8-bit per char) -> Joined String
        const binaryArray = textToBinary(text);
        const fullBinaryString = binaryArray.join('');

        // 2. Binary -> DNA String
        const dnaString = binaryToDNA(fullBinaryString);

        // 3. DNA -> Codons
        const rawCodons = groupCodons(dnaString);

        // 4. Codons -> Metadata Mapping
        return rawCodons.map((codon, index) => {
            const data = CODON_MAP[codon] || {
                amino: 'Unknown',
                note: 'C',
                quality: 'min',
                type: 'Mutation'
            };

            return {
                id: index,
                codon: codon,
                amino: data.amino,
                note: data.note,
                quality: data.quality,
                type: data.type,
                // Original character mapping (approximate, since 1 char = 4 bases = 1.33 codons)
                // We don't map back strictly 1:1 visually here, but logic holds.
            };
        });
    }

    /**
     * Decodes a DNA sequence back to text (optional, for validation).
     * @param {string} dnaString 
     */
    decode(dnaString) {
        // Reverse process implementation if needed for future
        // Current scope is one-way generation
    }
}
