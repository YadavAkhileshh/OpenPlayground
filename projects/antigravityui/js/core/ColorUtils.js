// js/core/ColorUtils.js

export class ColorUtils {
    /**
     * Converts HSL to Hex
     */
    static hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    /**
     * Generates a random cosmic color
     */
    static randomCosmicColor() {
        // Cosmic colors tend to be deep blues, purples, cyans, and magentas
        const hues = [
            Math.random() * 40 + 260, // Purples & Violets (260-300)
            Math.random() * 40 + 180, // Cyans & Blues (180-220)
            Math.random() * 30 + 310  // Magentas & Pinks (310-340)
        ];

        const h = hues[Math.floor(Math.random() * hues.length)];
        const s = Math.random() * 30 + 70; // 70-100% saturation
        const l = Math.random() * 20 + 50; // 50-70% lightness

        return ColorUtils.hslToHex(h, s, l);
    }

    /**
     * Hex to RGBA
     */
    static hexToRgba(hex, alpha = 1) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}
