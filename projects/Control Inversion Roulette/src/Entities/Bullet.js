import { Entity } from './Entity.js';
import { CONFIG } from '../Config/Constants.js';

export class Bullet extends Entity {
    constructor(x, y, angle) {
        super(x, y, CONFIG.BULLET.SIZE, CONFIG.BULLET.COLOR);

        this.speed = CONFIG.BULLET.SPEED;
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;

        this.damage = CONFIG.BULLET.DAMAGE;
        this.lifeTime = CONFIG.BULLET.LIFETIME / 1000; // convert to seconds

        this.addTag('projectile');
    }

    update(dt) {
        super.update(dt);

        this.lifeTime -= dt;
        if (this.lifeTime <= 0) {
            this.destroy();
        }

        // Bounds check - destroy if off screen
        if (this.x < 0 || this.x > CONFIG.CANVAS_WIDTH ||
            this.y < 0 || this.y > CONFIG.CANVAS_HEIGHT) {
            this.destroy();
        }
    }
}
