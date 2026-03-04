import { CONFIG, BLOCKS } from '../utils/constants.js';

export class Chunk {
    constructor(cx, cz) {
        this.cx = cx; // Chunk X (in chunk coords)
        this.cz = cz; // Chunk Z
        this.size = CONFIG.CHUNK_SIZE;
        this.height = CONFIG.CHUNK_HEIGHT;
        this.data = new Uint8Array(this.size * this.size * this.height);
        this.isDirty = true; // For re-rendering/meshing if we were using WebGL
    }

    _getIndex(x, y, z) {
        return (x + z * this.size + y * this.size * this.size);
    }

    getBlock(x, y, z) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.height || z < 0 || z >= this.size) {
            return BLOCKS.AIR;
        }
        return this.data[this._getIndex(x, y, z)];
    }

    setBlock(x, y, z, id) {
        if (x >= 0 && x < this.size && y >= 0 && y < this.height && z >= 0 && z < this.size) {
            this.data[this._getIndex(x, y, z)] = id;
            this.isDirty = true;
        }
    }
}
