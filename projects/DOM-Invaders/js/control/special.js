/**
 * Special Materials: Virus, Life, Void, Emitters
 */
import { Config } from '../core/config.js';

export function updateVirus(grid, x, y, idx) {
    // Infects organic material and Water
    const neighbors = [
        idx - 1, idx + 1, idx - grid.width, idx + grid.width
    ];

    // Move like liquid/powder? Or just stationary infection?
    // Let's make it move like a slow liquid
    if (Math.random() < 0.2) {
        // gravity
        const down = idx + grid.width;
        if (down < grid.size && grid.cells[down] === Config.MATERIALS.EMPTY) {
            grid.move(idx, down);
            return;
        }
    }

    for (let n of neighbors) {
        if (n >= 0 && n < grid.size) {
            const t = grid.cells[n];
            if (t === Config.MATERIALS.PLANT || t === Config.MATERIALS.WOOD || t === Config.MATERIALS.WATER || t === Config.MATERIALS.HUMAN) {
                // Infect
                if (Math.random() < 0.1) {
                    grid.cells[n] = Config.MATERIALS.VIRUS;
                    grid.meta[n] = 0;
                }
            }
        }
    }

    // Decay self
    if (Math.random() < 0.001) grid.cells[idx] = Config.MATERIALS.EMPTY;
}

export function updateVoid(grid, x, y, idx) {
    // Black hole - sucks everything in
    // Static position
    const radius = 3;
    for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
            if (dx === 0 && dy === 0) continue;
            const tx = x + dx;
            const ty = y + dy;
            const tIdx = grid.getIndex(tx, ty);

            if (tIdx !== -1 && grid.cells[tIdx] !== Config.MATERIALS.EMPTY && grid.cells[tIdx] !== Config.MATERIALS.VOID) {
                // Pull towards center
                // Actually just eat it if close
                if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
                    grid.cells[tIdx] = Config.MATERIALS.EMPTY;
                } else {
                    // Move neighbor towards center
                    // Implementation tricky without swapping iteratively. 
                    // Just Eating is safer for now.
                    if (Math.random() < 0.1) grid.cells[tIdx] = Config.MATERIALS.EMPTY;
                }
            }
        }
    }
}

export function updateSpout(grid, x, y, idx, type) {
    // Spawns material below
    const down = idx + grid.width;
    if (down < grid.size && grid.cells[down] === Config.MATERIALS.EMPTY) {
        if (type === Config.MATERIALS.SPOUT_WATER) grid.cells[down] = Config.MATERIALS.WATER;
        // else if (type === Config.MATERIALS.SPOUT_SAND) grid.cells[down] = Config.MATERIALS.SAND;
    }
}

export function updateDisco(grid, x, y, idx) {
    // Just visual? Or moves?
    // Moves like Sand
    // We update its meta for color cycling in renderer
    grid.meta[idx] += 5; // Cycle hue

    // Gravity
    const down = idx + grid.width;
    if (down < grid.size && grid.cells[down] === Config.MATERIALS.EMPTY) {
        grid.move(idx, down);
    }
}