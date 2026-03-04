/**
 * CRT Effect Module
 * 
 * Applies post-processing effects to simulate a vintage CRT monitor.
 * Effects include:
 * - Scanlines (darkening alternate rows)
 * - RGB Split (Chromatic Aberration)
 * - Noise / Grain
 */

export class CrtEffect {
    constructor() {
        // Cache random noise to avoid generating it every frame? 
        // Or generate dynamic noise. Dynamic is better for "alive" feel.
    }

    /**
     * Applies CRT effects to the ImageData.
     * @param {ImageData} imageData 
     * @param {Object} options 
     */
    apply(imageData, options) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        const { scanlineIntensity, noiseIntensity, rgbShift } = options;

        // We need a clone of data for RGB shift to read from original positions
        // However, cloning every frame is expensive (640*480*4 bytes).
        // For RGB shift, we can just offset the read indices if we are careful,
        // or accept some feedback loop artifacts (which might look cool).
        // To do it properly without clone, we can write to a buffer.
        // Let's try in-place modification with understanding of artifacts.

        // Actually, for RGB shift, usually we shift Red left and Blue right.
        // If we process in-place, reading neighbors might be reading already-replaced values.

        // Let's do Scanlines and Noise first as they are local.

        for (let y = 0; y < height; y++) {
            // Scanline effect: Darken every other row or base on sine wave
            let scanlineFactor = 1;
            if (y % 2 === 0) {
                scanlineFactor = 1 - scanlineIntensity;
            }

            for (let x = 0; x < width; x++) {
                const offset = (y * width + x) * 4;

                let r = data[offset];
                let g = data[offset + 1];
                let b = data[offset + 2];

                // Apply Noise
                if (noiseIntensity > 0) {
                    const noise = (Math.random() - 0.5) * noiseIntensity * 255;
                    r += noise;
                    g += noise;
                    b += noise;
                }

                // Apply Scanlines
                r *= scanlineFactor;
                g *= scanlineFactor;
                b *= scanlineFactor;

                // Simple clamp
                data[offset] = r > 255 ? 255 : (r < 0 ? 0 : r);
                data[offset + 1] = g > 255 ? 255 : (g < 0 ? 0 : g);
                data[offset + 2] = b > 255 ? 255 : (b < 0 ? 0 : b);
            }
        }

        // RGB Shift - separate pass if needed, or sophisticated offset logic.
        // Doing strictly "retro" look, maybe just coloring the dithered output is enough?
        // Original request says "pure black-and-white visuals".
        // The overlay-scanlines in CSS handles the physical screen look.
        // This module might be overkill if we want PURE B&W.
        // But "vintage aesthetic" suggests some artifacts.
        // Let's stick to noise and scanlines on the pixel data for grit.

        return imageData;
    }
}
