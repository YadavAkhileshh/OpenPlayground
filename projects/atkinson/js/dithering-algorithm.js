/**
 * Dithering Algorithms Module
 * 
 * Implements various error-diffusion dithering algorithms.
 * Allows switching between different looks.
 */

const KERNELS = {
    atkinson: [
        { x: 1, y: 0, w: 1 / 8 }, { x: 2, y: 0, w: 1 / 8 },
        { x: -1, y: 1, w: 1 / 8 }, { x: 0, y: 1, w: 1 / 8 }, { x: 1, y: 1, w: 1 / 8 },
        { x: 0, y: 2, w: 1 / 8 }
    ],
    floyd: [
        { x: 1, y: 0, w: 7 / 16 },
        { x: -1, y: 1, w: 3 / 16 },
        { x: 0, y: 1, w: 5 / 16 },
        { x: 1, y: 1, w: 1 / 16 }
    ],
    stucki: [
        { x: 1, y: 0, w: 8 / 42 }, { x: 2, y: 0, w: 4 / 42 },
        { x: -2, y: 1, w: 2 / 42 }, { x: -1, y: 1, w: 4 / 42 }, { x: 0, y: 1, w: 8 / 42 }, { x: 1, y: 1, w: 4 / 42 }, { x: 2, y: 1, w: 2 / 42 },
        { x: -2, y: 2, w: 1 / 42 }, { x: -1, y: 2, w: 2 / 42 }, { x: 0, y: 2, w: 4 / 42 }, { x: 1, y: 2, w: 2 / 42 }, { x: 2, y: 2, w: 1 / 42 }
    ],
    burkes: [
        { x: 1, y: 0, w: 8 / 32 }, { x: 2, y: 0, w: 4 / 32 },
        { x: -2, y: 1, w: 2 / 32 }, { x: -1, y: 1, w: 4 / 32 }, { x: 0, y: 1, w: 8 / 32 }, { x: 1, y: 1, w: 4 / 32 }, { x: 2, y: 1, w: 2 / 32 }
    ],
    sierra: [
        { x: 1, y: 0, w: 5 / 32 }, { x: 2, y: 0, w: 3 / 32 },
        { x: -2, y: 1, w: 2 / 32 }, { x: -1, y: 1, w: 4 / 32 }, { x: 0, y: 1, w: 5 / 32 }, { x: 1, y: 1, w: 4 / 32 }, { x: 2, y: 1, w: 2 / 32 },
        { x: -1, y: 2, w: 2 / 32 }, { x: 0, y: 2, w: 3 / 32 }, { x: 1, y: 2, w: 2 / 32 }
    ]
};

/**
 * Applies the selected dithering algorithm to the image data.
 * 
 * @param {ImageData} imageData - The standard HTML5 Canvas ImageData object.
 * @param {string} algorithm - Name of algorithm.
 * @param {number} threshold - The cutoff value (0-255).
 * @returns {ImageData} - The modified ImageData object.
 */
export function applyDither(imageData, algorithm = 'atkinson', threshold = 128) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;

    // Select kernel
    const kernel = KERNELS[algorithm] || KERNELS['atkinson'];

    // Process Pixels
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {

            const offset = (y * width + x) * 4;
            // Use Green channel for "grayscale" value as it's most luminance-heavy
            // assuming it's already grayscaled they are all equal.
            const oldPixel = data[offset];
            const newPixel = oldPixel < threshold ? 0 : 255;
            const error = oldPixel - newPixel;

            data[offset] = newPixel;
            data[offset + 1] = newPixel;
            data[offset + 2] = newPixel;

            // Distribute Error
            if (error !== 0) {
                // Inline distribution
                for (let i = 0; i < kernel.length; i++) {
                    const k = kernel[i];
                    addError(data, width, height, x + k.x, y + k.y, error * k.w);
                }
            }
        }
    }

    return imageData;
}

/**
 * Adds error to neighbor.
 */
function addError(data, width, height, x, y, errVal) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const idx = (y * width + x) * 4;

    // Read Red channel
    let val = data[idx] + errVal;

    // Clamp
    if (val < 0) val = 0;
    if (val > 255) val = 255;

    data[idx] = val;
    data[idx + 1] = val;
    data[idx + 2] = val;
}
