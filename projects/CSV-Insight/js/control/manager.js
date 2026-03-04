/**
 * Fire Material Logic
 * Rising + Ignition + Decay
 */

import { Config } from '../core/config.js';

export function updateFire(grid, x, y, idx) {
    // Fire decreases life
    let life = grid.meta[idx];

    // If life is low, die
    if (life < 10) {
        if (Math.random() < 0.5) {
            grid.cells[idx] = Config.MATERIALS.SMOKE;
            grid.meta[idx] = 150 + Math.random() * 50; // Smoke life
        } else {
            grid.cells[idx] = Config.MATERIALS.EMPTY;
        }
        return;
    }

    grid.meta[idx] -= (2 + Math.random() * 3); // Decay

    // Move Up or Wiggle
    const destY = y - 1;
    if (destY < 0) {
        grid.cells[idx] = Config.MATERIALS.EMPTY;
        return;
    }

    const r = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
    const destX = x + r;

    if (destX >= 0 && destX < grid.width) {
        const destIdx = destY * grid.width + destX;
        const target = grid.cells[destIdx];

        if (target === Config.MATERIALS.EMPTY) {
            grid.move(idx, destIdx);
        } else if (target === Config.MATERIALS.WOOD || target === Config.MATERIALS.PLANT || target === Config.MATERIALS.OIL) {
            // Ignite
            grid.cells[destIdx] = Config.MATERIALS.FIRE;
            grid.meta[destIdx] = 255; // Reset life for new fire
        } else if (target === Config.MATERIALS.WATER) {
            // Steam
            grid.cells[idx] = Config.MATERIALS.EMPTY;
            grid.cells[destIdx] = Config.MATERIALS.STEAM;
            grid.meta[destIdx] = 100;
        } else if (target === Config.MATERIALS.ICE) {
            // Melt
            grid.cells[destIdx] = Config.MATERIALS.WATER;
            grid.cells[idx] = Config.MATERIALS.SMOKE; // Fire goes out
            grid.meta[idx] = 100;
        }
    }
}