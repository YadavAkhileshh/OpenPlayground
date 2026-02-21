/**
 * js/simulation/resourceManager.js
 * Manages resource sources and sinks.
 */

import { Resource } from './resource.js';
import { events } from '../core/events.js';

export class ResourceManager {
    constructor() {
        this.resources = [];
    }

    addResource(type, x, y, radius = 30) {
        // Prevent extreme overlap with other resources
        for (const res of this.resources) {
            const dx = res.x - x;
            const dy = res.y - y;
            if (dx * dx + dy * dy < radius * radius) {
                return null;
            }
        }

        const resource = new Resource(type, x, y, radius);
        this.resources.push(resource);
        events.emit('resource:added', resource);
        return resource;
    }

    removeAt(x, y, brushRadius) {
        let removed = false;

        for (let i = this.resources.length - 1; i >= 0; i--) {
            const res = this.resources[i];
            const dx = res.x - x;
            const dy = res.y - y;

            // Check intersection of circle and brush
            const combinedRadius = res.radius + brushRadius;

            if (dx * dx + dy * dy < combinedRadius * combinedRadius) {
                this.resources.splice(i, 1);
                removed = true;
            }
        }

        if (removed) {
            events.emit('resources:changed');
        }
        return removed;
    }

    clear() {
        this.resources = [];
        events.emit('resources:cleared');
    }

    // Auto-generate some initial resources
    generateDefaults(width, height) {
        this.clear();

        // Place one source and one sink
        this.addResource('source', width * 0.2, height * 0.5, 40);
        this.addResource('sink', width * 0.8, height * 0.5, 40);
    }
}
