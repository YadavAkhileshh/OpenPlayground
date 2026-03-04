import { Entity } from './Entity.js';
import { CircleCollider } from '../physics/Collider.js';

export class Goal extends Entity {
    constructor(x, y) {
        super(x, y, 'goal');
        this.radius = 25;
        this.body.mass = 0;
        this.body.isStatic = true;
        this.body.collider = new CircleCollider(this.body, this.radius);
        this.body.collider.isTrigger = true;

        this.color = '#00b894';
        this.pulse = 0;
    }

    update(dt) {
        this.pulse += dt * 3;
    }

    render(renderer) {
        const pulseScale = 1 + Math.sin(this.pulse) * 0.1;
        renderer.drawCircle(this.body.position.x, this.body.position.y, this.radius * pulseScale, this.color, true);
        renderer.drawCircle(this.body.position.x, this.body.position.y, this.radius * 1.5, this.color + '44', true);
    }

    onCollision(other) {
        if (other.type === 'player') {
            // Level Manager handles this via event or checking state
            other.hasReachedGoal = true;
        }
    }
}
