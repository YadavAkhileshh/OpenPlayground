// spark.js
import { Vec2 } from '../math/vec2.js';
import { randomRange } from '../math/mathUtils.js';

export class Spark {
    constructor(x, y) {
        this.position = new Vec2(x, y);
        this.velocity = new Vec2(randomRange(-200, 200), randomRange(-200, 200));
        this.life = 1.0;
        this.decay = randomRange(0.5, 2.0);
        this.color = '#f59e0b';
        this.size = randomRange(1, 3);
    }

    update(dt) {
        this.velocity.y -= 500 * dt; // gravity
        this.position.add(Vec2.mul(this.velocity, dt));
        this.life -= this.decay * dt;
    }

    render(ctx, camera) {
        const screenPos = camera.worldToScreen(this.position);

        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        // Since effects canvas is unscaled by camera
        ctx.arc(screenPos.x, screenPos.y, this.size * camera.zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}
