/**
 * LindenArboretum - Color Profile Module
 * Selects colors for branches based on their generation depth.
 * Inner branches might be dark/woody, while outer tips are vibrant and glowing.
 */

import { MathUtils } from '../math/utils.js';

export class ColorProfile {
    constructor() {
        this.baseHue = 160; // Cyber-green by default
        this.saturation = 80; // %
        this.lightness = 50;  // %
        this.maxDepth = 5;
    }

    /**
     * Updates the base profile based on UI sliders or active preset.
     */
    setBaseHue(hue) {
        this.baseHue = hue;

        // Dynamically update CSS variable so the UI matches the plant color
        document.documentElement.style.setProperty('--base-hue', hue);
    }

    /**
     * Gets the color for a specific branch depth.
     * @param {number} depth - The current push stack depth
     * @param {number} maxDepth - The theoretical max depth to normalize (approx)
     */
    getColorForDepth(depth, maxDepth) {
        // Normalize depth
        const t = MathUtils.clamp(depth / (maxDepth || this.maxDepth), 0, 1);

        // Base goes from dark and desaturated (trunk) to bright and saturated (tips)
        const hueShift = MathUtils.lerp(this.baseHue - 20, this.baseHue + 20, t);
        const sat = MathUtils.lerp(30, this.saturation, t);
        const lit = MathUtils.lerp(20, this.lightness, t);

        return `hsl(${hueShift}, ${sat}%, ${lit}%)`;
    }

    /**
     * Gets the raw object for glow calculations
     */
    getGlowColor(depth, maxDepth) {
        const t = MathUtils.clamp(depth / (maxDepth || this.maxDepth), 0, 1);
        // Glow is only intense on the tips
        const glowAlpha = MathUtils.lerp(0.1, 0.8, Math.pow(t, 2));
        return `hsla(${this.baseHue}, 100%, 60%, ${glowAlpha})`;
    }
}

export const colorProfile = new ColorProfile();
