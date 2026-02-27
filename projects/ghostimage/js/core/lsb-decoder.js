import { STEG_CONFIG, ERRORS } from './constants.js';
import { ImageProcessor } from './image-processor.js';

/**
 * LSBDecoder
 * 
 * Responsible for extracting (revealing) a hidden image from an encoded cover image.
 */
export class LSBDecoder {

    constructor() {
        this.bitsPerChannel = 1; // Default
    }

    /**
     * Decodes the hidden image from the given cover image data.
     * 
     * Algorithm Overview:
     * 1. Iterate through cover pixels (RGB channels).
     * 2. Extract the last `n` bits from each byte.
     * 3. Reconstruct the bit stream.
     * 4. Parse the header first (width/height).
     * 5. Parse the body based on dimensions.
     * 6. Construct the new ImageData object.
     * 
     * @param {ImageData} encodedData - The source image data with hidden content.
     * @returns {ImageData} - The extracted secret image.
     */
    decode(encodedData) {
        console.time('Decoding');

        try {
            const data = encodedData.data;
            const bitStream = [];

            // We need to read enough bits to at least get the header.
            // Header size = 32 bits (16 w + 16 h).
            // But we don't know the exact length of the body yet.
            // So we stream read.

            // 1. Extract ALL LSBs from the image first (naive approach, but simpler for memory in JS)
            // Optimization: In a huge image, we might want to stop once we have enough, 
            // but we don't know how much "enough" is until we read the header.

            // Let's read the first 32 bits * (1/bitsPerChannel) pixels to get the header.
            // Actually, let's just create a generator or a robust reader.

            let currentBitIndex = 0;
            // Buffer to hold reconstructed bytes
            const headerBytes = [];
            let currentByte = 0;
            let bitsInByte = 0;

            // Variables for Dimensions
            let secretWidth = 0;
            let secretHeight = 0;
            let headerParsed = false;

            // Array to hold the final pixel data of the secret image
            // We'll initialize it once we know the size
            let secretPixelData = null;
            let pixelDataIndex = 0;

            // Iterate over the cover image
            for (let i = 0; i < data.length; i += 4) {
                // Channels: R, G, B
                const channels = [data[i], data[i + 1], data[i + 2]];

                for (let c = 0; c < 3; c++) {
                    const val = channels[c];

                    // Extract LSBs
                    const extractedBits = val & ((1 << this.bitsPerChannel) - 1);

                    // Add bits to our current constructing byte
                    // Note: If bitsPerChannel > 1, we need to add them carefully.
                    // We need to loop through the extracted bits from MSB to LSB convention of the chunk

                    for (let b = this.bitsPerChannel - 1; b >= 0; b--) {
                        const bit = (extractedBits >> b) & 1;

                        currentByte = (currentByte << 1) | bit;
                        bitsInByte++;

                        if (bitsInByte === 8) {
                            // We have a full byte!

                            if (!headerParsed) {
                                headerBytes.push(currentByte);

                                // Check if we have enough for header (4 bytes = 32 bits)
                                if (headerBytes.length === 4) {
                                    // Parse Dimensions
                                    // Width is first 2 bytes
                                    secretWidth = (headerBytes[0] << 8) | headerBytes[1];
                                    // Height is next 2 bytes
                                    secretHeight = (headerBytes[2] << 8) | headerBytes[3];

                                    // Validate sanity of dimensions
                                    if (secretWidth <= 0 || secretHeight <= 0 || secretWidth > 10000 || secretHeight > 10000) {
                                        // This likely signifies that no data is hidden or we used wrong bit depth
                                        // But for now, we assume valid input or throw garbage
                                        // Ideally we would look for a "GI" magic string first.
                                    }

                                    // Initialize output buffer
                                    // 4 bytes per pixel (RGBA)
                                    secretPixelData = new Uint8ClampedArray(secretWidth * secretHeight * 4);
                                    headerParsed = true;
                                }
                            } else {
                                // Header is done, we are reading body now
                                if (pixelDataIndex < secretPixelData.length) {
                                    secretPixelData[pixelDataIndex] = currentByte;
                                    pixelDataIndex++;
                                } else {
                                    // We are done reading!
                                    // Break out of all loops
                                    break;
                                }
                            }

                            // Reset byte buffer
                            currentByte = 0;
                            bitsInByte = 0;
                        }
                    }
                    if (headerParsed && pixelDataIndex >= secretPixelData.length) break;
                }
                if (headerParsed && pixelDataIndex >= secretPixelData.length) break;
            }

            if (!secretPixelData) {
                throw new Error("Could not extract valid image header.");
            }

            console.timeEnd('Decoding');

            // Create final ImageData
            return new ImageData(secretPixelData, secretWidth, secretHeight);

        } catch (error) {
            console.error(error);
            console.timeEnd('Decoding');
            throw new Error(ERRORS.DECODE_FAILED);
        }
    }
}
