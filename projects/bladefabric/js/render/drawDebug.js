// drawDebug.js
export class DrawDebug {
    static drawAABB(ctx, aabb) {
        if (!aabb || !aabb.isValid()) return;
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(aabb.min.x, aabb.min.y, aabb.max.x - aabb.min.x, aabb.max.y - aabb.min.y);
    }

    static drawContacts(ctx, contacts) {
        for (const c of contacts) {
            for (let i = 0; i < c.pointCount; i++) {
                const pt = c.points[i];

                // Draw normal vector
                ctx.beginPath();
                ctx.moveTo(pt.position.x, pt.position.y);
                ctx.lineTo(pt.position.x + c.normal.x * 20, pt.position.y + c.normal.y * 20);
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Draw point
                ctx.beginPath();
                ctx.arc(pt.position.x, pt.position.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = '#f59e0b';
                ctx.fill();
            }
        }
    }
}
