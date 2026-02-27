/**
 * Camera.js
 * Tracks the player to keep them visible.
 */

import { Settings } from '../core/Settings.js';

export class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.zoom = 1;
    }

    follow(target) {
        // We want to keep the target (player) at roughly 200px from the left
        const targetX = target.x - Settings.PLAYER_START_X;

        // Smooth follow (lerp)
        // For an endless runner, we often just lock X, but lerp Y
        this.x = targetX;

        // For vertical, we want to follow but with some lag so jumps don't jitter the camera
        // Keep player vertically centered-ish
        const targetY = target.y - (Settings.CANVAS_HEIGHT / 2) + (target.height / 2);

        // Limit camera Y to not go too far (if we had a floor, but here it's endless void)
        // Just lerp it
        // this.y += (targetY - this.y) * 0.1;
        // Actually, for a runner, maybe fixed Y is better unless we change elevation drastically?
        // Let's implement partial vertical follow

        const verticalTrigger = Settings.CANVAS_HEIGHT * 0.3;
        const screenY = target.y - this.y;

        if (screenY > Settings.CANVAS_HEIGHT - verticalTrigger) {
            this.y += (screenY - (Settings.CANVAS_HEIGHT - verticalTrigger)) * 0.1;
        } else if (screenY < verticalTrigger) {
            this.y += (screenY - verticalTrigger) * 0.1;
        }
    }
}
