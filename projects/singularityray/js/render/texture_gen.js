/**
 * SingularityRay JS - Render - Texture Generation
 * Stand-in for complex galactic backgrounds using fast procedural starfields.
 * Executed once during init to avoid raymarching the background per-frame.
 */

import { Vec3 } from '../math/vec3.js';
import { MathUtils } from '../math/utils.js';

export class TextureGenerator {
    /**
     * Statically generate a procedural starfield mapped onto a sphere or cubemap equivalent.
     * We'll simulate a 360 degree 1D hash for background rays.
     */
    constructor() {
        this.starMapWidth = 1024;
        this.starMapHeight = 512; // Equirectangular mapping dimensions
        this.pixels = new Float32Array(this.starMapWidth * this.starMapHeight * 3);

        this._generate();
    }

    /**
     * Fills the internal buffer with procedural stars
     */
    _generate() {
        // Fast seeded rng
        const rng = MathUtils.seededRandom(42);

        for (let i = 0; i < 5000; i++) {
            // Random point on unit sphere
            const theta = rng() * Math.PI * 2.0;
            const phi = Math.acos(2.0 * rng() - 1.0); // uniform spherical distrib

            // Project to equirectangular map coords
            const u = theta / (Math.PI * 2.0);
            const v = phi / Math.PI;

            const px = Math.floor(u * this.starMapWidth);
            const py = Math.floor(v * this.starMapHeight);

            const idx = (py * this.starMapWidth + px) * 3;

            // Random star intensity and color (some blue, some red, mostly white)
            const temp = rng();
            let r = 1.0, g = 1.0, b = 1.0;

            if (temp < 0.2) { r = 1.0; g = 0.8; b = 0.6; } // red dwarf
            else if (temp > 0.8) { r = 0.7; g = 0.9; b = 1.0; } // blue giant

            // Make them float based (HDR support internally)
            const brightness = 0.5 + rng() * 1.5;

            // Simple additive blend
            if (idx >= 0 && idx < this.pixels.length - 2) {
                this.pixels[idx] += r * brightness;
                this.pixels[idx + 1] += g * brightness;
                this.pixels[idx + 2] += b * brightness;
            }
        }
    }

    /**
     * Sample the background given a normalized direction vector.
     * @param {Vec3} dir 
     * @returns {Vec3} Color 
     */
    sampleEnvironment(dir) {
        // Convert direction to spherical texture map UVs
        const u = 0.5 + Math.atan2(dir.z, dir.x) / (2.0 * Math.PI);
        const v = 0.5 - Math.asin(dir.y) / Math.PI;

        const x = Math.floor(u * this.starMapWidth) % this.starMapWidth;
        let y = Math.floor(v * this.starMapHeight);

        // Clamp Y
        y = MathUtils.clamp(y, 0, this.starMapHeight - 1);

        const idx = (y * this.starMapWidth + x) * 3;

        // Return sampled float value with slight background cosmic glow addition
        return new Vec3(
            this.pixels[idx] + 0.05,
            this.pixels[idx + 1] + 0.05,
            this.pixels[idx + 2] + 0.05
        );
    }
}
