/**
 * @file stego.js
 * @description Core steganography engine for StegPlay. 
 * This module is responsible for the low-level bit manipulation and character 
 * mapping required to hide data within carrier text.
 * 
 * DESIGN PRINCIPLES:
 * 1. Invisibility: Use only zero-width Unicode characters.
 * 2. Integrity: Ensure bit-perfect reconstruction of secret data.
 * 3. Efficiency: Optimize for large payload processing.
 * 
 * THE MAPPING SYSTEM:
 * Following the project requirements, we map binary digits to invisible spaces:
 * - Binary '0': \u200C (Zero Width Non-Joiner)
 * - Binary '1': \u200B (Zero Width Space)
 * 
 * These characters are technically "spaces" in the Unicode spec but have 0 width.
 */

/**
 * StegoEngine class manages the encoding and decoding of secret messages.
 * It encapsulates the binary translation layer and the character injection logic.
 */
class StegoEngine {
    /**
     * Constructs the StegoEngine with default character mappings.
     */
    constructor() {
        /** @private */
        this._CHAR_MAP = {
            '0': '\u200C', // Zero Width Non-Joiner -> Represents Binary 0
            '1': '\u200B'  // Zero Width Space -> Represents Binary 1
        };

        /** @private */
        this._REVERSE_MAP = {
            '\u200C': '0',
            '\u200B': '1'
        };

        /**
         * The terminator is a null byte (8 bits of zero) used to mark the end 
         * of a hidden message. This prevents the decoder from attempting 
         * to parse entire documents when only a small portion is encoded.
         */
        this.TERMINATOR = '00000000';

        /**
         * Metadata Header: Fixed prefix to identify StegPlay encoded content.
         * 'SP' in binary: 01010011 01010000
         */
        this.HEADER = '0101001101010000';
    }

    /**
     * Converts a string of text into a binary string.
     * Each character is converted to its 8-bit binary representation.
     * Supports multi-byte Unicode characters via encodeURIComponent/unescape.
     * 
     * @param {string} text - The secret text to convert.
     * @returns {string} - The binary representation of the text.
     * @throws {Error} If input is invalid.
     */
    textToBinary(text) {
        if (text === null || text === undefined) return '';

        console.debug('StegoEngine: Converting text to binary sequence.');

        // We use a robust method to handle emoji and special characters
        const bytes = new TextEncoder().encode(text);
        let binaryResult = '';

        for (let i = 0; i < bytes.length; i++) {
            let bin = bytes[i].toString(2);
            // Ensure 8-bit padding for every byte
            binaryResult += '00000000'.slice(bin.length) + bin;
        }

        return binaryResult;
    }

    /**
     * Converts a binary string back into readable text.
     * Uses TextDecoder for UTF-8 compatibility.
     * 
     * @param {string} binaryString - The binary sequence to convert.
     * @returns {string} - The decoded text.
     */
    binaryToText(binaryString) {
        if (!binaryString) return '';

        // Ensure we are working with complete bytes (8 bits)
        if (binaryString.length % 8 !== 0) {
            console.warn('StegoEngine: Binary string length is not a multiple of 8. Truncating extra bits.');
            binaryString = binaryString.slice(0, binaryString.length - (binaryString.length % 8));
        }

        const bytes = new Uint8Array(binaryString.length / 8);
        for (let i = 0; i < binaryString.length; i += 8) {
            const byteString = binaryString.slice(i, i + 8);
            bytes[i / 8] = parseInt(byteString, 2);
        }

        try {
            return new TextDecoder().decode(bytes);
        } catch (e) {
            console.error('StegoEngine: UTF-8 Decoding failed.', e);
            return '';
        }
    }

    /**
     * Encodes a secret message into a carrier text.
     * 
     * THE PROCESS:
     * 1. Validate inputs.
     * 2. Convert secret to binary.
     * 3. Add StegPlay Header and Terminator.
     * 4. Map bits to zero-width characters.
     * 5. Inject pattern into carrier.
     * 
     * @param {string} carrier - The visible text (blog post content).
     * @param {string} secret - The secret message to hide.
     * @returns {string} - The carrier text with the hidden message.
     */
    encode(carrier, secret) {
        if (!secret) return carrier;
        if (!carrier) return '';

        console.info('StegoEngine: Encoding secret payload...');

        // 1. Generate Binary Payload
        const payloadBinary = this.HEADER + this.textToBinary(secret) + this.TERMINATOR;

        // 2. Map to Invisible Characters
        let invisiblePattern = '';
        for (let bit of payloadBinary) {
            invisiblePattern += this._CHAR_MAP[bit];
        }

        /**
         * INJECTION STRATEGY:
         * To blend in, we find the first space character in the carrier.
         * We inject the entire payload immediately after this space.
         * This ensures the payload is "bound" to a natural delimiter.
         */
        const firstSpaceIndex = carrier.indexOf(' ');

        if (firstSpaceIndex === -1) {
            // Edge case: No spaces in carrier. We append to start.
            return invisiblePattern + carrier;
        }

        // Return Split-Inject-Join
        return carrier.slice(0, firstSpaceIndex + 1) +
            invisiblePattern +
            carrier.slice(firstSpaceIndex + 1);
    }

    /**
     * Decodes a secret message from a carrier text.
     * 
     * THE PROCESS:
     * 1. Scan for zero-width characters.
     * 2. Translate to binary.
     * 3. Verify Header.
     * 4. Clip at Terminator.
     * 5. Translate binary back to UTF-8.
     * 
     * @param {string} text - The encoded text.
     * @returns {string} - The extracted secret message.
     */
    decode(text) {
        if (!text) return '';

        console.info('StegoEngine: Attempting extraction scan...');

        let extractedBinary = '';
        for (let char of text) {
            const bit = this._REVERSE_MAP[char];
            if (bit !== undefined) {
                extractedBinary += bit;
            }
        }

        // 1. Check for Header
        if (!extractedBinary.startsWith(this.HEADER)) {
            console.warn('StegoEngine: No StegPlay header found in sequence.');
            return '';
        }

        // 2. Remove Header
        let messageBinary = extractedBinary.slice(this.HEADER.length);

        // 3. Find Terminator
        const terminatorIndex = messageBinary.indexOf(this.TERMINATOR);
        if (terminatorIndex !== -1) {
            messageBinary = messageBinary.slice(0, terminatorIndex);
        }

        // 4. Decode
        return this.binaryToText(messageBinary);
    }

    /**
     * Diagnostics: Returns the bit distribution of a text.
     * @param {string} text - The text to analyze.
     * @returns {Object} - Stats object.
     */
    getStats(text) {
        let zwnjCount = 0;
        let zwspCount = 0;

        for (let char of text) {
            if (char === '\u200C') zwnjCount++;
            if (char === '\u200B') zwspCount++;
        }

        return {
            zeroWidthCount: zwnjCount + zwspCount,
            bits: { '0': zwnjCount, '1': zwspCount },
            estimatedBytes: Math.floor((zwnjCount + zwspCount) / 8)
        };
    }

    /**
     * Utility: Cleans all stego characters from a text.
     * @param {string} text - Input text.
     * @returns {string} - Sanitized text.
     */
    clean(text) {
        if (!text) return '';
        const regex = new RegExp(`[${this._CHAR_MAP['0']}${this._CHAR_MAP['1']}]`, 'g');
        return text.replace(regex, '');
    }
}

// Global Export
window.StegoEngine = StegoEngine;
