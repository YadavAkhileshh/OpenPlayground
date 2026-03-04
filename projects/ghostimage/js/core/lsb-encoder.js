import { STEG_CONFIG, ERRORS } from './constants.js';

/**
 * LSBEncoder
 * 
 * Responsible for encoding (hiding) a secret image into a cover image using
 * Least Significant Bit steganography.
 */
export class LSBEncoder {

    constructor() {
        this.bitsPerChannel = 1; // Default to 1 bit replacement
    }

    setStrength(bits) {
        this.bitsPerChannel = bits;
    }

    /**
     * Encodes the secret image data into the cover image data.
     * 
     * Algorithm Overview:
     * 1. Convert secret image pixels into a stream of bits.
     * 2. Create a header containing the secret image's width and height.
     * 3. Iterate through the cover image's RGB channels.
     * 4. Replace the last `n` bits of each cover byte with the secret bits.
     * 
     * @param {ImageData} coverData - The source pixel data.
     * @param {ImageData} secretData - The hidden pixel data.
     * @returns {ImageData} - The new modified pixel data.
     */
    encode(coverData, secretData) {
        console.time('Encoding');

        try {
            const cover = coverData.data;
            const secret = secretData.data;
            const width = secretData.width;
            const height = secretData.height;

            // 1. Prepare the bit extraction
            // We need to serialize the secret image.
            // Format: [Header: Width (16b) | Height (16b)] [Body: R, G, B, A, R, G, B, A...]

            const bitStream = [];

            // --- Header Generation ---
            // Push Width (16 bits)
            this._pushNumberToBitStream(width, 16, bitStream);
            // Push Height (16 bits)
            this._pushNumberToBitStream(height, 16, bitStream);

            // --- Body Generation ---
            // Iterate over every pixel of the secret image
            // Each pixel has 4 bytes (R, G, B, A) -> 32 bits total
            for (let i = 0; i < secret.length; i++) {
                this._pushByteToBitStream(secret[i], bitStream);
            }

            // Total bits needed
            const totalBits = bitStream.length;

            // Available capacity in cover image (using RGB only, skipping Alpha to preserve opacity)
            // cover.length / 4 pixels * 3 channels
            const availableSlots = (cover.length / 4) * 3 * this.bitsPerChannel;

            if (totalBits > availableSlots) {
                throw new Error(ERRORS.SECRET_TOO_BIG);
            }

            // 2. Embedding Process
            let bitIndex = 0;

            // Loop through cover pixels
            // i increments by 4 to jump pixel by pixel
            for (let i = 0; i < cover.length; i += 4) {
                if (bitIndex >= totalBits) break;

                // Modify Red Channel
                if (bitIndex < totalBits) {
                    cover[i] = this._embedBits(cover[i], bitStream, bitIndex);
                    bitIndex += this.bitsPerChannel;
                }

                // Modify Green Channel
                if (bitIndex < totalBits) {
                    cover[i + 1] = this._embedBits(cover[i + 1], bitStream, bitIndex);
                    bitIndex += this.bitsPerChannel;
                }

                // Modify Blue Channel
                if (bitIndex < totalBits) {
                    cover[i + 2] = this._embedBits(cover[i + 2], bitStream, bitIndex);
                    bitIndex += this.bitsPerChannel;
                }

                // Skip Alpha (i+3) - we don't touch alpha in the cover to prevent visual artifacts
            }

            console.timeEnd('Encoding');
            return coverData;

        } catch (error) {
            console.error(error);
            console.timeEnd('Encoding');
            throw error;
        }
    }

    /**
     * Helper: Replaces the LSBs of a byte with bits from the stream.
     * @param {number} byteValue - The original byte (0-255).
     * @param {Array<number>} stream - The bit stream.
     * @param {number} currentIndex - Current position in stream.
     * @returns {number} - The modified byte.
     */
    _embedBits(byteValue, stream, currentIndex) {
        let bitsToEmbed = 0;

        // Construct the chunk of bits to embed (e.g. if bitsPerChannel is 2, get 2 bits)
        for (let j = 0; j < this.bitsPerChannel; j++) {
            if (currentIndex + j < stream.length) {
                // Shift existing bits left and add new bit
                bitsToEmbed = (bitsToEmbed << 1) | stream[currentIndex + j];
            } else {
                // Pad with 0 if we ran out of data but still need to fill the channel bits
                bitsToEmbed = (bitsToEmbed << 1) | 0;
            }
        }

        // Clear the LSBs of the original byte
        // mask example for 2 bits: 11111100 (0xFC)
        // mask example for 1 bit:  11111110 (0xFE)
        const mask = 0xFF << this.bitsPerChannel;

        // Combine cleared byte with new bits
        return (byteValue & mask) | bitsToEmbed;
    }

    /**
     * Helper: Converts a number to binary bits and pushes to stream.
     */
    _pushNumberToBitStream(number, bitCount, stream) {
        for (let i = bitCount - 1; i >= 0; i--) {
            stream.push((number >> i) & 1);
        }
    }

    /**
     * Helper: Converts a byte (0-255) to 8 bits and pushes to stream.
     */
    _pushByteToBitStream(byte, stream) {
        for (let i = 7; i >= 0; i--) {
            stream.push((byte >> i) & 1);
        }
    }
}
