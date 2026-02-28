// drawMesh.js
import { ShapeType } from '../physics/shape.js';

export class DrawMesh {
    static drawBody(ctx, body) {
        ctx.save();
        ctx.translate(body.transform.position.x, body.transform.position.y);
        ctx.rotate(body.transform.angle);

        ctx.fillStyle = body.color;

        if (body.shape.type === ShapeType.POLYGON) {
            ctx.beginPath();
            const vertices = body.shape.vertices;
            ctx.moveTo(vertices[0].x, vertices[0].y);
            for (let i = 1; i < vertices.length; i++) {
                ctx.lineTo(vertices[i].x, vertices[i].y);
            }
            ctx.closePath();
            ctx.fill();

            // Add slight stroke for edges
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.stroke();

            if (body.isBlade) {
                // Glow effect
                ctx.shadowColor = body.color;
                ctx.shadowBlur = 10;
                ctx.stroke();
            }

        } else if (body.shape.type === ShapeType.CIRCLE) {
            ctx.beginPath();
            ctx.arc(0, 0, body.shape.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    static drawConstraints(ctx, constraints) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';

        ctx.beginPath();
        for (const c of constraints) {
            // Only draw springs/distance links
            if (c.bodyA && c.bodyB && c.isTearable !== undefined) {
                // Compute stress color
                let stress = 0;
                if (c.isTearable) {
                    stress = Math.min(1.0, c.currentForce / 30000); // Max force scaling
                }
                const r = 255;
                const g = Math.floor(255 * (1 - stress));
                const b = Math.floor(255 * (1 - stress));
                const alpha = 0.2 + stress * 0.8;

                ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                ctx.beginPath();
                ctx.moveTo(c.bodyA.position.x, c.bodyA.position.y);
                ctx.lineTo(c.bodyB.position.x, c.bodyB.position.y);
                ctx.stroke();
            }
        }
    }
}
