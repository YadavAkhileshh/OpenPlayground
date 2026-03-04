/**
 * SlimeNet - Coloring Strategies
 * 
 * Maps intensity values [0, 1] (or unbounded) to RGB colors.
 * UPDATED: Multi-Channel Rendering.
 */

const ColorPalettes = {
    // Bio: Species 0 = Cyan, Species 1 = Magenta, Obstacles = White
    bio: (grid, idx, pixels, pIdx) => {
        const valA = grid.speciesMaps[0][idx];
        const valB = grid.speciesMaps[1][idx];
        const obs = grid.obstacles[idx];

        if (obs === 1) {
            pixels[pIdx] = 100;
            pixels[pIdx + 1] = 100;
            pixels[pIdx + 2] = 100;
            pixels[pIdx + 3] = 255;
            return;
        }

        // Normalize
        const vA = Math.min(valA / 20.0, 1.0);
        const vB = Math.min(valB / 20.0, 1.0);

        // Mix
        // Species A (Teal/Green)
        const rA = 0, gA = 255 * vA, bA = 170 * vA;
        // Species B (Purple/Pink)
        const rB = 255 * vB, gB = 0, bB = 200 * vB;

        // Additive mixing
        pixels[pIdx] = Math.min(rA + rB, 255);
        pixels[pIdx + 1] = Math.min(gA + gB, 255);
        pixels[pIdx + 2] = Math.min(bA + bB, 255);
        pixels[pIdx + 3] = 255; // Alpha
    },

    // Fire: Warning colors. A=Yellow, B=Red
    fire: (grid, idx, pixels, pIdx) => {
        const valA = grid.speciesMaps[0][idx];
        const valB = grid.speciesMaps[1][idx];
        const obs = grid.obstacles[idx];

        if (obs === 1) {
            pixels[pIdx] = 50; pixels[pIdx + 1] = 50; pixels[pIdx + 2] = 50; pixels[pIdx + 3] = 255;
            return;
        }

        const vA = Math.min(valA / 20.0, 1.0);
        const vB = Math.min(valB / 20.0, 1.0);

        pixels[pIdx] = Math.min((vA * 255) + (vB * 255), 255);
        pixels[pIdx + 1] = Math.min((vA * 200) + (vB * 50), 255);
        pixels[pIdx + 2] = Math.min((vA * 50), 255);
        pixels[pIdx + 3] = 255;
    },

    // Neon: A=Blue, B=Neon Green
    neon: (grid, idx, pixels, pIdx) => {
        const valA = grid.speciesMaps[0][idx];
        const valB = grid.speciesMaps[1][idx];
        const obs = grid.obstacles[idx];

        if (obs === 1) {
            pixels[pIdx] = 40; pixels[pIdx + 1] = 40; pixels[pIdx + 2] = 40; pixels[pIdx + 3] = 255;
            return;
        }

        const vA = Math.min(valA / 20.0, 1.0);
        const vB = Math.min(valB / 20.0, 1.0);

        pixels[pIdx] = Math.min(vB * 50, 255);
        pixels[pIdx + 1] = Math.min((vA * 100) + (vB * 255), 255);
        pixels[pIdx + 2] = Math.min((vA * 255) + (vB * 50), 255);
        pixels[pIdx + 3] = 255;
    }
};

window.ColorPalettes = ColorPalettes;
