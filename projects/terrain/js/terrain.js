/**
 * Terrain.js - Terrain Generation and Erosion Simulation
 * Implements heightmap generation and hydraulic erosion algorithms
 */

class TerrainGenerator {
    constructor(size = 128) {
        this.size = size;
        this.heightmap = [];
        this.originalHeightmap = [];
        this.waterMap = [];
        this.sedimentMap = [];
        this.noise = new NoiseGenerator(Date.now());
        this.initialize();
    }

    /**
     * Initialize all maps
     */
    initialize() {
        for (let y = 0; y < this.size; y++) {
            this.heightmap[y] = new Array(this.size).fill(0);
            this.originalHeightmap[y] = new Array(this.size).fill(0);
            this.waterMap[y] = new Array(this.size).fill(0);
            this.sedimentMap[y] = new Array(this.size).fill(0);
        }
    }

    /**
     * Generate procedural terrain using noise
     */
    generate(scale = 50, octaves = 4, roughness = 0.5) {
        this.noise.reseed(Date.now());
        
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const nx = x / scale;
                const ny = y / scale;

                // Combine different noise types for interesting terrain
                let height = this.noise.fbm(nx, ny, octaves, roughness);
                
                // Add some ridge features for mountains
                const ridges = this.noise.ridgedNoise(nx * 0.5, ny * 0.5, 3);
                height = height * 0.7 + ridges * 0.3;

                // Apply domain warping for more natural look
                const warp = this.noise.warpedNoise(nx * 2, ny * 2, 2, 0.3);
                height = height * 0.8 + warp * 0.2;

                // Normalize to 0-1 range
                height = (height + 1) / 2;

                // Apply edge falloff for island effect
                const distX = Math.abs(x - this.size / 2) / (this.size / 2);
                const distY = Math.abs(y - this.size / 2) / (this.size / 2);
                const edgeDist = Math.max(distX, distY);
                const falloff = Math.pow(1 - edgeDist, 2);
                
                height *= falloff * 0.7 + 0.3; // Partial falloff

                // Ensure minimum height
                height = Math.max(0.1, Math.min(1, height));

                this.heightmap[y][x] = height;
                this.originalHeightmap[y][x] = height;
            }
        }

        // Clear water and sediment
        this.clearWaterAndSediment();
    }

    /**
     * Clear water and sediment maps
     */
    clearWaterAndSediment() {
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                this.waterMap[y][x] = 0;
                this.sedimentMap[y][x] = 0;
            }
        }
    }

    /**
     * Get height at position (with bounds checking)
     */
    getHeight(x, y) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.size) {
            return 1; // High boundary
        }
        return this.heightmap[y][x];
    }

    /**
     * Set height at position
     */
    setHeight(x, y, value) {
        if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
            this.heightmap[y][x] = Math.max(0, Math.min(1, value));
        }
    }

    /**
     * Get water amount at position
     */
    getWater(x, y) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.size) {
            return 0;
        }
        return this.waterMap[y][x];
    }

    /**
     * Add water at position
     */
    addWater(x, y, amount) {
        if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
            this.waterMap[y][x] += amount;
        }
    }

    /**
     * Reset terrain to original state
     */
    reset() {
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                this.heightmap[y][x] = this.originalHeightmap[y][x];
            }
        }
        this.clearWaterAndSediment();
    }

    /**
     * Resize terrain (generates new)
     */
    resize(newSize, scale, octaves, roughness) {
        this.size = newSize;
        this.heightmap = [];
        this.originalHeightmap = [];
        this.waterMap = [];
        this.sedimentMap = [];
        this.initialize();
        this.generate(scale, octaves, roughness);
    }
}

/**
 * Hydraulic Erosion Simulator
 * Simulates water droplets eroding terrain over time
 */
class HydraulicErosion {
    constructor(terrain) {
        this.terrain = terrain;
        
        // Erosion parameters
        this.inertia = 0.05;           // How quickly direction changes (0-1)
        this.sedimentCapacityFactor = 4; // Multiplier for sediment capacity
        this.minSedimentCapacity = 0.01;  // Minimum sediment capacity
        this.erodeSpeed = 0.3;            // How quickly to erode
        this.depositSpeed = 0.3;          // How quickly to deposit
        this.evaporateSpeed = 0.01;       // How quickly water evaporates
        this.gravity = 4;                 // Gravity strength
        this.maxDropletLifetime = 30;     // Max iterations per droplet
        this.initialWaterVolume = 1;      // Starting water amount
        this.initialSpeed = 1;            // Starting speed
    }

    /**
     * Calculate gradient at position using bilinear interpolation
     */
    calculateGradient(x, y) {
        const size = this.terrain.size;
        
        // Get integer and fractional parts
        const x0 = Math.floor(x);
        const y0 = Math.floor(y);
        const fx = x - x0;
        const fy = y - y0;
        
        // Get heights of surrounding cells
        const h00 = this.terrain.getHeight(x0, y0);
        const h10 = this.terrain.getHeight(x0 + 1, y0);
        const h01 = this.terrain.getHeight(x0, y0 + 1);
        const h11 = this.terrain.getHeight(x0 + 1, y0 + 1);
        
        // Calculate gradient
        const gradX = (h10 - h00) * (1 - fy) + (h11 - h01) * fy;
        const gradY = (h01 - h00) * (1 - fx) + (h11 - h10) * fx;
        
        return { x: gradX, y: gradY };
    }

    /**
     * Simulate a single water droplet
     */
    simulateDroplet(startX, startY, erosionStrength = 1.0) {
        let x = startX;
        let y = startY;
        let dirX = 0;
        let dirY = 0;
        let speed = this.initialSpeed;
        let water = this.initialWaterVolume;
        let sediment = 0;

        for (let lifetime = 0; lifetime < this.maxDropletLifetime; lifetime++) {
            const oldX = x;
            const oldY = y;

            // Calculate gradient
            const gradient = this.calculateGradient(x, y);
            
            // Update direction with inertia
            dirX = dirX * this.inertia - gradient.x * (1 - this.inertia);
            dirY = dirY * this.inertia - gradient.y * (1 - this.inertia);

            // Normalize direction
            const len = Math.sqrt(dirX * dirX + dirY * dirY);
            if (len !== 0) {
                dirX /= len;
                dirY /= len;
            }

            // Update position
            x += dirX;
            y += dirY;

            // Check if out of bounds or stuck
            if (x < 0 || x >= this.terrain.size - 1 || 
                y < 0 || y >= this.terrain.size - 1 || 
                (dirX === 0 && dirY === 0)) {
                break;
            }

            // Get height difference
            const oldHeight = this.terrain.getHeight(Math.floor(oldX), Math.floor(oldY));
            const newHeight = this.terrain.getHeight(Math.floor(x), Math.floor(y));
            const heightDiff = newHeight - oldHeight;

            // Calculate sediment capacity
            const sedimentCapacity = Math.max(
                -heightDiff * speed * water * this.sedimentCapacityFactor * erosionStrength,
                this.minSedimentCapacity
            );

            // Deposit or erode
            if (sediment > sedimentCapacity || heightDiff > 0) {
                // Deposit sediment
                const amountToDeposit = (heightDiff > 0) 
                    ? Math.min(heightDiff, sediment)
                    : (sediment - sedimentCapacity) * this.depositSpeed;
                
                sediment -= amountToDeposit;
                
                const ix = Math.floor(x);
                const iy = Math.floor(y);
                const currentHeight = this.terrain.getHeight(ix, iy);
                this.terrain.setHeight(ix, iy, currentHeight + amountToDeposit);
            } else {
                // Erode terrain
                const amountToErode = Math.min(
                    (sedimentCapacity - sediment) * this.erodeSpeed * erosionStrength,
                    -heightDiff
                );
                
                const ix = Math.floor(x);
                const iy = Math.floor(y);
                
                // Erode from current cell
                const currentHeight = this.terrain.getHeight(ix, iy);
                this.terrain.setHeight(ix, iy, currentHeight - amountToErode);
                sediment += amountToErode;
            }

            // Update speed and water
            speed = Math.sqrt(Math.max(0, speed * speed + heightDiff * this.gravity));
            water *= (1 - this.evaporateSpeed);

            // Add to water map for visualization
            this.terrain.addWater(Math.floor(x), Math.floor(y), water * 0.1);
        }
    }

    /**
     * Run erosion simulation with multiple iterations
     */
    erode(iterations = 1000, erosionStrength = 1.0) {
        const size = this.terrain.size;
        
        // Clear previous water map
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                this.terrain.waterMap[y][x] *= 0.9; // Decay existing water
            }
        }

        // Simulate droplets
        for (let i = 0; i < iterations; i++) {
            // Random starting position
            const x = Math.random() * (size - 2) + 1;
            const y = Math.random() * (size - 2) + 1;
            
            this.simulateDroplet(x, y, erosionStrength);
        }
    }

    /**
     * Update erosion parameters
     */
    setParameters(params) {
        if (params.erosionStrength !== undefined) {
            this.erodeSpeed = params.erosionStrength * 0.3;
            this.depositSpeed = params.erosionStrength * 0.3;
        }
        if (params.evaporationRate !== undefined) {
            this.evaporateSpeed = params.evaporationRate;
        }
    }
}

/**
 * Thermal Erosion (bonus feature for realistic weathering)
 */
class ThermalErosion {
    constructor(terrain) {
        this.terrain = terrain;
        this.talusAngle = 0.5; // Maximum stable slope
    }

    /**
     * Apply thermal erosion (talus angle smoothing)
     */
    erode(iterations = 1) {
        const size = this.terrain.size;
        const tempMap = [];

        // Initialize temp map
        for (let y = 0; y < size; y++) {
            tempMap[y] = [];
            for (let x = 0; x < size; x++) {
                tempMap[y][x] = this.terrain.heightmap[y][x];
            }
        }

        for (let iter = 0; iter < iterations; iter++) {
            for (let y = 1; y < size - 1; y++) {
                for (let x = 1; x < size - 1; x++) {
                    const h = this.terrain.heightmap[y][x];
                    let totalDiff = 0;
                    let count = 0;

                    // Check all 8 neighbors
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            if (dx === 0 && dy === 0) continue;
                            
                            const nx = x + dx;
                            const ny = y + dy;
                            const nh = this.terrain.heightmap[ny][nx];
                            const diff = h - nh;

                            if (diff > this.talusAngle) {
                                totalDiff += diff - this.talusAngle;
                                count++;
                            }
                        }
                    }

                    if (count > 0) {
                        const transfer = totalDiff / count * 0.5;
                        tempMap[y][x] -= transfer;
                        
                        // Distribute to neighbors
                        for (let dy = -1; dy <= 1; dy++) {
                            for (let dx = -1; dx <= 1; dx++) {
                                if (dx === 0 && dy === 0) continue;
                                const nx = x + dx;
                                const ny = y + dy;
                                tempMap[ny][nx] += transfer / 8;
                            }
                        }
                    }
                }
            }

            // Copy back
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    this.terrain.heightmap[y][x] = tempMap[y][x];
                }
            }
        }
    }
}
