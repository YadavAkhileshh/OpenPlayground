import { Body } from '../physics/Body.js';

export class Entity {
    constructor(x, y, type = 'entity') {
        this.body = new Body(x, y);
        this.body.entity = this; // Back-reference
        this.type = type;
        this.toBeRemoved = false;
        this.components = [];
    }

    update(dt) {
        // Body is updated by PhysicsEngine
        // Update components if any
    }

    render(renderer) {
        // Override
    }

    onCollision(other, normal) {
        // Override
    }
}
