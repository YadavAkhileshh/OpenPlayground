// particleSystem.js
import { globalEvents } from '../core/eventBus.js';
import { Spark } from './spark.js';
import { Trail } from './trail.js';

export class ParticleSystem {
    constructor() {
        this.sparks = [];
        this.trails = [];

        globalEvents.on('spawn_sparks', (data) => {
            for (let i = 0; i < data.count; i++) {
                this.sparks.push(new Spark(data.x, data.y));
            }
        });

        globalEvents.on('collision_sparks', (data) => {
            // Intense sparks for collisions based on impulse
            const count = Math.min(20, Math.floor(data.impulse / 100));
            for (let i = 0; i < count; i++) {
                const s = new Spark(data.x, data.y);
                // Bias spark velocity along collision normal tangent roughly
                s.velocity.x += data.nx * -100;
                s.velocity.y += data.ny * -100;
                this.sparks.push(s);
            }
        });
    }

    addTrail(body, offset) {
        const trail = new Trail(body, offset);
        this.trails.push(trail);
        return trail;
    }

    update(dt) {
        // Update sparks
        for (let i = this.sparks.length - 1; i >= 0; i--) {
            const spark = this.sparks[i];
            spark.update(dt);
            if (spark.life <= 0) {
                this.sparks.splice(i, 1);
            }
        }

        // Update trails
        for (const trail of this.trails) {
            trail.update();
        }
    }

    render(ctx, camera) {
        // Render trails
        for (const trail of this.trails) {
            trail.render(ctx, camera);
        }

        // Render sparks
        for (const spark of this.sparks) {
            spark.render(ctx, camera);
        }
    }
}
