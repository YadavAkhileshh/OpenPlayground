/**
 * Water Material Logic
 * Gravity + Spreading
 */

import { Config } from '../core/config.js';

export function updateWater(grid, x, y, idx) {
    if (y === grid.height - 1) return;

    const downIdx = idx + grid.width;
    const cells = grid.cells;

    // 1. Down
    if (cells[downIdx] === Config.MATERIALS.EMPTY) {
        grid.move(idx, downIdx);
        return;
    }

    // 2. Spread Sideways
    const dir = Math.random() < 0.5 ? 1 : -1;
    const leftIdx = idx - 1;
    const rightIdx = idx + 1;

    const lValid = x > 0;
    const rValid = x < grid.width - 1;

    // Favor the random direction first
    if (dir === -1) {
        if (lValid && cells[leftIdx] === Config.MATERIALS.EMPTY) {
            grid.move(idx, leftIdx);
            return;
        }
        if (rValid && cells[rightIdx] === Config.MATERIALS.EMPTY) {
            grid.move(idx, rightIdx);
            return;
        }
    } else {
        if (rValid && cells[rightIdx] === Config.MATERIALS.EMPTY) {
            grid.move(idx, rightIdx);
            return;
        }
        if (lValid && cells[leftIdx] === Config.MATERIALS.EMPTY) {
            grid.move(idx, leftIdx);
            return;
        }
    }
}