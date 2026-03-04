/**
 * js/render/obstacleRenderer.js
 * Draws static obstacles as hatched/styled regions.
 */

import { CONFIG } from '../core/config.js';

export class ObstacleRenderer {
    constructor() {
        this.fillColor = getComputedStyle(document.body).getPropertyValue('--obstacle-color').trim() || '#1a1a24';
        this.strokeColor = getComputedStyle(document.body).getPropertyValue('--obstacle-border').trim() || '#3a3a50';
    }

    render(ctx, obstacleManager) {
        const obstacles = obstacleManager.obstacles;
        if (obstacles.length === 0) return;

        ctx.fillStyle = this.fillColor;
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = 2;

        ctx.beginPath();
        for (let i = 0; i < obstacles.length; i++) {
            const obs = obstacles[i];
            ctx.moveTo(obs.x + obs.radius, obs.y);
            ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.stroke();

        // Optional cool hatched pattern effect could be drawn here
        // but simple fill is better for performance for now.
    }
}
