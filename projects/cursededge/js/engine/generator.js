/**
 * World Generator
 * Uses Simplex Noise to generate interesting starting terrains.
 */

import { SimplexNoise } from './noise.js';
import { Config } from '../core/config.js';

export class WorldGenerator {
    constructor(grid) {
        this.grid = grid;
        this.noise = new SimplexNoise(Math.random());
    }

    generate(type = 'caves') {
        const width = this.grid.width;
        const height = this.grid.height;
        this.grid.clear();

        // Reset noise seed implicitly by creating new instance or we could add reseeding
        this.noise = new SimplexNoise(Math.random());

        if (type === 'caves') {
            this.generateCaves(width, height);
        } else if (type === 'islands') {
            this.generateIslands(width, height);
        } else if (type === 'city') {
            this.generateCity(width, height);
        }
    }

    generateCaves(w, h) {
        const scale = 0.02;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const n = this.noise.noise2D(x * scale, y * scale);
                // Simple threshold
                if (n > 0.2) {
                    this.grid.set(x, y, Config.MATERIALS.STONE);
                } else if (n < -0.4) {
                    if (y > h / 2) this.grid.set(x, y, Config.MATERIALS.WATER);
                }
            }
        }
    }

    generateIslands(w, h) {
        const scale = 0.015;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let n = this.noise.noise2D(x * scale, y * scale);
                // Add y gradient
                n += (y / h) * 0.5;

                if (n > 0.6) {
                    this.grid.set(x, y, Config.MATERIALS.SAND);
                } else if (n > 0.3) {
                    this.grid.set(x, y, Config.MATERIALS.DIRT); // If we had Dirt, or use Gunpowder/Spout
                    // Let's use Wood/Plant for variety
                    if (Math.random() > 0.9) this.grid.set(x, y, Config.MATERIALS.PLANT);
                    else this.grid.set(x, y, Config.MATERIALS.STONE);
                } else if (y > h * 0.6) {
                    this.grid.set(x, y, Config.MATERIALS.WATER);
                }
            }
        }
    }

    generateCity(w, h) {
        // Simple distinct blocks
        this.grid.clear();
        const groundLevel = h - 50;

        // Ground
        for (let y = groundLevel; y < h; y++) {
            for (let x = 0; x < w; x++) {
                this.grid.set(x, y, Config.MATERIALS.STONE);
            }
        }

        // Buildings
        let x = 20;
        while (x < w - 20) {
            const bWidth = 20 + Math.random() * 40;
            const bHeight = 50 + Math.random() * 150;

            if (x + bWidth >= w) break;

            // Build
            for (let by = groundLevel - bHeight; by < groundLevel; by++) {
                for (let bx = x; bx < x + bWidth; bx++) {
                    // Windows
                    if (Math.random() > 0.8) {
                        this.grid.set(bx, by, Config.MATERIALS.GLASS); // Or Empty/Light
                    } else {
                        this.grid.set(bx, by, Config.MATERIALS.STONE); // Concrete
                    }
                }
            }

            x += bWidth + 5 + Math.random() * 20;
        }
    }
}