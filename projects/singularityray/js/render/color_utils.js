/**
 * SingularityRay JS - Render - Color Utils
 * Defines functions mapping physical energy state to display RGB.
 */

import { Vec3 } from '../math/vec3.js';
import { MathUtils } from '../math/utils.js';

export const ColorUtils = {
    /**
     * Standard ACES filmic tone mapping function for high dynamic range
     * to low dynamic range [0, 1] compression. Essential for intense luminous disks.
     * @param {Vec3} color 
     * @returns {Vec3} 
     */
    acesFilm: (color) => {
        const a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;

        const mappedX = (color.x * (a * color.x + b)) / (color.x * (c * color.x + d) + e);
        const mappedY = (color.y * (a * color.y + b)) / (color.y * (c * color.y + d) + e);
        const mappedZ = (color.z * (a * color.z + b)) / (color.z * (c * color.z + d) + e);

        return new Vec3(
            MathUtils.clamp(mappedX, 0.0, 1.0),
            MathUtils.clamp(mappedY, 0.0, 1.0),
            MathUtils.clamp(mappedZ, 0.0, 1.0)
        );
    },

    /**
     * Gamma correction for final display
     * @param {Vec3} color 
     * @param {number} gamma default 2.2
     * @returns {Vec3} Output color
     */
    gammaCorrect: (color, gamma = 2.2) => {
        const invGamma = 1.0 / gamma;
        return new Vec3(
            Math.pow(color.x, invGamma),
            Math.pow(color.y, invGamma),
            Math.pow(color.z, invGamma)
        );
    },

    /**
     * Converts a generic Float RGB Vec3 [0..1] to [0..255] integer array 
     * useful for fast Uint8ClampedArray assignment.
     * @param {Vec3} color 
     * @param {number[]} outBuffer 4-element array or specific index bounds
     * @param {number} offset 
     */
    packRGBA: (color, outBuffer, offset) => {
        outBuffer[offset] = (color.x * 255.0) | 0;
        outBuffer[offset + 1] = (color.y * 255.0) | 0;
        outBuffer[offset + 2] = (color.z * 255.0) | 0;
        outBuffer[offset + 3] = 255; // Alpha opaque
    },

    /**
     * Black body radiation proxy approximating color from temperature.
     * Here we just create a fiery gradient mapping intensity to the disk.
     * @param {number} intensity [0.0 - 1.0+]
     * @returns {Vec3} RGB output
     */
    temperatureToRGB: (intensity) => {
        // Based on a hot star / accretion palette (Deep Red -> Orange -> Yellow -> White-Blue)
        let r, g, b;

        if (intensity < 0.25) {
            // Very dim: faint red to dim orange
            const t = intensity / 0.25;
            r = MathUtils.lerp(0.1, 0.6, t);
            g = MathUtils.lerp(0.0, 0.2, t);
            b = 0.0;
        } else if (intensity < 0.6) {
            // Medium: orange to bright yellow
            const t = (intensity - 0.25) / 0.35;
            r = MathUtils.lerp(0.6, 1.0, t);
            g = MathUtils.lerp(0.2, 0.8, t);
            b = MathUtils.lerp(0.0, 0.1, t);
        } else if (intensity < 0.9) {
            // Hot: yellow to white
            const t = (intensity - 0.6) / 0.3;
            r = 1.0;
            g = MathUtils.lerp(0.8, 0.95, t);
            b = MathUtils.lerp(0.1, 0.6, t);
        } else {
            // Extreme: White to faint blue (Doppler blueshift area)
            const t = Math.min((intensity - 0.9) / 0.5, 1.0);
            r = MathUtils.lerp(1.0, 0.8, t);
            g = MathUtils.lerp(0.95, 0.9, t);
            b = MathUtils.lerp(0.6, 1.0, t);
        }

        // Apply global brightness scale to allow glowing beyond 1.0 mapped
        const brightExt = intensity * 1.5;
        return new Vec3(r * brightExt, g * brightExt, b * brightExt);
    }
};
