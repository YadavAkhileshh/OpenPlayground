/**
 * ScoreManager.js
 * Tracks score based on distance run.
 */

import { eventManager } from '../core/EventManager.js';
import { Events } from '../core/Settings.js';

export class ScoreManager {
    constructor() {
        this.score = 0;
        this.highScore = 0;
        this.scoreMultiplier = 1;
    }

    update(dt, playerSpeed) {
        // Score based on distance/speed
        // Assuming player runs at X pixels/sec
        this.score += (playerSpeed * dt * 0.1) * this.scoreMultiplier;

        eventManager.emit(Events.SCORE_UPDATE, this.score);
    }

    reset() {
        this.score = 0;
        this.scoreMultiplier = 1;
    }
}
