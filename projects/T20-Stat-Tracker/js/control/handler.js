/**
 * Explosives and Destructive Materials
 */
import { Config } from '../core/config.js';

export function updateC4(grid, x, y, idx) {
    // Stable until ignited
    // Ignition happens if touching FIRE or SPARK or LAVA
    const neighbors = [
        idx - 1, idx + 1, idx - grid.width, idx + grid.width
    ];

    let ignited = false;
    for (let n of neighbors) {
        if (n >= 0 && n < grid.size) {
            const t = grid.cells[n];
            if (t === Config.MATERIALS.FIRE || t === Config.MATERIALS.SPARK || t === Config.MATERIALS.LAVA || t === Config.MATERIALS.FUSE) {
                ignited = true;
                break;
            }
        }
    }

    if (ignited) {
        explode(grid, x, y, 20); // Boom
    }
}

export function explode(grid, cx, cy, radius) {
    const r2 = radius * radius;
    for (let y = -radius; y <= radius; y++) {
        for (let x = -radius; x <= radius; x++) {
            if (x * x + y * y <= r2) {
                const tx = cx + x;
                const ty = cy + y;
                const idx = grid.getIndex(tx, ty);

                if (idx !== -1) {
                    // Destroy everything except border
                    if (grid.cells[idx] !== Config.MATERIALS.VOID) {
                        grid.cells[idx] = Config.MATERIALS.FIRE;
                        grid.meta[idx] = 255; // High fire life

                        // Chance to fling particles?
                        // That requires velocity which we don't strictly have in this simple model, 
                        // but we can simulate shockwave by pushing
                    }
                }
            }
        }
    }
}