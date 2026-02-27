/**
 * QuadCompress Color Utilities
 * 
 * Helper functions for manipulating color data, converting formats,
 * and calculating basic color metrics.
 * 
 * @module ColorUtils
 */

/**
 * Converts distinct RGB values to a CSS hex string
 * @param {number} r 
 * @param {number} g 
 * @param {number} b 
 * @returns {string} Hex color string (e.g., "#ff0000")
 */
export function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Converts distinct RGB values to a CSS rgb() string
 * @param {number} r 
 * @param {number} g 
 * @param {number} b 
 * @returns {string} CSS string "rgb(r,g,b)"
 */
export function rgbToCss(r, g, b) {
    return `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
}

/**
 * Calculates the perceived luminance of a color
 * Standard formula: 0.299R + 0.587G + 0.114B
 * @param {number} r 
 * @param {number} g 
 * @param {number} b 
 * @returns {number} 0-255 luminance value
 */
export function getLuminance(r, g, b) {
    return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Extracts a specific pixel's color from a flat Uint8ClampedArray
 * @param {Uint8ClampedArray} data - The entire image data array
 * @param {number} x - Target X coordinate
 * @param {number} y - Target Y coordinate
 * @param {number} width - Width of the image source
 * @returns {Object} {r, g, b, a}
 */
export function getPixel(data, x, y, width) {
    const i = (y * width + x) * 4;
    return {
        r: data[i],
        g: data[i + 1],
        b: data[i + 2],
        a: data[i + 3]
    };
}

/**
 * Calculates the average color of a region directly from the buffer.
 * Optimized for performance by striding if necessary (though strictly we check all for accuracy).
 * 
 * @param {Uint8ClampedArray} data 
 * @param {number} startX 
 * @param {number} startY 
 * @param {number} w 
 * @param {number} h 
 * @param {number} strideWidth - The full width of the source image
 * @returns {Object} {r, g, b}
 */
export function getAverageColor(data, startX, startY, w, h, strideWidth) {
    let rSum = 0, gSum = 0, bSum = 0;
    let count = 0;

    // Boundary checks
    const endX = startX + w;
    const endY = startY + h;

    for (let y = startY; y < endY; y++) {
        // Calculate row offset once per row
        const rowOffset = y * strideWidth * 4;
        for (let x = startX; x < endX; x++) {
            const i = rowOffset + (x * 4);
            rSum += data[i];
            gSum += data[i + 1];
            bSum += data[i + 2];
            count++;
        }
    }

    if (count === 0) return { r: 0, g: 0, b: 0 };

    return {
        r: Math.floor(rSum / count),
        g: Math.floor(gSum / count),
        b: Math.floor(bSum / count)
    };
}
