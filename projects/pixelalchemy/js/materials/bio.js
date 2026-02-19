/**
 * Biological Material Logic (Plant, Seed)
 */

import { Config } from '../core/config.js';

export function updatePlant(grid, x, y, idx) {
    // Plants are static but drink water
    if (Math.random() > Config.PLANT_GROWTH_RATE) return;

    // Check neighbors for water
    const neighbors = [
        idx - 1, idx + 1, idx - grid.width, idx + grid.width
    ];

    let hasWater = false;
    for (let n of neighbors) {
        if (grid.cells[n] === Config.MATERIALS.WATER) {
            hasWater = true;
            grid.cells[n] = Config.MATERIALS.EMPTY; // Drink
            break;
        }
    }

    if (hasWater) {
        // Grow Upwards or Sideways slightly
        const dirs = [
            idx - grid.width, // up
            idx - grid.width - 1,
            idx - grid.width + 1
        ];

        const growTarget = dirs[Math.floor(Math.random() * dirs.length)];

        if (growTarget > 0 && grid.cells[growTarget] === Config.MATERIALS.EMPTY) {
            grid.cells[growTarget] = Config.MATERIALS.PLANT;
        }
    }
}

export function updateSeed(grid, x, y, idx) {
    // 1. Move like Sand (Gravity)
    if (y < grid.height - 1) {
        const downIdx = idx + grid.width;
        if (grid.cells[downIdx] === Config.MATERIALS.EMPTY) {
            grid.move(idx, downIdx);
            return; // Moved, done for this frame
        } else if (grid.cells[downIdx] === Config.MATERIALS.WATER) {
            // Sink in water
            grid.swap(idx, downIdx);
            return;
        }
    }

    // 2. Growth Check
    // If we are stationary (didn't return above), check neighbors for water or wet soil
    const neighbors = [
        idx - 1, idx + 1, idx - grid.width, idx + grid.width,
        idx - grid.width - 1, idx - grid.width + 1,
        idx + grid.width - 1, idx + grid.width + 1
    ];

    let touchingWater = false;
    for (let n of neighbors) {
        if (n >= 0 && n < grid.size) {
            if (grid.cells[n] === Config.MATERIALS.WATER || grid.cells[n] === Config.MATERIALS.PLANT) {
                touchingWater = true;
                break;
            }
        }
    }

    if (touchingWater && Math.random() < 0.1) {
        // Germinate
        grid.cells[idx] = Config.MATERIALS.PLANT;
    }
}
