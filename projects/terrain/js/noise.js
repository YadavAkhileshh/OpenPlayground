/**
 * Noise.js - Procedural Noise Generation
 * Implements Perlin-style noise for terrain generation without external libraries
 */

class NoiseGenerator {
    constructor(seed = Math.random() * 10000) {
        this.seed = seed;
        this.permutation = this.generatePermutation();
    }

    /**
     * Generate permutation table for noise
     */
    generatePermutation() {
        const p = [];
        for (let i = 0; i < 256; i++) {
            p[i] = i;
        }
        
        // Shuffle using seed
        for (let i = 255; i > 0; i--) {
            const random = this.seededRandom(i);
            const j = Math.floor(random * (i + 1));
            [p[i], p[j]] = [p[j], p[i]];
        }
        
        // Duplicate for overflow
        return [...p, ...p];
    }

    /**
     * Seeded random number generator
     */
    seededRandom(n) {
        const x = Math.sin(this.seed + n) * 10000;
        return x - Math.floor(x);
    }

    /**
     * Fade function for smooth interpolation
     */
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    /**
     * Linear interpolation
     */
    lerp(t, a, b) {
        return a + t * (b - a);
    }

    /**
     * Gradient function
     */
    grad(hash, x, y) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    /**
     * 2D Perlin noise
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {number} Noise value between -1 and 1
     */
    noise2D(x, y) {
        // Find unit grid cell
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;

        // Relative position within cell
        x -= Math.floor(x);
        y -= Math.floor(y);

        // Compute fade curves
        const u = this.fade(x);
        const v = this.fade(y);

        // Hash coordinates of the 4 cube corners
        const p = this.permutation;
        const aa = p[p[X] + Y];
        const ab = p[p[X] + Y + 1];
        const ba = p[p[X + 1] + Y];
        const bb = p[p[X + 1] + Y + 1];

        // Blend results from 8 corners
        const result = this.lerp(
            v,
            this.lerp(u, this.grad(aa, x, y), this.grad(ba, x - 1, y)),
            this.lerp(u, this.grad(ab, x, y - 1), this.grad(bb, x - 1, y - 1))
        );

        return result;
    }

    /**
     * Fractal Brownian Motion (fBm) - layered noise for natural terrain
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} octaves - Number of noise layers
     * @param {number} persistence - Amplitude reduction per octave
     * @param {number} lacunarity - Frequency increase per octave
     * @returns {number} Combined noise value
     */
    fbm(x, y, octaves = 4, persistence = 0.5, lacunarity = 2.0) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            total += this.noise2D(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= lacunarity;
        }

        return total / maxValue;
    }

    /**
     * Ridge noise - creates mountain ridges
     */
    ridgedNoise(x, y, octaves = 4) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            let n = this.noise2D(x * frequency, y * frequency);
            n = 1 - Math.abs(n); // Create ridges
            n = n * n; // Sharpen
            total += n * amplitude;
            maxValue += amplitude;
            amplitude *= 0.5;
            frequency *= 2.0;
        }

        return total / maxValue;
    }

    /**
     * Billowy noise - creates cloud-like patterns
     */
    billowyNoise(x, y, octaves = 4) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            let n = this.noise2D(x * frequency, y * frequency);
            n = Math.abs(n); // Billowy effect
            total += n * amplitude;
            maxValue += amplitude;
            amplitude *= 0.5;
            frequency *= 2.0;
        }

        return total / maxValue;
    }

    /**
     * Simplex noise approximation for smoother results
     */
    simplexNoise(x, y) {
        const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
        const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;

        const s = (x + y) * F2;
        const i = Math.floor(x + s);
        const j = Math.floor(y + s);

        const t = (i + j) * G2;
        const X0 = i - t;
        const Y0 = j - t;
        const x0 = x - X0;
        const y0 = y - Y0;

        let i1, j1;
        if (x0 > y0) {
            i1 = 1;
            j1 = 0;
        } else {
            i1 = 0;
            j1 = 1;
        }

        const x1 = x0 - i1 + G2;
        const y1 = y0 - j1 + G2;
        const x2 = x0 - 1.0 + 2.0 * G2;
        const y2 = y0 - 1.0 + 2.0 * G2;

        const ii = i & 255;
        const jj = j & 255;
        const p = this.permutation;

        const gi0 = p[ii + p[jj]] % 12;
        const gi1 = p[ii + i1 + p[jj + j1]] % 12;
        const gi2 = p[ii + 1 + p[jj + 1]] % 12;

        let n0, n1, n2;

        let t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 < 0) {
            n0 = 0.0;
        } else {
            t0 *= t0;
            n0 = t0 * t0 * this.grad(gi0, x0, y0);
        }

        let t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 < 0) {
            n1 = 0.0;
        } else {
            t1 *= t1;
            n1 = t1 * t1 * this.grad(gi1, x1, y1);
        }

        let t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 < 0) {
            n2 = 0.0;
        } else {
            t2 *= t2;
            n2 = t2 * t2 * this.grad(gi2, x2, y2);
        }

        return 70.0 * (n0 + n1 + n2);
    }

    /**
     * Warped noise - domain warping for more natural terrain
     */
    warpedNoise(x, y, octaves = 4, warpStrength = 1.0) {
        const warpX = this.fbm(x + 100, y, octaves) * warpStrength;
        const warpY = this.fbm(x, y + 100, octaves) * warpStrength;
        return this.fbm(x + warpX, y + warpY, octaves);
    }

    /**
     * Generate 2D heightmap array
     */
    generateHeightmap(width, height, scale = 50, octaves = 4, persistence = 0.5) {
        const heightmap = [];
        
        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
                const nx = x / scale;
                const ny = y / scale;
                const value = this.fbm(nx, ny, octaves, persistence);
                // Normalize to 0-1 range
                row.push((value + 1) / 2);
            }
            heightmap.push(row);
        }
        
        return heightmap;
    }

    /**
     * Reset with new seed
     */
    reseed(seed) {
        this.seed = seed;
        this.permutation = this.generatePermutation();
    }
}

// Utility function for value noise (simpler alternative)
class ValueNoise {
    constructor(seed = Math.random() * 10000) {
        this.seed = seed;
    }

    random(x, y) {
        const n = Math.sin(x * 12.9898 + y * 78.233 + this.seed) * 43758.5453;
        return n - Math.floor(n);
    }

    smoothNoise(x, y) {
        const corners = (
            this.random(x - 1, y - 1) +
            this.random(x + 1, y - 1) +
            this.random(x - 1, y + 1) +
            this.random(x + 1, y + 1)
        ) / 16;

        const sides = (
            this.random(x - 1, y) +
            this.random(x + 1, y) +
            this.random(x, y - 1) +
            this.random(x, y + 1)
        ) / 8;

        const center = this.random(x, y) / 4;

        return corners + sides + center;
    }

    interpolate(a, b, t) {
        const ft = t * Math.PI;
        const f = (1 - Math.cos(ft)) * 0.5;
        return a * (1 - f) + b * f;
    }

    noise(x, y) {
        const intX = Math.floor(x);
        const intY = Math.floor(y);
        const fracX = x - intX;
        const fracY = y - intY;

        const v1 = this.smoothNoise(intX, intY);
        const v2 = this.smoothNoise(intX + 1, intY);
        const v3 = this.smoothNoise(intX, intY + 1);
        const v4 = this.smoothNoise(intX + 1, intY + 1);

        const i1 = this.interpolate(v1, v2, fracX);
        const i2 = this.interpolate(v3, v4, fracX);

        return this.interpolate(i1, i2, fracY);
    }
}
