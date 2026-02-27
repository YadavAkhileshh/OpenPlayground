/**
 * js/core/color.js
 * Utilities for color manipulation and conversion.
 */

export const ColorUtils = {
    // Convert RGB array [r, g, b] to CSS string rgb(r, g, b)
    rgbArrayToString: (arr, alpha = 1) => {
        if (alpha === 1) {
            return `rgb(${arr[0]}, ${arr[1]}, ${arr[2]})`;
        }
        return `rgba(${arr[0]}, ${arr[1]}, ${arr[2]}, ${alpha})`;
    },

    // Extract RGB from hex color string
    hexToRgb: (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : [255, 255, 255];
    },

    // Blend two RGB arrays based on ratio t (0-1)
    lerpColor: (color1, color2, t) => {
        return [
            Math.round(color1[0] + (color2[0] - color1[0]) * t),
            Math.round(color1[1] + (color2[1] - color1[1]) * t),
            Math.round(color1[2] + (color2[2] - color1[2]) * t)
        ];
    },

    // Fast mapping to heatmap color
    valueToHeatmap: (val, max, colorStart, colorEnd) => {
        const t = Math.min(1, Math.max(0, val / max));
        return ColorUtils.lerpColor(colorStart, colorEnd, t);
    }
};
