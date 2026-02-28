/**
 * @file colormap.js
 * @description Generates color palettes for fluid visualization.
 */

/**
 * Generate a color table for a specific colormap.
 * @param {string} name - Name of the colormap ('jet', 'magma', 'grayscale', 'velocity')
 * @param {number} size - Size of the lookup table (default 256)
 * @returns {Uint8Array} - RGB flat array (size * 3) or RGBA (size * 4)
 */
export function generateColormap(name, size = 256) {
    const table = new Uint8Array(size * 4); // RGBA

    for (let i = 0; i < size; i++) {
        const t = i / (size - 1);
        let r = 0, g = 0, b = 0;

        switch (name) {
            case 'grayscale':
                r = g = b = t * 255;
                break;

            case 'magma':
                // Approximation of Magma
                // Simple interpolation
                // Dark purple -> Red -> Yellow -> White
                if (t < 0.33) {
                    // Dark Purple to Red
                    const localT = t / 0.33;
                    r = localT * 255;
                    g = 0;
                    b = (1 - localT) * 100; // faint purple
                } else if (t < 0.66) {
                    // Red to Yellow
                    const localT = (t - 0.33) / 0.33;
                    r = 255;
                    g = localT * 255;
                    b = 0;
                } else {
                    // Yellow to White
                    const localT = (t - 0.66) / 0.34;
                    r = 255;
                    g = 255;
                    b = localT * 255;
                }
                break;

            case 'velocity':
                // Blue (slow) -> White -> Red (fast)
                // Actually usually Blue -> Green -> Red or similar physics map
                // Let's do a custom Blue -> Cyan -> Green -> Yellow -> Red
                // Or simplified: Blue (Low) -> Red (High)

                // standard:
                // 0.0-0.25: Blue -> Cyan
                // 0.25-0.5: Cyan -> Green
                // 0.5-0.75: Green -> Yellow
                // 0.75-1.0: Yellow -> Red

                {
                    const val = t * 4;
                    if (val < 1) { // Blue -> Cyan
                        r = 0; g = val * 255; b = 255;
                    } else if (val < 2) { // Cyan -> Green
                        r = 0; g = 255; b = (2 - val) * 255;
                    } else if (val < 3) { // Green -> Yellow
                        r = (val - 2) * 255; g = 255; b = 0;
                    } else { // Yellow -> Red
                        r = 255; g = (4 - val) * 255; b = 0;
                    }
                }
                break;

            case 'jet':
            default:
                // Standard Jet
                // 4.0 * t - 1.5, -0.5, +0.5, +1.5
                {
                    const v = t;
                    const one = 1.0 / 8.0;
                    // Simple Jet
                    // Blue (0) -> Cyan (0.33) -> Yellow (0.66) -> Red (1.0)
                    // Let's use a standard formula
                    function clamp(x) { return Math.max(0, Math.min(1, x)); }
                    r = clamp(1.5 - Math.abs(2.0 * v - 1.0) * 3.0) * 255;
                    g = clamp(1.5 - Math.abs(2.0 * v - 0.5) * 3.0) * 255;
                    b = clamp(1.5 - Math.abs(2.0 * v + 0.5) * 3.0) * 255;
                    // Fix formula for JS
                    r = 255 * Math.min(Math.max(1.5 - Math.abs(4.0 * t - 3.0), 0), 1);
                    g = 255 * Math.min(Math.max(1.5 - Math.abs(4.0 * t - 2.0), 0), 1);
                    b = 255 * Math.min(Math.max(1.5 - Math.abs(4.0 * t - 1.0), 0), 1);
                }
        }

        table[i * 4 + 0] = Math.floor(r);
        table[i * 4 + 1] = Math.floor(g);
        table[i * 4 + 2] = Math.floor(b);
        table[i * 4 + 3] = 255; // Alpha
    }
    return table;
}
