// cloth.js
import { Fabric } from '../physics/constraints/fabric.js';

export class ClothFactory {
    static createBanner(world, x, y, width, height, resolution) {
        // Just wraps the Fabric constraint generator
        const segmentsX = Math.floor(width / resolution);
        const segmentsY = Math.floor(height / resolution);

        return Fabric.create(world, x - width / 2, y, width, height, segmentsX, segmentsY, 0.5);
    }
}
