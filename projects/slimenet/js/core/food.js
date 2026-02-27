/**
 * SlimeNet - Food System
 * 
 * Manages discrete food sources that:
 * 1. Emit pheromones continuously.
 * 2. Shrink over time (Consumption).
 */

class FoodSystem {
    constructor(grid) {
        this.grid = grid;
        this.sources = []; // {x, y, radius, intensity, speciesMask}
    }

    /**
     * Adds a new food source that will persist and decay.
     */
    add(x, y, radius, intensity, speciesMask = 0) {
        this.sources.push({
            x, y,
            radius,
            originalRadius: radius,
            intensity,
            speciesMask,
            life: 1.0 // 1.0 to 0.0
        });
    }

    update(dt) {
        const consumptionRate = Config.grid.foodConsumption * dt * 0.5; // Scale down

        for (let i = this.sources.length - 1; i >= 0; i--) {
            const f = this.sources[i];

            // 1. Emit Pheromone
            // We emit based on current radius
            this.grid.addFood(f.x, f.y, f.radius, f.intensity, f.speciesMask);

            // 2. Shrink / Consume
            // In a real simulation, we'd check for agents nearby.
            // For visual effect + performance, we just utilize a steady decay 
            // simulating "being eaten" if desired, or we just keep them static if rate is 0.

            // BUT user requested "Consumption".
            // Let's assume consumption happens if agents are nearby.
            // Getting proximity of 5000 agents to 20 food sources is expensive (O(N*M)).
            // Optimization: Grid already knows where pheromones are!
            // If the grid value at food location is HIGH, it means agents are there (depositing).
            // Wait, agents deposit? Yes. So high pheromone = high traffic = eating.

            // Check grid intensity at food center
            const densityA = this.grid.getValue(f.x | 0, f.y | 0, 0);
            const densityB = this.grid.getValue(f.x | 0, f.y | 0, 1);
            const totalDensity = densityA + densityB;

            // If agents are present (high density), shrink faster
            const eating = totalDensity > 10 ? 1 : 0;

            if (eating) {
                f.life -= consumptionRate * 5.0; // Eat fast
                f.radius = f.originalRadius * f.life;
            } else {
                // Slow rot
                f.life -= consumptionRate * 0.1;
            }

            if (f.life <= 0.05) {
                this.sources.splice(i, 1);
            }
        }
    }

    clear() {
        this.sources = [];
    }

    // Feature 9: Procedural Gen helper
    generateRandom(count, w, h) {
        this.clear();
        for (let i = 0; i < count; i++) {
            this.add(Math.random() * w, Math.random() * h, 10 + Math.random() * 20, Config.grid.foodStrength);
        }
    }
}

window.FoodSystem = FoodSystem;
