/**
 * js/simulation/agent.js
 * Basic autonomous agent entity.
 */

import { Vec2 } from '../core/vector.js';
import { CONFIG } from '../core/config.js';

export class Agent {
    constructor(id, x, y) {
        this.id = id;
        this.pos = new Vec2(x, y);
        this.vel = new Vec2(Math.random() * 2 - 1, Math.random() * 2 - 1).normalize().mult(CONFIG.AGENT_MAX_SPEED);
        this.acc = new Vec2();

        this.maxSpeed = CONFIG.AGENT_MAX_SPEED;
        this.maxForce = CONFIG.AGENT_MAX_FORCE;

        this.isActive = false; // Used for pooling
        this.hasResource = false;

        // Memory for debug rendering
        this.steeringVectors = {
            alignment: new Vec2(),
            cohesion: new Vec2(),
            separation: new Vec2(),
            gradient: new Vec2(),
            avoidance: new Vec2()
        };

        this.hashIndex = -1; // Spatial hash reference
    }

    applyForce(force) {
        this.acc.add(force);
    }

    // Updates physics matching bounds
    update(dt, width, height) {
        // Integrate physics
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);

        // Reset acceleration
        this.acc.set(0, 0);

        // Toroidal screen wrapping
        if (this.pos.x < 0) this.pos.x = width;
        else if (this.pos.x >= width) this.pos.x = 0;

        if (this.pos.y < 0) this.pos.y = height;
        else if (this.pos.y >= height) this.pos.y = 0;
    }

    reset(x, y) {
        this.pos.set(x, y);
        this.vel.set(Math.random() * 2 - 1, Math.random() * 2 - 1).normalize().mult(this.maxSpeed);
        this.acc.set(0, 0);
        this.isActive = true;
        this.hasResource = false;
    }
}
