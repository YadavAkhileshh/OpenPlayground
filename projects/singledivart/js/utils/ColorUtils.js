/**
 * ColorUtils - Color manipulation helpers for SingleDivArt
 */

const ColorUtils = (() => {

    /**
     * Converts RGB to Hex
     */
    const rgbToHex = (r, g, b) => {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    };

    /**
     * Converts Hex to RGB
     */
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    /**
     * Linearly interpolates between two colors
     */
    const lerpColor = (color1, color2, t) => {
        const c1 = hexToRgb(color1);
        const c2 = hexToRgb(color2);

        if (!c1 || !c2) return "#000000";

        const r = Math.round(MathUtils.lerp(c1.r, c2.r, t));
        const g = Math.round(MathUtils.lerp(c1.g, c2.g, t));
        const b = Math.round(MathUtils.lerp(c1.b, c2.b, t));

        return rgbToHex(r, g, b);
    };

    /**
     * Generates a random color palette
     */
    const generatePalette = (baseHue, count = 5) => {
        const palette = [];
        for (let i = 0; i < count; i++) {
            const h = (baseHue + (i * (360 / count))) % 360;
            palette.push(`hsl(${h}, 70%, 60%)`);
        }
        return palette;
    };

    /**
     * Converts HSL string to RGB object
     */
    const hslToRgb = (h, s, l) => {
        s /= 100;
        l /= 100;
        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return {
            r: Math.round(255 * f(0)),
            g: Math.round(255 * f(8)),
            b: Math.round(255 * f(4))
        };
    };

    /**
     * Get a color from a simple noise value
     */
    const colorFromNoise = (noiseVal) => {
        const h = Math.floor(noiseVal * 360);
        const s = 60 + (noiseVal * 40);
        const l = 40 + (noiseVal * 20);
        return `hsl(${h}, ${s}%, ${l}%)`;
    };

    return {
        rgbToHex,
        hexToRgb,
        lerpColor,
        generatePalette,
        hslToRgb,
        colorFromNoise
    };

})();

// Ensure global accessibility
window.ColorUtils = ColorUtils;
