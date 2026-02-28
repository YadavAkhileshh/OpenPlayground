/**
 * js/simulation/obstacleManager.js
 * Manages collections of obstacles.
 */

import { Obstacle } from './obstacle.js';
import { events } from '../core/events.js';

export class ObstacleManager {
    constructor() {
        this.obstacles = [];
    }

    addObstacle(x, y, radius = 20) {
        // Prevent stacking obstacles too closely
        for (const obs of this.obstacles) {
            const dx = obs.x - x;
            const dy = obs.y - y;
            if (dx * dx + dy * dy < (radius * 0.5) * (radius * 0.5)) {
                return null;
            }
        }

        const obstacle = new Obstacle(x, y, radius);
        this.obstacles.push(obstacle);
        events.emit('obstacle:added', obstacle);
        return obstacle;
    }

    removeObstacle(id) {
        const index = this.obstacles.findIndex(o => o.id === id);
        if (index !== -1) {
            const obs = this.obstacles[index];
            this.obstacles.splice(index, 1);
            events.emit('obstacle:removed', obs);
            return true;
        }
        return false;
    }

    removeAt(x, y, brushRadius) {
        let removed = false;
        const rSq = brushRadius * brushRadius;

        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            const dx = obs.x - x;
            const dy = obs.y - y;

            // Check intersection of circle and brush
            const distSq = dx * dx + dy * dy;
            const combinedRadius = obs.radius + brushRadius;

            if (distSq < combinedRadius * combinedRadius) {
                this.obstacles.splice(i, 1);
                removed = true;
            }
        }

        if (removed) {
            events.emit('obstacles:changed');
        }
        return removed;
    }

    clear() {
        this.obstacles = [];
        events.emit('obstacles:cleared');
    }
}
