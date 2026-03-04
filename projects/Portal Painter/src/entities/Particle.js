import { Entity } from './Entity.js';
import { Vector2 } from '../physics/Vector2.js';
import { MathUtils } from '../utils/MathUtils.js';

export class Particle extends Entity {
    constructor(x, y, color) {
        super(x, y, 'particle');
        this.body.mass = 0.1;
        this.body.velocity = new Vector2(
            MathUtils.randRange(-50, 50),
            MathUtils.randRange(-50, 50)
        );
        this.life = 1.0; // Seconds
        this.color = color;
        this.size = MathUtils.randRange(2, 5);
    }

    update(dt) {
        this.life -= dt;
        if (this.life <= 0) {
            this.toBeRemoved = true;
        }

        this.body.update(dt);
        this.size *= 0.95; // Shrink
    }

    render(renderer) {
        renderer.drawCircle(this.body.position.x, this.body.position.y, this.size, this.color, true);
    }
}
