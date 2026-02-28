/**
 * Sand Material Logic
 * Gravity + Sliding
 */

import { Config } from '../core/config.js';

export function updateSand(grid, x, y, idx) {
    if (y === grid.height - 1) return; // Bottom

    const downIdx = idx + grid.width;
    const cells = grid.cells;

    // 1. Try move down
    if (cells[downIdx] === Config.MATERIALS.EMPTY) {
        grid.move(idx, downIdx);
        return;
    }

    // 2. Try move down-water (sink)
    const downMat = cells[downIdx];
    if (downMat === Config.MATERIALS.WATER || downMat === Config.MATERIALS.ACID || downMat === Config.MATERIALS.OIL) {
        grid.swap(idx, downIdx);
        return;
    }

    // 3. Try move diagonals
    const dir = Math.random() < 0.5 ? 1 : -1;
    const dlIdx = idx + grid.width - dir;
    const drIdx = idx + grid.width + dir;

    // Check if diagonal is valid bounds
    const dlValid = (x - dir >= 0 && x - dir < grid.width);
    const drValid = (x + dir >= 0 && x + dir < grid.width);

    if (dlValid && cells[dlIdx] === Config.MATERIALS.EMPTY) {
        grid.move(idx, dlIdx);
    } else if (drValid && cells[drIdx] === Config.MATERIALS.EMPTY) {
        grid.move(idx, drIdx);
    } else if (dlValid && cells[dlIdx] === Config.MATERIALS.WATER) {
        grid.swap(idx, dlIdx);
    } else if (drValid && cells[drIdx] === Config.MATERIALS.WATER) {
        grid.swap(idx, drIdx);
    }
}
