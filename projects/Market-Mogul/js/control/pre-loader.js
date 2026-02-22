/**
 * Gas Material Logic (Smoke, Steam)
 */

import { Config } from '../core/config.js';

export function updateSmoke(grid, x, y, idx) {
    const life = grid.meta[idx];
    if (life <= 0) {
        grid.cells[idx] = Config.MATERIALS.EMPTY;
        return;
    }
    grid.meta[idx]--;

    // Move up
    if (y > 0) {
        const dir = Math.floor(Math.random() * 3) - 1;
        const destX = x + dir;
        if (destX >= 0 && destX < grid.width) {
            const destIdx = (y - 1) * grid.width + destX;
            if (grid.cells[destIdx] === Config.MATERIALS.EMPTY) {
                grid.move(idx, destIdx);
            } else if (grid.cells[destIdx] === Config.MATERIALS.WATER) {
                // blocked by water generally
            }
        }
    }
}

export function updateSteam(grid, x, y, idx) {
    updateSmoke(grid, x, y, idx);

    // Condensation Logic
    if (grid.cells[idx] === Config.MATERIALS.STEAM && grid.meta[idx] < 20) {
        if (Math.random() < 0.005) {
            grid.cells[idx] = Config.MATERIALS.WATER; // Condense
        }
    }
}