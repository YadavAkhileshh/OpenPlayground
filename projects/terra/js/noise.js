/**
 * Noise Generation Utilities
 * Provides various noise functions for procedural generation
 */

export class NoiseGenerator {
    constructor(seed = Math.random() * 10000) {
        this.seed = seed;
    }

    // Simple hash function for seeded randomness
    hash(x, y, z = 0) {
        const n = Math.sin(x * 12.9898 + y * 78.233 + z * 45.164 + this.seed) * 43758.5453;
        return n - Math.floor(n);
    }

    // 3D Perlin-like noise
    noise3D(x, y, z) {
        const X = Math.floor(x);
        const Y = Math.floor(y);
        const Z = Math.floor(z);

        const xf = x - X;
        const yf = y - Y;
        const zf = z - Z;

        const u = this.fade(xf);
        const v = this.fade(yf);
        const w = this.fade(zf);

        const aaa = this.hash(X, Y, Z);
        const aba = this.hash(X, Y + 1, Z);
        const aab = this.hash(X, Y, Z + 1);
        const abb = this.hash(X, Y + 1, Z + 1);
        const baa = this.hash(X + 1, Y, Z);
        const bba = this.hash(X + 1, Y + 1, Z);
        const bab = this.hash(X + 1, Y, Z + 1);
        const bbb = this.hash(X + 1, Y + 1, Z + 1);

        const x1 = this.lerp(aaa, baa, u);
        const x2 = this.lerp(aba, bba, u);
        const y1 = this.lerp(x1, x2, v);

        const x3 = this.lerp(aab, bab, u);
        const x4 = this.lerp(abb, bbb, u);
        const y2 = this.lerp(x3, x4, v);

        return this.lerp(y1, y2, w);
    }

    // Simplex-style noise for better performance
    simplexNoise(x, y, z) {
        return this.noise3D(x, y, z) * 2 - 1;
    }

    // Fractal Brownian Motion (FBM) - layered noise
    fbm(x, y, z, octaves = 6, persistence = 0.5, lacunarity = 2.0) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            total += this.simplexNoise(
                x * frequency,
                y * frequency,
                z * frequency
            ) * amplitude;

            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= lacunarity;
        }

        return total / maxValue;
    }

    // Ridged multifractal noise (good for mountain ridges)
    ridgedNoise(x, y, z, octaves = 6) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;

        for (let i = 0; i < octaves; i++) {
            const n = Math.abs(this.simplexNoise(
                x * frequency,
                y * frequency,
                z * frequency
            ));
            total += (1 - n) * amplitude;

            amplitude *= 0.5;
            frequency *= 2;
        }

        return total;
    }

    // Turbulence (absolute value of noise for varied terrain)
    turbulence(x, y, z, size = 32) {
        let value = 0;
        let scale = size;

        while (scale > 1) {
            value += Math.abs(this.simplexNoise(
                x / scale,
                y / scale,
                z / scale
            )) * scale;
            scale /= 2;
        }

        return value / size;
    }

    // Voronoi-style cellular noise for plate-like patterns
    voronoi(x, y, z, cellSize = 1.0) {
        const xi = Math.floor(x / cellSize);
        const yi = Math.floor(y / cellSize);
        const zi = Math.floor(z / cellSize);

        let minDist = Infinity;

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dz = -1; dz <= 1; dz++) {
                    const cellX = xi + dx;
                    const cellY = yi + dy;
                    const cellZ = zi + dz;

                    const pointX = cellX + this.hash(cellX, cellY, cellZ) - 0.5;
                    const pointY = cellY + this.hash(cellY, cellZ, cellX) - 0.5;
                    const pointZ = cellZ + this.hash(cellZ, cellX, cellY) - 0.5;

                    const dist = Math.sqrt(
                        Math.pow((x / cellSize) - pointX, 2) +
                        Math.pow((y / cellSize) - pointY, 2) +
                        Math.pow((z / cellSize) - pointZ, 2)
                    );

                    minDist = Math.min(minDist, dist);
                }
            }
        }

        return minDist;
    }

    // Utility functions
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(a, b, t) {
        return a + t * (b - a);
    }

    // Map value from one range to another
    map(value, inMin, inMax, outMin, outMax) {
        return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
    }

    // Clamp value between min and max
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
}

// Spherical coordinate utilities
export class SphericalUtils {
    // Convert Cartesian (x, y, z) to Spherical (radius, theta, phi)
    static cartesianToSpherical(x, y, z) {
        const radius = Math.sqrt(x * x + y * y + z * z);
        const theta = Math.atan2(y, x); // azimuth
        const phi = Math.acos(z / radius); // polar angle

        return { radius, theta, phi };
    }

    // Convert Spherical to Cartesian
    static sphericalToCartesian(radius, theta, phi) {
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);

        return { x, y, z };
    }

    // Get latitude from spherical coordinates (-90 to 90)
    static getLatitude(phi) {
        return 90 - (phi * 180 / Math.PI);
    }

    // Get longitude from spherical coordinates (-180 to 180)
    static getLongitude(theta) {
        return theta * 180 / Math.PI;
    }

    // Calculate distance between two points on a sphere
    static sphericalDistance(theta1, phi1, theta2, phi2) {
        const dPhi = phi2 - phi1;
        const dTheta = theta2 - theta1;

        const a = Math.sin(dPhi / 2) ** 2 +
                  Math.cos(phi1) * Math.cos(phi2) * Math.sin(dTheta / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return c;
    }
}

// Color utilities for terrain visualization
export class ColorUtils {
    // Interpolate between two colors
    static lerpColor(color1, color2, t) {
        return {
            r: color1.r + (color2.r - color1.r) * t,
            g: color1.g + (color2.g - color1.g) * t,
            b: color1.b + (color2.b - color1.b) * t
        };
    }

    // Convert RGB to hex
    static rgbToHex(r, g, b) {
        const toHex = (c) => {
            const hex = Math.round(c * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return '#' + toHex(r) + toHex(g) + toHex(b);
    }

    // Get color based on height and climate
    static getTerrainColor(height, latitude, temperature, moisture) {
        // Water
        if (height < 0) {
            const depth = Math.abs(height);
            return {
                r: 0.07 - depth * 0.05,
                g: 0.33 - depth * 0.1,
                b: 0.67 - depth * 0.2
            };
        }

        // Land
        const absLat = Math.abs(latitude);
        
        // Polar ice
        if (absLat > 70 || (temperature < -10 && height > 0.3)) {
            return { r: 0.95, g: 0.95, b: 1.0 };
        }

        // Tundra
        if (absLat > 60 || (temperature < 0 && height > 0.2)) {
            return { r: 0.53, g: 0.8, b: 1.0 };
        }

        // Mountains (high elevation)
        if (height > 0.5) {
            const snowLine = 0.6 + (absLat / 90) * 0.2;
            if (height > snowLine) {
                return { r: 0.9, g: 0.9, b: 0.95 };
            }
            return { r: 0.4, g: 0.35, b: 0.3 };
        }

        // Desert (low moisture)
        if (moisture < 0.3) {
            return { r: 0.87, g: 0.8, b: 0.33 };
        }

        // Tropical (low latitude, high moisture)
        if (absLat < 30 && moisture > 0.6) {
            return { r: 0.13, g: 0.53, b: 0.2 };
        }

        // Temperate (default)
        const greenness = 0.4 + moisture * 0.3;
        return { r: 0.2, g: greenness, b: 0.15 };
    }
}

export default { NoiseGenerator, SphericalUtils, ColorUtils };
