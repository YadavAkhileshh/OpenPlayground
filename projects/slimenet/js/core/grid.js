/**
 * SlimeNet - Pheromone Grid
 * 
 * Manages the underlying pheromone data grid.
 * UPDATED: Supports 2 Species Channels + Obstacle Map.
 */

class Grid {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.size = width * height;

        // Data arrays: [SpeciesA_Data, SpeciesB_Data]
        // We use a single large buffer or separate arrays. Separate is easier for logic.
        this.speciesMaps = [
            new Float32Array(this.size), // Species 0
            new Float32Array(this.size)  // Species 1
        ];

        // Obstacle Map: 0 = free, 1 = wall
        this.obstacles = new Uint8Array(this.size);

        // Swap buffers for diffusion
        this.nextSpeciesMaps = [
            new Float32Array(this.size),
            new Float32Array(this.size)
        ];

        this.initialized = true;
        Logger.info('Grid', `Initialized grid ${width}x${height} with 2 channels`);
    }

    clear() {
        this.speciesMaps[0].fill(0);
        this.speciesMaps[1].fill(0);
        this.obstacles.fill(0);
    }

    /**
     * Gets value for a specific species channel.
     */
    getValue(x, y, speciesId) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return 0;
        const idx = y * this.width + x;
        // If obstacle, return -1 or 0? 
        if (this.obstacles[idx] === 1) return -1;

        return this.speciesMaps[speciesId][idx];
    }

    isObstacle(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return true; // Bounds are obstacles
        return this.obstacles[y * this.width + x] === 1;
    }

    deposit(x, y, amount, speciesId) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
        const idx = y * this.width + x;
        if (this.obstacles[idx] === 1) return; // Can't deposit on walls

        this.speciesMaps[speciesId][idx] = Math.min(this.speciesMaps[speciesId][idx] + amount, 1000.0);
    }

    addObstacle(x, y, radius) {
        this.drawShape(x, y, radius, this.obstacles, 1);
        // Clear pheromones under obstacle
        this.drawShape(x, y, radius, this.speciesMaps[0], 0);
        this.drawShape(x, y, radius, this.speciesMaps[1], 0);
    }

    removeObstacle(x, y, radius) {
        this.drawShape(x, y, radius, this.obstacles, 0);
    }

    drawShape(cx, cy, radius, array, val) {
        const rSq = radius * radius;
        const w = this.width;
        const h = this.height;
        const startX = Math.max(0, cx - radius);
        const endX = Math.min(w, cx + radius);
        const startY = Math.max(0, cy - radius);
        const endY = Math.min(h, cy + radius);

        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const dx = x - cx;
                const dy = y - cy;
                if (dx * dx + dy * dy <= rSq) {
                    array[y * w + x] = val;
                }
            }
        }
    }

    addFood(x, y, radius, intensity, speciesMask = 0) {
        // speciesMask: 0 = both, 1 = species 0 only, 2 = species 1 only
        // For simplicity, food adds to BOTH channels
        if (speciesMask === 0 || speciesMask === 1) this.drawFood(x, y, radius, this.speciesMaps[0], intensity);
        if (speciesMask === 0 || speciesMask === 2) this.drawFood(x, y, radius, this.speciesMaps[1], intensity);
    }

    drawFood(cx, cy, radius, array, amount) {
        const rSq = radius * radius;
        const w = this.width;
        const h = this.height;
        const startX = Math.max(0, cx - radius);
        const endX = Math.min(w, cx + radius);
        const startY = Math.max(0, cy - radius);
        const endY = Math.min(h, cy + radius);

        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                if (this.obstacles[y * w + x] === 1) continue;

                const dx = x - cx;
                const dy = y - cy;
                if (dx * dx + dy * dy <= rSq) {
                    array[y * w + x] = Math.min(array[y * w + x] + amount, 1000.0);
                }
            }
        }
    }

    update(decayRate, diffuseRate, flowX, flowY) {
        const w = this.width;
        const h = this.height;

        // Process both channels
        for (let i = 0; i < 2; i++) {
            const src = this.speciesMaps[i];
            const dest = this.nextSpeciesMaps[i];
            const obs = this.obstacles;

            for (let y = 1; y < h - 1; y++) {
                let rowOffset = y * w;
                for (let x = 1; x < w - 1; x++) {
                    const idx = rowOffset + x;
                    if (obs[idx] === 1) {
                        dest[idx] = 0;
                        continue;
                    }

                    // 3x3 Blur
                    const sum =
                        src[idx - w - 1] + src[idx - w] + src[idx - w + 1] +
                        src[idx - 1] + src[idx] + src[idx + 1] +
                        src[idx + w - 1] + src[idx + w] + src[idx + w + 1];

                    const blurred = sum / 9.0;

                    // Apply Flow (Simple advection look-alike by sampling upstream)
                    // Note: Real advection is harder, we just cheat by shifting read-coord slightly? 
                    // No, for stability in cellular automata, simple flow is adding bias to neighbors.
                    // We'll stick to diffusion for now, Flow is 'virtual' in agent movement or we shift grid.

                    // Simple flow: we could sample from src[x - flowX, y - flowY] but keeping it integer based is standard.
                    // Let's keep it simple: just diffusion + decay

                    const diffused = src[idx] * (1 - diffuseRate) + blurred * diffuseRate;
                    dest[idx] = diffused * decayRate;
                }
            }

            // Swap
            this.speciesMaps[i].set(dest);
        }
    }
}

window.Grid = Grid;
