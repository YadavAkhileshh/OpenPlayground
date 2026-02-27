/**
 * EffectsSystem.js
 * Manages particles and visual effects.
 */

import { Particle } from '../entities/Particle.js';
import { eventManager } from '../core/EventManager.js';
import { Events } from '../core/Settings.js';

export class EffectsSystem {
    constructor() {
        this.particles = [];

        eventManager.on(Events.PLAYER_LAND, () => this.createSplash());
        eventManager.on(Events.PLAYER_JUMP, () => this.createSplash());
    }

    createSplash() {
        // We'd need player position here, but this is a decoupled listener...
        // Ideally we pass data in the event.
    }

    spawnParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    update(dt) {
        this.particles = this.particles.filter(p => p.isAlive);
        this.particles.forEach(p => p.update(dt));
    }
}
