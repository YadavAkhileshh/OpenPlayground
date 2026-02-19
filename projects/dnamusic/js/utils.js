/**
 * Utility functions for DNAMusic
 */

// Converts a string to an array of 8-bit binary strings
export function textToBinary(text) {
    return text.split('').map(char => {
        return char.charCodeAt(0).toString(2).padStart(8, '0');
    });
}

// Converts a binary string to a DNA sequence
// Takes 2 bits at a time -> 1 Base
export function binaryToDNA(binaryString) {
    const map = {
        '00': 'A',
        '01': 'C',
        '10': 'G',
        '11': 'T'
    };

    let dna = '';
    for (let i = 0; i < binaryString.length; i += 2) {
        const pair = binaryString.substr(i, 2);
        // Handle odd length by padding with 0 if necessary (though 8-bit is even)
        if (pair.length < 2) {
            dna += map[pair + '0'];
        } else {
            dna += map[pair];
        }
    }
    return dna;
}

// Groups a DNA string into Codons (3 bases)
export function groupCodons(dnaString) {
    const codons = [];
    for (let i = 0; i < dnaString.length; i += 3) {
        let codon = dnaString.substr(i, 3);
        // Pad with 'A' if incomplete codon to ensure validity
        if (codon.length < 3) {
            codon = codon.padEnd(3, 'A');
        }
        codons.push(codon);
    }
    return codons;
}

// Simple unique ID generator
export function uuid() {
    return Math.random().toString(36).substring(2, 15);
}

// Color helper for visualization
export function getBaseColor(base) {
    const colors = {
        'A': '#3b82f6', // Blue
        'C': '#eab308', // Yellow
        'G': '#22c55e', // Green
        'T': '#ef4444'  // Red
    };
    return colors[base] || '#ffffff';
}

export function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}
