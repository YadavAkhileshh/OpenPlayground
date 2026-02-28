// trail.js
import { Vec2 } from '../math/vec2.js';

export class Trail {
    constructor(targetBody, localOffset, maxLength = 20) {
        this.targetBody = targetBody;
        this.localOffset = localOffset.clone();
        this.maxLength = maxLength;
        this.points = [];
        this.color = 'rgba(56, 189, 248, 0.5)';
        this.thickness = 2;
    }

    update() {
        const worldPos = this.targetBody.transform.mulVec2(this.localOffset);
        this.points.unshift(worldPos);

        if (this.points.length > this.maxLength) {
            this.points.pop();
        }
    }

    render(ctx, camera) {
        if (this.points.length < 2) return;

        ctx.strokeStyle = this.color;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();

        for (let i = 0; i < this.points.length; i++) {
            const screenPos = camera.worldToScreen(this.points[i]);

            if (i === 0) {
                ctx.moveTo(screenPos.x, screenPos.y);
            } else {
                ctx.lineTo(screenPos.x, screenPos.y);
            }
        }

        // Fade out thickness
        for (let i = 1; i < this.points.length; i++) {
            ctx.beginPath();
            const p1 = camera.worldToScreen(this.points[i - 1]);
            const p2 = camera.worldToScreen(this.points[i]);
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineWidth = this.thickness * camera.zoom * (1 - i / this.points.length);
            const alpha = Math.max(0, 1 - i / this.points.length);
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.stroke();
        }
    }
}
