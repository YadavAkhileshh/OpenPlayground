/**
 * SingularityRay JS - Render - Post Processing
 * Applies filmic tone mapping, gamma correction, and effects to the raw output.
 */

import { ColorUtils } from './color_utils.js';

export class PostProcessor {
    constructor() {
        this.exposure = 1.0;
        this.gamma = 2.2;
    }

    /**
     * Apply all post-processing stack to a given color vector
     * @param {import('../math/vec3.js').Vec3} color in/out color
     */
    process(color) {
        // Exposure scalar mapping
        color.multiplyScalar(this.exposure);

        // ACES Filmic Tone Mapping 
        // Handles very bright disk values back into display bounds nicely
        const mapped = ColorUtils.acesFilm(color);
        color.copy(mapped);

        // SRGB Gamma Correction
        const corrected = ColorUtils.gammaCorrect(color, this.gamma);
        color.copy(corrected);

        return color;
    }
}
