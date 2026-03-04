import { EVENTS } from './constants.js';

class StateManager {
    constructor() {
        this.camera = {
            scale: 1.0,
            x: 0,
            y: 0
        };

        this.physics = {
            velocity: 0,
            targetVelocity: 0
        };

        this.world = {
            currentLevel: 0,
            totalLevelsCreated: 0
        };

        this.debug = {
            nodeCount: 0
        };

        this.subscribers = new Map();
    }

    subscribe(event, callback) {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, []);
        }
        this.subscribers.get(event).push(callback);
    }

    emit(event, data) {
        if (this.subscribers.has(event)) {
            this.subscribers.get(event).forEach(cb => cb(data));
        }
    }

    updateScale(delta) {
        this.camera.scale *= (1 + delta);
        this.emit(EVENTS.ZOOM_UPDATE, this.camera.scale);
    }

    setScale(newScale) {
        this.camera.scale = newScale;
        this.emit(EVENTS.ZOOM_UPDATE, this.camera.scale);
    }

    resetScale(factor) {
        // Used when shifting levels to prevent float overflow
        this.camera.scale /= factor;
        // We don't necessarily emit update here to avoid visual jumps if handled correctly
    }

    incrementLevel(direction) {
        this.world.currentLevel += direction;
        this.world.totalLevelsCreated++;
        this.emit(EVENTS.LEVEL_CHANGE, this.world.currentLevel);
    }
}

export const State = new StateManager();
