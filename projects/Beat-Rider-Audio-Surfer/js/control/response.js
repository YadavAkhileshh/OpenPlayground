/**
 * Liquid Materials Logic
 * Handles behaviors for Acid, Oil, and other non-water liquids.
 */

import { Config } from '../core/config.js';

export function updateAcid(grid, x, y, idx) {
    if (y === grid.height - 1) return;

    const downIdx = idx + grid.width;
    const downMat = grid.cells[downIdx];

    // Dissolve neighbors
    // Check all neighbors for dissolution
    const directions = [-1, 1, -grid.width, grid.width];
    for (let dir of directions) {
        const nIdx = idx + dir;
        if (nIdx >= 0 && nIdx < grid.size) {
            const nMat = grid.cells[nIdx];
            if (nMat !== Config.MATERIALS.EMPTY &&
                nMat !== Config.MATERIALS.ACID &&
                nMat !== Config.MATERIALS.STONE &&
                nMat !== Config.MATERIALS.GLASS) { // Glass is acid-proof (if we had it)

                if (Math.random() < 0.05) {
                    grid.cells[nIdx] = Config.MATERIALS.EMPTY; // Dissolve it
                    if (Math.random() < 0.2) grid.cells[idx] = Config.MATERIALS.EMPTY; // Acid used up
                    return;
                }
            }
        }
    }

    // Movement (Like water)
    const down = idx + grid.width;
    if (down < grid.size) {
        if (grid.cells[down] === Config.MATERIALS.EMPTY) {
            grid.move(idx, down);
            return;
        } else if (grid.cells[down] === Config.MATERIALS.WATER) {
            // Sink in water? Or mix? Acid is usually heavier?
            // Let's say it sinks.
            if (Math.random() < 0.5) grid.swap(idx, down);
            return;
        }
    }

    // Spread horizontally
    const dir = Math.random() < 0.5 ? 1 : -1;
    const side = idx + dir;
    if (side >= 0 && side < grid.size && grid.cells[side] === Config.MATERIALS.EMPTY) {
        grid.move(idx, side);
    }
}

export function updateOil(grid, x, y, idx) {
    // Oil floats on water
    // Flammable

    const down = idx + grid.width;
    if (down < grid.size) {
        if (grid.cells[down] === Config.MATERIALS.EMPTY) {
            grid.move(idx, down);
            return;
        } else if (grid.cells[down] === Config.MATERIALS.WATER) {
            // Float!
            // If water is below, stay here? Or move up if surrounded?
            // Actually, if we are IN water, we move up.
            // But we are checking pixel below.
            // It means we assume Oil stays on top.

            // If we are touching water, we might want to slide sideways on top of it.
        }
    }

    // Spread
    const dir = Math.random() < 0.5 ? 1 : -1;
    const side = idx + dir;
    if (side >= 0 && side < grid.size) {
        if (grid.cells[side] === Config.MATERIALS.EMPTY) {
            grid.move(idx, side);
        } else if (grid.cells[side] === Config.MATERIALS.WATER) {
            // Swap if we are "heavier" contextually? No, oil is lighter.
            // If we are below water, swap up.
            // Check UP
            const up = idx - grid.width;
            if (up >= 0 && grid.cells[up] === Config.MATERIALS.WATER) {
                grid.swap(idx, up);
            }
        }
    }

    // Flammability check handled in Fire logic (Fire burns Oil)
    // But we can check if touching fire here too? No, Fire searches for fuel.
}