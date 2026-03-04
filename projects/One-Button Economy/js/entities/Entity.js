/**
 * Entity.js
 * 
 * Base class for all game objects.
 * Uses a component-bag approach.
 */

import { Utils } from '../core/Utils.js';

export class Entity {
    constructor(x, y, size = 20, type = 'DEFAULT') {
        this.id = Utils.generateUUID();
        this.x = x;
        this.y = y;
        this.size = size;
        this.startSize = size; // For scaling effects
        this.type = type;
        this.rotation = 0;

        this.components = {};
        this.markedForDeletion = false;
    }

    addComponent(name, data) {
        this.components[name] = data;
        return this;
    }

    removeComponent(name) {
        delete this.components[name];
        return this;
    }

    getComponent(name) {
        return this.components[name];
    }

    destroy() {
        this.markedForDeletion = true;
    }
}
