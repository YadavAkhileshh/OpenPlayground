/**
 * Optics Module
 * Handles physical light calculations.
 */
import { Vector } from './vector.js';

export const Optics = {
    /**
     * Reflects a vector off a normal.
     * R = I - 2 * (I . N) * N
     * @param {Vector} incident Incident vector
     * @param {Vector} normal Surface normal (must be normalized)
     * @returns {Vector} Reflected vector
     */
    reflect: (incident, normal) => {
        const dot = incident.dot(normal);
        return incident.sub(normal.mult(2 * dot));
    },

    /**
     * Refracts a vector through a surface using Snell's Law.
     * n1 * sin(theta1) = n2 * sin(theta2)
     * @param {Vector} incident Incident vector
     * @param {Vector} normal Surface normal
     * @param {number} n1 Refractive index of entering medium
     * @param {number} n2 Refractive index of exiting medium
     * @returns {Vector|null} Refracted vector or null if Total Internal Reflection (TIR)
     */
    refract: (incident, normal, n1, n2) => {
        const n = n1 / n2;
        const cosI = -normal.dot(incident);
        const sinT2 = n * n * (1.0 - cosI * cosI);

        // Total Internal Reflection
        if (sinT2 > 1.0) return null;

        const cosT = Math.sqrt(1.0 - sinT2);
        return incident.mult(n).add(normal.mult(n * cosI - cosT));
    },

    /**
     * Calculates the Fresnel reflectance coefficient.
     * @param {Vector} incident 
     * @param {Vector} normal 
     * @param {number} n1 
     * @param {number} n2 
     * @returns {number} Reflectance (0 to 1)
     */
    fresnel: (incident, normal, n1, n2) => {
        // Schlick's approximation could be used, but let's use exact Fresnel for unpolarized light
        const r0 = Math.pow((n1 - n2) / (n1 + n2), 2);
        const cosI = -normal.dot(incident);
        if (n1 > n2) {
            const n = n1 / n2;
            const sinT2 = n * n * (1.0 - cosI * cosI);
            if (sinT2 > 1.0) return 1.0; // TIR
            const cosT = Math.sqrt(1.0 - sinT2);
            // Re-evaluate cosI for exiting angle if needed, but for reflectance we can stick to simple R0 + ... Schlick
            // Actually let's use simple Schlick for performance/complexity balance in a game
            const x = 1.0 - cosI;
            return r0 + (1.0 - r0) * Math.pow(x, 5);
        }
        const x = 1.0 - cosI;
        return r0 + (1.0 - r0) * Math.pow(x, 5);
    },

    /**
     * Gets color for a specific wavelength (nm).
     * Simplified for game purposes (RGB).
     * @param {number} wavelength In nanometers (approx 380-750)
     * @returns {string} CSS/Hex color
     */
    wavelengthToColor: (wavelength) => {
        let r, g, b;
        if (wavelength >= 380 && wavelength < 440) {
            r = -(wavelength - 440) / (440 - 380);
            g = 0;
            b = 1;
        } else if (wavelength >= 440 && wavelength < 490) {
            r = 0;
            g = (wavelength - 440) / (490 - 440);
            b = 1;
        } else if (wavelength >= 490 && wavelength < 510) {
            r = 0;
            g = 1;
            b = -(wavelength - 510) / (510 - 490);
        } else if (wavelength >= 510 && wavelength < 580) {
            r = (wavelength - 510) / (580 - 510);
            g = 1;
            b = 0;
        } else if (wavelength >= 580 && wavelength < 645) {
            r = 1;
            g = -(wavelength - 645) / (645 - 580);
            b = 0;
        } else if (wavelength >= 645 && wavelength < 781) {
            r = 1;
            g = 0;
            b = 0;
        } else {
            r = 0;
            g = 0;
            b = 0;
        }

        // Intensity adjust
        let factor;
        if (wavelength >= 380 && wavelength < 420) {
            factor = 0.3 + 0.7 * (wavelength - 380) / (420 - 380);
        } else if (wavelength >= 420 && wavelength < 701) {
            factor = 1.0;
        } else if (wavelength >= 701 && wavelength < 781) {
            factor = 0.3 + 0.7 * (781 - wavelength) / (781 - 701);
        } else {
            factor = 0;
        }

        const R = Math.round(r * factor * 255);
        const G = Math.round(g * factor * 255);
        const B = Math.round(b * factor * 255);

        return `rgb(${R}, ${G}, ${B})`;
    }
};
