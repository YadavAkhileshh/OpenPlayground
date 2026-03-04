import { Chunk } from './chunk.js';
import { Terrain } from './terrain.js';
import { CONFIG, BLOCKS } from '../utils/constants.js';

export class ChunkManager {
    constructor() {
        this.chunks = new Map();
        this.terrain = new Terrain();
    }

    _getKey(cx, cz) {
        return `${cx},${cz}`;
    }

    getChunk(cx, cz) {
        return this.chunks.get(this._getKey(cx, cz));
    }

    // Helper to get a block from global coordinates
    getBlock(x, y, z) {
        // Safe bounds for Y
        if (y < 0 || y >= CONFIG.CHUNK_HEIGHT) return BLOCKS.AIR;

        const cx = Math.floor(x / CONFIG.CHUNK_SIZE);
        const cz = Math.floor(z / CONFIG.CHUNK_SIZE);

        const chunk = this.getChunk(cx, cz);
        if (!chunk) return BLOCKS.AIR; // Or treat as empty

        // Local coordinates within chunk
        let lx = x % CONFIG.CHUNK_SIZE;
        let lz = z % CONFIG.CHUNK_SIZE;
        if (lx < 0) lx += CONFIG.CHUNK_SIZE;
        if (lz < 0) lz += CONFIG.CHUNK_SIZE;

        return chunk.getBlock(lx, Math.floor(y), lz);
    }

    setBlock(x, y, z, id) {
        if (y < 0 || y >= CONFIG.CHUNK_HEIGHT) return;

        const cx = Math.floor(x / CONFIG.CHUNK_SIZE);
        const cz = Math.floor(z / CONFIG.CHUNK_SIZE);

        let chunk = this.getChunk(cx, cz);
        if (!chunk) {
            // Create chunk if we try to modify one that doesn't exist?
            // Typically we only modify loaded chunks.
            return;
        }

        let lx = x % CONFIG.CHUNK_SIZE;
        let lz = z % CONFIG.CHUNK_SIZE;
        if (lx < 0) lx += CONFIG.CHUNK_SIZE;
        if (lz < 0) lz += CONFIG.CHUNK_SIZE;

        chunk.setBlock(lx, Math.floor(y), lz, id);
    }

    update(playerX, playerZ) {
        const pCx = Math.floor(playerX / CONFIG.CHUNK_SIZE);
        const pCz = Math.floor(playerZ / CONFIG.CHUNK_SIZE);
        const radius = CONFIG.RENDER_DISTANCE;

        // Load new chunks
        for (let x = -radius; x <= radius; x++) {
            for (let z = -radius; z <= radius; z++) {
                const cx = pCx + x;
                const cz = pCz + z;
                const key = this._getKey(cx, cz);

                if (!this.chunks.has(key)) {
                    const chunk = new Chunk(cx, cz);
                    this.terrain.generate(chunk);
                    this.chunks.set(key, chunk);
                }
            }
        }

        // Unload old chunks
        for (const [key, chunk] of this.chunks) {
            const dist = Math.sqrt((chunk.cx - pCx) ** 2 + (chunk.cz - pCz) ** 2);
            if (dist > radius + 2) { // Determine unload distance + buffer
                this.chunks.delete(key);
            }
        }
    }
}
