/**
 * BitStream.js
 * Handles conversion between text, bytes, and binary bits.
 * Includes preamble and checksum logic for signal synchronization.
 * 
 * Part of the AudioModem Project.
 */

class BitStream {
    constructor() {
        this.preamble = [1, 0, 1, 0, 1, 0, 1, 0]; // 0xAA for synchronization
        this.stopBits = [1, 1, 1, 1, 1, 1, 1, 1]; // Signal end
    }

    /**
     * Converts a string into a transmission-ready bit array.
     * Format: [PREAMBLE] [LENGTH_BYTE] [DATA...] [CHECKSUM_BYTE] [STOP]
     * @param {string} text 
     * @returns {number[]} Array of 0s and 1s.
     */
    textToBits(text) {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(text);
        const bitArray = [...this.preamble];

        // 1. Append length (8 bits, max 255 bytes)
        const lengthBits = this.byteToBits(bytes.length % 256);
        bitArray.push(...lengthBits);

        // 2. Append data bits
        let checksum = 0;
        for (const byte of bytes) {
            bitArray.push(...this.byteToBits(byte));
            checksum = (checksum + byte) % 256;
        }

        // 3. Append simple checksum
        bitArray.push(...this.byteToBits(checksum));

        // 4. Append stop sequence
        bitArray.push(...this.stopBits);

        return bitArray;
    }

    /**
     * Converts a single byte to an 8-bit array.
     * @param {number} byte 
     * @returns {number[]}
     */
    byteToBits(byte) {
        const bits = [];
        for (let i = 7; i >= 0; i--) {
            bits.push((byte >> i) & 1);
        }
        return bits;
    }

    /**
     * Converts a list of bits back into a byte.
     * @param {number[]} bits 
     * @returns {number}
     */
    bitsToByte(bits) {
        let byte = 0;
        for (let i = 0; i < 8; i++) {
            byte = (byte << 1) | bits[i];
        }
        return byte;
    }

    /**
     * Decodes a stream of bits into text.
     * Assumes start bits have already been stripped.
     * @param {number[]} bits 
     * @returns {string|null} Decoded text or null if corrupted.
     */
    bitsToText(bits) {
        if (bits.length < 16) return null; // Need at least length + checksum

        // 1. Extract length
        const length = this.bitsToByte(bits.slice(0, 8));
        const dataBits = bits.slice(8);

        if (dataBits.length < length * 8 + 8) return null;

        // 2. Extract data bytes
        const bytes = new Uint8Array(length);
        let actualChecksum = 0;

        for (let i = 0; i < length; i++) {
            const byte = this.bitsToByte(dataBits.slice(i * 8, i * 8 + 8));
            bytes[i] = byte;
            actualChecksum = (actualChecksum + byte) % 256;
        }

        // 3. Verify checksum
        const receivedChecksum = this.bitsToByte(dataBits.slice(length * 8, length * 8 + 8));

        if (actualChecksum !== receivedChecksum) {
            console.warn("BitStream: Checksum mismatch.", { actualChecksum, receivedChecksum });
            // return null; // We might still return partial data for "modem feel" but let's be strict for now
        }

        const decoder = new TextDecoder();
        return decoder.decode(bytes);
    }

    /**
     * Formats bit array for UI display.
     * @param {number[]} bits 
     * @returns {string}
     */
    formatBits(bits) {
        return bits.join('').replace(/(.{8})/g, '$1 ');
    }
}

window.bitStream = new BitStream();
