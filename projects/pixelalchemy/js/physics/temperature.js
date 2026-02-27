/**
 * Temperature Physics
 * Handles heat propagation and state changes.
 */

import { Config } from '../core/config.js';

export function updateTemperature(grid, x, y, idx) {
    // 1. Diffusion / Conduction
    // Simplified: move heat to neighbors
    // grid.temp is Float32Array

    // We ideally need a copy or steady state to avoid directional bias, 
    // but we will just diffuse randomly to a neighbor.

    const temp = grid.temp[idx];
    const ambient = 20; // Room temp

    // Normalize towards ambient slowly
    if (temp > ambient) grid.temp[idx] -= 0.1;
    if (temp < ambient) grid.temp[idx] += 0.1;

    // Conduct to random neighbor
    const dirs = [-1, 1, -grid.width, grid.width];
    const nIdx = idx + dirs[Math.floor(Math.random() * 4)];

    if (nIdx >= 0 && nIdx < grid.size) {
        const nTemp = grid.temp[nIdx];
        const diff = temp - nTemp;
        if (Math.abs(diff) > 0.1) {
            const transfer = diff * 0.1; // 10% transfer
            grid.temp[idx] -= transfer;
            grid.temp[nIdx] += transfer;
        }
    }

    // 2. Sources
    const mat = grid.cells[idx];
    if (mat === Config.MATERIALS.FIRE) grid.temp[idx] = 400; // Fire is hot
    if (mat === Config.MATERIALS.LAVA) grid.temp[idx] = 1000;
    if (mat === Config.MATERIALS.ICE) grid.temp[idx] = -10; // Ice keeps itself cold until melted
    if (mat === Config.MATERIALS.SNOW) grid.temp[idx] = -5;

    // 3. State Changes
    checkStateChange(grid, idx, mat, grid.temp[idx]);
}

function checkStateChange(grid, idx, mat, temp) {
    if (mat === Config.MATERIALS.WATER && temp < 0) {
        // Freeze
        grid.cells[idx] = Config.MATERIALS.ICE;
    } else if (mat === Config.MATERIALS.ICE && temp > 0) {
        // Melt
        grid.cells[idx] = Config.MATERIALS.WATER;
    } else if (mat === Config.MATERIALS.WATER && temp > 100) {
        // Boil
        grid.cells[idx] = Config.MATERIALS.STEAM;
        grid.meta[idx] = 100;
    } else if (mat === Config.MATERIALS.LAVA && temp < 600) {
        // Cool to Stone
        grid.cells[idx] = Config.MATERIALS.STONE; // or obsidian
    } else if (mat === Config.MATERIALS.STEAM && temp < 50) {
        // Condense
        if (Math.random() < 0.1) grid.cells[idx] = Config.MATERIALS.WATER;
    }
}
