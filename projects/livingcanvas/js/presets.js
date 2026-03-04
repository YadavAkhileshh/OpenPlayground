/**
 * presets.js
 * Pre-defined grid configurations to showcase interesting behaviors.
 */

const Presets = {
    empty: {
        name: "Empty Void",
        data: [] // Empty
    },
    // We can't easily store full 100x100 grids here without massive file size.
    // Instead, we store list of live cells or "calls" to pattern stampers.
    // Let's implement a system to "Load" a preset by clearing and then applying patterns.

    gosperGunCenter: {
        name: "Gosper Glider Gun",
        description: "The first known infinite growth pattern.",
        action: (grid) => {
            grid.clear();
            // Stamp gun in middle-ish
            const startR = 20;
            const startC = 20;
            const gun = Patterns.gosperGun;

            for (let r = 0; r < gun.length; r++) {
                for (let c = 0; c < gun[r].length; c++) {
                    if (gun[r][c]) grid.setCell(startR + r, startC + c, 1);
                }
            }
        }
    },

    galaxySwarm: {
        name: "Galactic Swarm",
        description: "Multiple galaxies spinning in void.",
        action: (grid) => {
            grid.clear();
            const galaxy = Patterns.galaxy;
            // 4 galaxies
            const locations = [[20, 20], [20, 70], [70, 20], [70, 70]];

            locations.forEach(([row, col]) => {
                for (let r = 0; r < galaxy.length; r++) {
                    for (let c = 0; c < galaxy[r].length; c++) {
                        if (galaxy[r][c]) grid.setCell(row + r, col + c, 1);
                    }
                }
            });
        }
    },

    randomDense: {
        name: "Primordial Soup",
        description: "High density random chaos.",
        action: (grid) => {
            for (let r = 0; r < grid.rows; r++) {
                for (let c = 0; c < grid.cols; c++) {
                    grid.cells[r][c] = Math.random() > 0.5 ? 1 : 0;
                }
            }
        }
    }
};
