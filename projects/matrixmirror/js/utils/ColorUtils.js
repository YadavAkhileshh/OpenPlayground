/**
 * @file ColorUtils.js
 * @description Advanced color manipulation utilities.
 * Provides functions for RGB/HSL conversion, blending, and generating gradients.
 */

export class ColorUtils {
    /**
     * Convert Hex string to RGB object.
     * @param {string} hex - Hex color code (e.g. "#00ff00").
     * @returns {Object} {r, g, b}
     */
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Convert RGB to Hex string.
     * @param {number} r 
     * @param {number} g 
     * @param {number} b 
     * @returns {string} Hex color string.
     */
    static rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    /**
     * Convert HSL to RGB.
     * @param {number} h - Hue (0-360)
     * @param {number} s - Saturation (0-1)
     * @param {number} l - Lightness (0-1)
     * @returns {Object} {r, g, b}
     */
    static hslToRgb(h, s, l) {
        let r, g, b;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = hue2rgb(p, q, h / 360 + 1 / 3);
            g = hue2rgb(p, q, h / 360);
            b = hue2rgb(p, q, h / 360 - 1 / 3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    /**
     * Interpolate between two colors.
     * @param {Object} color1 - {r,g,b}
     * @param {Object} color2 - {r,g,b}
     * @param {number} factor - 0.0 to 1.0
     * @returns {Object} Interpolated color {r,g,b}
     */
    static lerpColor(color1, color2, factor) {
        const result = {
            r: Math.round(color1.r + factor * (color2.r - color1.r)),
            g: Math.round(color1.g + factor * (color2.g - color1.g)),
            b: Math.round(color1.b + factor * (color2.b - color1.b))
        };
        return result;
    }

    /**
     * Generate a random Matrix green variant.
     * @returns {string} CSS color string.
     */
    static randomMatrixGreen() {
        const g = Math.floor(Math.random() * 200) + 55; // 55-255
        return \`rgb(0, \${g}, 0)\`;
    }

    /**
     * Apply brightness adjustment to an RGB color.
     * @param {Object} rgb - {r,g,b}
     * @param {number} factor - Multiplier (e.g. 1.2 for 20% brighter)
     * @returns {Object}
     */
    static brightness(rgb, factor) {
        return {
            r: Math.min(255, Math.floor(rgb.r * factor)),
            g: Math.min(255, Math.floor(rgb.g * factor)),
            b: Math.min(255, Math.floor(rgb.b * factor))
        };
    }
}
