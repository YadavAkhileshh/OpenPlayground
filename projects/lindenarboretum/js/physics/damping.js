/**
 * LindenArboretum - Damping Module
 * Ensures that the trunk (depth 0) barely moves, while the tiny outer
 * fractal branches (depth N) sway violently in the wind.
 */

import { MathUtils } from '../math/utils.js';

export const dampingManager = {
    /**
     * Calculates a damping factor [0, 1] based on fractal tree depth.
     * 0 = no movement (root), 1 = full movement (tips).
     * @param {number} currentDepth 
     * @param {number} maxDepth 
     */
    getDepthDamping(currentDepth, maxDepth) {
        if (maxDepth === 0) return 0;

        // Normalize depth
        const t = MathUtils.clamp(currentDepth / maxDepth, 0, 1);

        // Use a polynomial curve so the trunk is very stiff, 
        // and only the outer 30% of branches are loose.
        // e.g. x^3
        return Math.pow(t, 3);
    }
};
