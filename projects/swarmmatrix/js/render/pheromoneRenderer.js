/**
 * js/render/pheromoneRenderer.js
 * Optional direct point-cloud style rendering for pheromones.
 */

import { CONFIG } from '../core/config.js';
import { PheromoneTypes } from '../simulation/pheromoneTypes.js';

export class PheromoneRenderer {
    constructor() {
        this.colorHome = `rgba(${CONFIG.COLOR_PHERO_HOME[0]}, ${CONFIG.COLOR_PHERO_HOME[1]}, ${CONFIG.COLOR_PHERO_HOME[2]}, `;
        this.colorFood = `rgba(${CONFIG.COLOR_PHERO_FOOD[0]}, ${CONFIG.COLOR_PHERO_FOOD[1]}, ${CONFIG.COLOR_PHERO_FOOD[2]}, `;
    }

    render(ctx, grid) {
        const { cols, rows, resolution, density } = grid;

        // We draw home and food pheromones
        // Optimization: Global composite and large fillRect is too slow.
        // Direct ImageData buffer manipulation is faster, but done in Heatmap.
        // For discrete mode, we'll draw tiny squares.

        const size = resolution;

        // Home
        const homeData = density[PheromoneTypes.TO_HOME];
        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < cols; i++) {
                const val = homeData[i + j * cols];
                if (val > 5) { // Threshold
                    const alpha = Math.min(0.8, val / CONFIG.PH_MAX_VALUE);
                    ctx.fillStyle = this.colorHome + alpha + ')';
                    ctx.fillRect(i * size, j * size, size, size);
                }
            }
        }

        // Food
        const foodData = density[PheromoneTypes.TO_FOOD];
        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < cols; i++) {
                const val = foodData[i + j * cols];
                if (val > 5) {
                    const alpha = Math.min(0.8, val / CONFIG.PH_MAX_VALUE);
                    ctx.fillStyle = this.colorFood + alpha + ')';
                    ctx.fillRect(i * size, j * size, size, size);
                }
            }
        }
    }
}
