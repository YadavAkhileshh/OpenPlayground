import { CONFIG, BLOCKS } from '../utils/constants.js';

// Simple Perlin-like noise implementation for procedural terrain
function pseudorandom(x, z) {
    let n = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
    return n - Math.floor(n);
}

function noise(x, z) {
    const ix = Math.floor(x);
    const iz = Math.floor(z);
    const fx = x - ix;
    const fz = z - iz;

    const a = pseudorandom(ix, iz);
    const b = pseudorandom(ix + 1, iz);
    const c = pseudorandom(ix, iz + 1);
    const d = pseudorandom(ix + 1, iz + 1);

    const u = fx * fx * (3 - 2 * fx);
    const v = fz * fz * (3 - 2 * fz);

    return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}

export class Terrain {
    constructor(seed = 12345) {
        this.seed = seed;
    }

    generate(chunk) {
        const size = chunk.size;
        for (let x = 0; x < size; x++) {
            for (let z = 0; z < size; z++) {
                // Global coordinates
                const gx = chunk.cx * size + x;
                const gz = chunk.cz * size + z;

                // Simple heightmap
                // Scale factor controls "zoom" of noise
                const scale = 0.05;
                const n = noise(gx * scale, gz * scale);

                // Map noise 0..1 to height 1..CHUNK_HEIGHT/2
                // Ensure at least 1 layer of bedrock/stone
                const h = Math.floor(n * (CONFIG.CHUNK_HEIGHT / 2)) + 2;

                for (let y = 0; y < CONFIG.CHUNK_HEIGHT; y++) {
                    let block = BLOCKS.AIR;
                    if (y === h) {
                        block = BLOCKS.GRASS;
                    } else if (y < h && y > h - 4) {
                        block = BLOCKS.DIRT;
                    } else if (y <= h - 4) {
                        block = BLOCKS.STONE;
                    } else if (y === 0) {
                        block = BLOCKS.STONE; // Bedrock
                    }

                    chunk.setBlock(x, y, z, block);
                }
            }
        }
    }
}
