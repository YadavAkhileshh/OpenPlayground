/**
 * WorldGenerator.js
 * Generates ink strokes ahead of the player.
 */

import { InkStroke } from '../entities/InkStroke.js';
import { Settings, Events } from '../core/Settings.js';
import { eventManager } from '../core/EventManager.js';

export class WorldGenerator {
    constructor() {
        this.strokes = [];
        this.lastStrokeX = 0;
        this.lastStrokeY = Settings.CANVAS_HEIGHT / 2 + 100;

        // Initial ground
        this.addStroke(0, this.lastStrokeY, Settings.CANVAS_WIDTH);
    }

    addStroke(x, y, width) {
        const stroke = new InkStroke(x, y, width);
        this.strokes.push(stroke);
        eventManager.emit(Events.STROKE_CREATED, stroke);

        this.lastStrokeX = x + width;
        this.lastStrokeY = y;
    }

    update(dt, playerX) {
        // Generate ahead
        while (this.lastStrokeX < playerX + Settings.BUFFER_ZONE) {
            this.generateNextSegment();
        }

        // Cleanup behind
        this.strokes = this.strokes.filter(stroke => {
            return stroke.x + stroke.width > playerX - Settings.CLEANUP_ZONE;
        });
    }

    generateNextSegment() {
        const gap = Settings.GAP_MIN_WIDTH + Math.random() * (Settings.GAP_MAX_WIDTH - Settings.GAP_MIN_WIDTH);
        const width = Settings.STROKE_MIN_WIDTH + Math.random() * (Settings.STROKE_MAX_WIDTH - Settings.STROKE_MIN_WIDTH);

        // Height variation
        let heightChange = (Math.random() - 0.5) * Settings.PLATFORM_HEIGHT_VARIATION * 2;
        let nextY = this.lastStrokeY + heightChange;

        // Clamp Y to keep it playable
        // If it goes too high (small Y) or too low (large Y)
        const minY = 200;
        const maxY = Settings.CANVAS_HEIGHT - 200;

        if (nextY < minY) nextY = minY + 50;
        if (nextY > maxY) nextY = maxY - 50;

        this.addStroke(this.lastStrokeX + gap, nextY, width);
    }
}
