export class Level {
    constructor(game) {
        this.game = game;
        this.entities = [];
        this.portals = [];
    }

    load() {
        this.createLevel();

        // Register bodies with physics engine
        this.entities.forEach(entity => {
            if (entity.body) {
                this.game.physics.addBody(entity.body);
            }
        });
    }

    unload() {
        // Remove bodies from physics engine
        this.entities.forEach(entity => {
            if (entity.body) {
                this.game.physics.removeBody(entity.body);
            }
        });
        this.entities = [];
        this.portals = [];
    }

    update(dt) {
        // Update all entities
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const entity = this.entities[i];
            entity.update(dt, this.game.input); // Pass input to all, though only Player uses it mostly

            if (entity.toBeRemoved) {
                if (entity.body) this.game.physics.removeBody(entity.body);
                this.entities.splice(i, 1);
            }
        }
    }

    render(renderer) {
        this.entities.forEach(entity => entity.render(renderer));
    }

    addEntity(entity) {
        this.entities.push(entity);
    }

    onCircleGesture(gesture) {
        // Default implementation: spawn portal
        // Override in specific levels if needed or disable portals
        if (this.canCreatePortals) {
            this.spawnPortal(gesture.center, gesture.radius);
        }
    }

    spawnPortal(center, radius) {
        // Limit to 2 portals
        // If 2 exist, remove the oldest one? Or replace logic?
        // Let's go with: replace the one that is NOT the last one created, or simple queue.

        const newPortal = new Portal(center.x, center.y, 30); // Fixed size for gameplay consistency? Or use gesture radius?
        // Let's use fixed size for gameplay stability, gesture radius just triggers it.

        // Add to game
        this.addEntity(newPortal);
        this.game.physics.addBody(newPortal.body);

        this.portals.push(newPortal);

        if (this.portals.length > 2) {
            const oldPortal = this.portals.shift();
            // Remove old portal
            oldPortal.toBeRemoved = true;
            if (oldPortal.linkedPortal) {
                oldPortal.linkedPortal.linkedPortal = null; // Unlink
            }
        }

        // Link if we have 2
        if (this.portals.length === 2) {
            this.portals[0].link(this.portals[1]);
        }

        // Spawn particles
        // for (let i = 0; i < 10; i++) ...
    }

    createLevel() {
        // Override
    }
}

import { Portal } from '../entities/Portal.js';
