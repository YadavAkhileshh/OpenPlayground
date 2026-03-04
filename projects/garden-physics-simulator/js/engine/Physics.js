/**
 * Physics Engine
 * Handles the cellular automata and heightmap displacement for the sand surface.
 */
export class PhysicsEngine {
    constructor(width, height) {
        this.width = width;
        this.height = height;

        // Heightmap: 1D array representing a 2D grid
        // Values range from -1.0 to 1.0 (relative to mean sand level)
        this.heightmap = new Float32Array(width * height);
        this.stones = []; // Array of stone objects {x, y, radius}

        this.init();
    }

    init() {
        this.heightmap.fill(0);
        // Add subtle noise for "natural" look
        for (let i = 0; i < this.heightmap.length; i++) {
            this.heightmap[i] = (Math.random() - 0.5) * 0.05;
        }
    }

    /**
     * Displacement Logic (Raking)
     */
    applyRake(x, y, radius, strength) {
        // Convert screen coordinates to grid coordinates
        const gx = Math.floor(x * this.width);
        const gy = Math.floor(y * this.height);
        const r = Math.floor(radius * this.width);

        for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
                const nx = gx + dx;
                const ny = gy + dy;

                if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                    const distSq = dx * dx + dy * dy;
                    if (distSq < r * r) {
                        const falloff = 1 - Math.sqrt(distSq) / r;
                        const idx = ny * this.width + nx;

                        // Wave pattern simulation
                        // We use a sine wave based on distance to create "furrows"
                        const frequency = 0.8;
                        const wave = Math.sin(Math.sqrt(distSq) * frequency);

                        this.heightmap[idx] += wave * strength * falloff;

                        // Clamp values to keep simulation stable
                        this.heightmap[idx] = Math.max(-1, Math.min(1, this.heightmap[idx]));
                    }
                }
            }
        }
    }

    /**
     * Smoothing / Relaxation
     * Simulates sand naturally settling over time.
     */
    update(viscosity) {
        const decay = 0.99 - (viscosity * 0.05);
        for (let i = 0; i < this.heightmap.length; i++) {
            this.heightmap[i] *= decay;
        }
    }

    addStone(x, y, radius) {
        this.stones.push({ x, y, radius });
    }

    applyWater(x, y, radius) {
        // Simple impact that Creates a circular groove
        const gx = Math.floor(x * this.width);
        const gy = Math.floor(y * this.height);
        const r = Math.floor(radius * this.width);

        for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
                const nx = gx + dx;
                const ny = gy + dy;
                if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                    const distSq = dx * dx + dy * dy;
                    if (distSq < r * r) {
                        const idx = ny * this.width + nx;
                        this.heightmap[idx] -= 0.2 * (1 - Math.sqrt(distSq) / r);
                    }
                }
            }
        }
    }

    clear() {
        this.heightmap.fill(0);
        this.stones = [];
    }
}
