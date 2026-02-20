/**
 * Thermodynamics and Electricity
 */
import { Config } from '../core/config.js';

export function updateTemperature(grid, x, y, idx) {
    // 1. Conduction
    // Simplified: Average with neighbors
    // We need a temp array in grid! assuming grid.temp exists (Float32Array)

    // For now, let's check if we handle state changes based on fixed probabilities or if we really add a temp array.
    // The plan said "Add temperature array".

    // Placeholder if array doesn't exist yet, but we will add it to Grid class.
}

export function updateElectricity(grid, x, y, idx) {
    // SPARK material
    // Moves randomly to conductors (MITHRIL, WATER, WIRE)
    // Dies quickly

    if (grid.cells[idx] === Config.MATERIALS.SPARK) {
        let life = grid.meta[idx];
        if (life <= 0) {
            grid.cells[idx] = Config.MATERIALS.EMPTY;
            return;
        }
        grid.meta[idx] -= 20; // Fast decay

        // Jump to neighbor conductor
        const neighbors = [
            idx - 1, idx + 1, idx - grid.width, idx + grid.width,
            idx - grid.width - 1, idx - grid.width + 1,
            idx + grid.width - 1, idx + grid.width + 1
        ];

        // Shuffle neighbors
        for (let i = neighbors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [neighbors[i], neighbors[j]] = [neighbors[j], neighbors[i]];
        }

        for (let n of neighbors) {
            if (n >= 0 && n < grid.size) {
                const t = grid.cells[n];
                if (t === Config.MATERIALS.MITHRIL || t === Config.MATERIALS.WATER || t === Config.MATERIALS.C4) {
                    // Spark it
                    // If C4, explode handled by C4 update checking for spark
                    // If Water, maybe electrocute (turn to spark?)
                    if (t === Config.MATERIALS.WATER) {
                        grid.cells[n] = Config.MATERIALS.SPARK;
                        grid.meta[n] = 255;
                    } else if (t === Config.MATERIALS.MITHRIL) {
                        // Metal passes it on
                        // Only if metal isn't already sparking (meta check?)
                        // Simplified: Turn metal into spark temporarily? No, metal should stay metal.
                        // Turn Empty neighbor of Metal into Spark? 
                        // Or just move the spark token?

                        // Let's Move the spark to the metal position, but swap?
                        // Actually, "Spark" is the electron.
                        grid.cells[n] = Config.MATERIALS.SPARK;
                        grid.meta[n] = 255;
                        grid.cells[idx] = Config.MATERIALS.EMPTY; // Old spark dies
                        return;
                    }
                }
                if (t === Config.MATERIALS.EMPTY) {
                    // Jump through air? No.
                }
            }
        }
    }
}