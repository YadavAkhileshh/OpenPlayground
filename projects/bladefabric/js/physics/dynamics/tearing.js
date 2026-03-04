// tearing.js
import { globalEvents } from '../../core/eventBus.js';

export class TearingLogic {
    constructor() {
        this.tearForceThreshold = 30000; // Force threshold to tear cloth
    }

    update(constraints, world) {
        let torn = false;

        // Traverse backwards so removals don't skip indices
        for (let i = constraints.length - 1; i >= 0; i--) {
            const constraint = constraints[i];

            // If the constraint tracks its own tension/force
            if (constraint.isTearable && constraint.currentForce > this.tearForceThreshold) {
                world.removeConstraint(constraint);
                torn = true;

                // Spawn particle/spark effect at break point
                const midX = (constraint.bodyA.position.x + constraint.bodyB.position.x) * 0.5;
                const midY = (constraint.bodyA.position.y + constraint.bodyB.position.y) * 0.5;
                globalEvents.emit('spawn_sparks', { x: midX, y: midY, count: 5 });
            }
        }

        return torn;
    }
}
