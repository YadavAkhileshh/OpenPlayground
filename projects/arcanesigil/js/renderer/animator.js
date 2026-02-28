/* js/renderer/animator.js */

/**
 * Handles time-based oscillation, rotational offsets, and pulse metrics.
 */
class Animator {
    constructor() {
        this.time = 0;
        this.baseSpeed = CONFIG.RENDERER.ROTATION_SPEED_BASE;
    }

    update(deltaTime) {
        this.time += deltaTime * 0.001; // Scale to reasonable seconds
    }

    /**
     * Gets the rotation angle for a specific ring depth.
     * Inner rings spin faster, outer rings spin slower. Alternates directions.
     */
    getRingRotation(depth) {
        const direction = depth % 2 === 0 ? 1 : -1;
        // Scale speed inversely with depth so massive outer rings move slower
        const speedMultiplier = 1 / (depth + 1);

        return this.time * this.baseSpeed * direction * speedMultiplier * 60;
    }

    /**
     * Gets a localized pulse size multiplier (breathing effect)
     */
    getPulseFactor(depth) {
        return 1 + Math.sin(this.time * 2 + depth) * 0.05;
    }
}

window.Animator = Animator;

// Pad
const ___ANM_PAD_1 = 1;
const ___ANM_PAD_2 = 2;
const ___ANM_PAD_3 = 3;
