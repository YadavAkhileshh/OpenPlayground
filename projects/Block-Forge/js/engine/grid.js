/**
 * Grid Engine
 * The Grid class manages the state of every pixel in the simulation.
 * It uses a 1D format Uint32Array for performance.
 */

import { Config, Colors } from '../core/config.js';
import { updateSand } from '../materials/sand.js';
import { updateTemperature } from '../physics/temperature.js';
import { updateElectricity } from '../materials/physics_extras.js';
import { updateAcid, updateOil } from '../materials/liquids.js';
import { updateSmoke, updateSteam } from '../materials/gas.js';
import { updatePlant, updateSeed } from '../materials/bio.js';
import { updateC4 } from '../materials/explosives.js';
import { updateVirus, updateVoid, updateSpout, updateDisco } from '../materials/special.js';

/**
 * The Grid class represents the core state of the simulation.
 * It manages a 1D array of pixel data (materials) and handles the calling
 * of update functions for each active pixel.
 * 
 * It also holds auxiliary data such as:
 * - Meta: For lifetime, variation, or state information (8-bit)
 * - Temp: For thermal simulation (Float32)
 */
export class Grid {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.size = width * height;

        // Main grid holding material IDs
        // We use Uint8Array if IDs < 255 to save memory, but Uint32 allows for extra data 
        // (like velocity bits, temperature, etc stored in same int)
        // For now, let's stick to simple ID storage.
        this.cells = new Uint8Array(this.size);

        // Auxiliary grid for processing updates without data races (Double Buffering?)
        // Actually, for falling sand, usually we just iterate smartly (bottom-up) to avoid double buffering overhead
        // But for things like fire/smoke spreading up, we might need to be careful.
        // We will try in-place updates with smart iteration order first.

        // We might need a generic "data" array for things like "fire life" or "color variation"
        // Let's use a Uint32Array for 'meta' data if needed, or keeping it simple.
        this.meta = new Uint8Array(this.size); // e.g., lifetime, variation info
        this.temp = new Float32Array(this.size); // Temperature map (Kelvin? or Celsius? let's do Celsius, 20 default)
        this.temp.fill(20);

        this.activeParticles = 0;
        this.frameCount = 0;
    }

    getIndex(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return -1;
        return y * this.width + x;
    }

    get(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return Config.MATERIALS.STONE; // treat bounds as stone
        return this.cells[y * this.width + x];
    }

    set(x, y, id) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
        this.cells[y * this.width + x] = id;
    }

    isEmpty(x, y) {
        return this.get(x, y) === Config.MATERIALS.EMPTY;
    }

    paint(cx, cy, radius, materialId) {
        const r2 = radius * radius;
        for (let y = -radius; y <= radius; y++) {
            for (let x = -radius; x <= radius; x++) {
                if (x * x + y * y <= r2) {
                    const tx = cx + x;
                    const ty = cy + y;

                    // Don't overwrite if not necessary or specialized logic
                    // Example: don't paint over stone if we don't want to
                    if (Math.random() > 0.1) { // Add some noise for natural feel
                        this.set(tx, ty, materialId);
                        // Setup initial meta if need be (random life for fire)
                        const idx = this.getIndex(tx, ty);
                        if (idx !== -1) this.meta[idx] = Math.random() * 255;
                    }
                }
            }
        }
    }

    clear() {
        this.cells.fill(0);
        this.meta.fill(0);
    }

    update(dt) {
        this.frameCount++;
        this.activeParticles = 0;

        // Reset statistics or temporary buffers if used

        // We split the update into two passes if needed, or simply alternate directions slightly 
        // to avoid bias (left-drift or right-drift).
        const oddFrame = this.frameCount % 2 === 0;

        // Iterate Bottom-Up for falling mechanics (Sand, Water)
        for (let y = this.height - 1; y >= 0; y--) {
            // Alternate X direction to prevent stacking bias
            const minX = 0;
            const maxX = this.width - 1;

            for (let i = 0; i < this.width; i++) {
                const x = oddFrame ? i : (this.width - 1 - i);
                const idx = y * this.width + x;
                const type = this.cells[idx];

                if (type === Config.MATERIALS.EMPTY) continue;
                if (type === Config.MATERIALS.STONE) continue; // Static

                this.activeParticles++;

                // Route to material logic
                this.updatePixel(x, y, idx, type, oddFrame);

                // Update Physics Layers
                // To save performance, maybe not every pixel every frame?
                // But for "conductivity" it needs to be responsive.
                // We can interleave or just run it.
                if (oddFrame) updateTemperature(this, x, y, idx);
                else updateElectricity(this, x, y, idx);
            }
        }
    }



    updatePixel(x, y, idx, type, oddFrame) {
        switch (type) {
            case Config.MATERIALS.SAND:
                updateSand(this, x, y, idx);
                break;
            case Config.MATERIALS.WATER:
                updateWater(this, x, y, idx);
                break;
            case Config.MATERIALS.FIRE:
                updateFire(this, x, y, idx);
                break;
            case Config.MATERIALS.SMOKE:
                updateSmoke(this, x, y, idx);
                break;
            case Config.MATERIALS.PLANT:
                updatePlant(this, x, y, idx);
                break;
            case Config.MATERIALS.SEED:
                // Seed acts like sand but grows
                updateSeed(this, x, y, idx);
                break;
            case Config.MATERIALS.ACID:
                updateAcid(this, x, y, idx);
                break;
            case Config.MATERIALS.OIL:
                updateOil(this, x, y, idx);
                break;
            case Config.MATERIALS.STEAM:
                updateSteam(this, x, y, idx);
                break;
            case Config.MATERIALS.GUNPOWDER:
                // Acts like sand but flammable
                updateSand(this, x, y, idx);
                break;
            case Config.MATERIALS.C4:
                updateC4(this, x, y, idx);
                break;
            case Config.MATERIALS.VIRUS:
                updateVirus(this, x, y, idx);
                break;
            case Config.MATERIALS.VOID:
                updateVoid(this, x, y, idx);
                break;
            case Config.MATERIALS.SPOUT_WATER:
            case Config.MATERIALS.SPOUT_SAND:
                updateSpout(this, x, y, idx, type);
                break;
            case Config.MATERIALS.DISCO:
                updateDisco(this, x, y, idx);
                break;
            case Config.MATERIALS.LIFE:
                this.updateLife(x, y, idx);
                break;
        }
    }

    // --- MATERIAL BEHAVIORS ---

    swap(i1, i2) {
        const temp = this.cells[i1];
        this.cells[i1] = this.cells[i2];
        this.cells[i2] = temp;

        const metaTemp = this.meta[i1];
        this.meta[i1] = this.meta[i2];
        this.meta[i2] = metaTemp;
    }

    move(i1, i2) {
        this.cells[i2] = this.cells[i1];
        this.cells[i1] = Config.MATERIALS.EMPTY;

        this.meta[i2] = this.meta[i1];
        this.meta[i1] = 0;
    }

    // ... methods moved to modules ...

    // ... methods moved to modules ...


    updateLife(x, y, idx) {
        let neighbors = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const tx = x + dx;
                const ty = y + dy;
                if (tx >= 0 && tx < this.width && ty >= 0 && ty < this.height) {
                    if (this.cells[ty * this.width + tx] === Config.MATERIALS.LIFE) neighbors++;
                }
            }
        }

        if (neighbors < 2 || neighbors > 3) {
            this.cells[idx] = Config.MATERIALS.EMPTY;
        }

        // Birth (simplistic: check random empty neighbor)
        if (Math.random() < 0.2) {
            const dirs = [-1, 0, 1];
            const dx = dirs[Math.floor(Math.random() * 3)];
            const dy = dirs[Math.floor(Math.random() * 3)];
            if (dx !== 0 || dy !== 0) {
                const tx = x + dx;
                const ty = y + dy;
                if (tx >= 0 && tx < this.width && ty >= 0 && ty < this.height) {
                    const tIdx = ty * this.width + tx;
                    if (this.cells[tIdx] === Config.MATERIALS.EMPTY) {
                        let n2 = 0;
                        for (let dy2 = -1; dy2 <= 1; dy2++) {
                            for (let dx2 = -1; dx2 <= 1; dx2++) {
                                if (dx2 === 0 && dy2 === 0) continue;
                                const tx2 = tx + dx2;
                                const ty2 = ty + dy2;
                                if (tx2 >= 0 && tx2 < this.width && ty2 >= 0 && ty2 < this.height) {
                                    if (this.cells[ty2 * this.width + tx2] === Config.MATERIALS.LIFE) n2++;
                                }
                            }
                        }
                        if (n2 === 3) this.cells[tIdx] = Config.MATERIALS.LIFE;
                    }
                }
            }
        }
    }
}