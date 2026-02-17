import { CONFIG, BLOCKS } from '../utils/constants.js';
import { Vector3 } from '../utils/math.js';

export class Raycaster {
    constructor(chunkManager) {
        this.chunkManager = chunkManager;
        // Pre-allocate internal state
        this.mapPos = new Vector3();
        this.hitPos = new Vector3();
    }

    // resultObj must be provided to avoid validation/allocation
    cast(origin, direction, maxDist, resultObj) {
        let x = Math.floor(origin.x);
        let y = Math.floor(origin.y);
        let z = Math.floor(origin.z);

        const dx = direction.x;
        const dy = direction.y;
        const dz = direction.z;

        const stepX = (dx > 0) ? 1 : -1;
        const stepY = (dy > 0) ? 1 : -1;
        const stepZ = (dz > 0) ? 1 : -1;

        // Prevent division by zero and subsequent NaN in sideDist
        const deltaDistX = (dx === 0) ? Infinity : Math.abs(1 / dx);
        const deltaDistY = (dy === 0) ? Infinity : Math.abs(1 / dy);
        const deltaDistZ = (dz === 0) ? Infinity : Math.abs(1 / dz);

        let sideDistX, sideDistY, sideDistZ;

        // X Axis
        if (dx === 0) {
            sideDistX = Infinity;
        } else if (dx > 0) {
            sideDistX = (Math.floor(origin.x) + 1 - origin.x) * deltaDistX;
        } else {
            sideDistX = (origin.x - Math.floor(origin.x)) * deltaDistX;
        }

        // Y Axis
        if (dy === 0) {
            sideDistY = Infinity;
        } else if (dy > 0) {
            sideDistY = (Math.floor(origin.y) + 1 - origin.y) * deltaDistY;
        } else {
            sideDistY = (origin.y - Math.floor(origin.y)) * deltaDistY;
        }

        // Z Axis
        if (dz === 0) {
            sideDistZ = Infinity;
        } else if (dz > 0) {
            sideDistZ = (Math.floor(origin.z) + 1 - origin.z) * deltaDistZ;
        } else {
            sideDistZ = (origin.z - Math.floor(origin.z)) * deltaDistZ;
        }

        let hit = false;
        let side = 0; // 0=x, 1=y, 2=z
        let block = 0;
        let dist = 0;

        // Safety Break
        let steps = 0;
        const maxSteps = maxDist * 3; // Approx heuristic

        while (!hit && steps < maxSteps) {
            steps++;
            // DDA Walk
            if (sideDistX < sideDistY) {
                if (sideDistX < sideDistZ) {
                    sideDistX += deltaDistX;
                    x += stepX;
                    side = 0;
                } else {
                    sideDistZ += deltaDistZ;
                    z += stepZ;
                    side = 2;
                }
            } else {
                if (sideDistY < sideDistZ) {
                    sideDistY += deltaDistY;
                    y += stepY;
                    side = 1;
                } else {
                    sideDistZ += deltaDistZ;
                    z += stepZ;
                    side = 2;
                }
            }

            // Check bounds
            if (y < 0 || y >= CONFIG.CHUNK_HEIGHT) {
                block = 0;
            } else {
                block = this.chunkManager.getBlock(x, y, z);
            }

            if (block > 0) {
                hit = true;
            }
        }

        if (hit) {
            // Calculate distance
            // We use the sideDist that *caused* the hit, minus the delta we just added
            if (side === 0) dist = sideDistX - deltaDistX;
            else if (side === 1) dist = sideDistY - deltaDistY;
            else dist = sideDistZ - deltaDistZ;

            resultObj.hit = true;
            resultObj.block = block;
            resultObj.distance = dist;
            resultObj.side = side;

            resultObj.mapPos.x = x;
            resultObj.mapPos.y = y;
            resultObj.mapPos.z = z;

            resultObj.hitPos.x = origin.x + dx * dist;
            resultObj.hitPos.y = origin.y + dy * dist;
            resultObj.hitPos.z = origin.z + dz * dist;

            // Re-calc face for interaction
            if (side === 0) resultObj.face = (stepX > 0) ? 1 : 0;
            if (side === 1) resultObj.face = (stepY > 0) ? 3 : 2;
            if (side === 2) resultObj.face = (stepZ > 0) ? 5 : 4;

            return;
        }

        resultObj.hit = false;
        resultObj.distance = maxDist;
    }
}
