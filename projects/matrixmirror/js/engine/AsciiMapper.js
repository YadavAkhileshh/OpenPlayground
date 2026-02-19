/**
 * @file AsciiMapper.js
 * @description Advanced ASCII mapping logic with multiple strategies.
 */

export class AsciiMapper {
    constructor() {
        this.charSets = {
            standard: ' .:-=+*#%@',
            matrix: ' 01',
            blocks: ' ░▒▓█',
            custom: ' .`^",:;Il!i~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
            katakana: 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'
        };

        // Pre-compute brightness maps for custom charsets later if needed
    }

    /**
     * getBrightness: Calculate luminance from RGB
     */
    getBrightness(r, g, b) {
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    }

    /**
     * Map a frame of pixels using different strategies.
     * @param {Uint8ClampedArray} pixelData - RGBA data.
     * @param {number} cols - Grid columns.
     * @param {number} rows - Grid rows.
     * @param {Object} config - App configuration.
     * @returns {Array} 2D array of { char, color } objects.
     */
    mapFrame(pixelData, cols, rows, config) {
        if (!pixelData) return [];

        const grid = [];
        const chars = this.charSets[config.charSet] || this.charSets.custom;
        const charLen = chars.length;

        // This mapper assumes pixelData is already resized to cols x rows
        // So we just iterate 1:1

        for (let y = 0; y < rows; y++) {
            const row = [];
            for (let x = 0; x < cols; x++) {
                const i = (y * cols + x) * 4;
                const r = pixelData[i];
                const g = pixelData[i + 1];
                const b = pixelData[i + 2];

                let brightness = this.getBrightness(r, g, b);

                // Invert if needed
                if (config.invert) brightness = 1.0 - brightness;

                // Contrast/Brightness
                brightness = (brightness - 0.5) * config.contrast + 0.5 + (config.brightness - 1.0);

                // Clamp
                if (brightness < 0) brightness = 0;
                if (brightness > 1) brightness = 1;

                // Character Mapping
                const charIndex = Math.floor(brightness * (charLen - 1));
                const char = chars[charIndex];

                // Color Mapping
                let color;

                if (config.colorMode === 'truecolor') {
                    // Use original color
                    color = \`rgb(\${r}, \${g}, \${b})\`;
                } else if (config.colorMode === 'heatmap') {
                   // Heatmap logic (Blue -> Red)
                   const h = (1.0 - brightness) * 240;
                   color = \`hsl(\${h}, 100%, 50%)\`;
                } else {
                   // Default Matrix Green
                   if (brightness > 0.85) {
                       color = '#fff';
                   } else {
                       // Remap brightness to green intensity
                       // We want darker chars to still be visible if they are part of the image
                       const gVal = Math.floor(Math.max(40, brightness * 255));
                       color = \`rgb(0, \${gVal}, 0)\`; // Standard green
                   }
                }

                row.push({ char, color, brightness });
            }
            grid.push(row);
        }
        return grid;
    }
}
