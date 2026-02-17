/**
 * SensorArray Class
 * Simulates LIDAR/Visual scanning of terrain for foot placement.
 */
class SensorArray {
    constructor(body) {
        this.body = body;
        this.scanLines = [];
        this.scanTimer = 0;
        this.maxScanDistance = 300;
    }

    update(terrain) {
        this.scanTimer++;
        if (this.scanTimer > 5) { // Scan every few frames
            this.scanTimer = 0;
            this.performScan(terrain);
        }

        // Fade out old scan lines
        for (let i = this.scanLines.length - 1; i >= 0; i--) {
            this.scanLines[i].alpha -= 0.05;
            if (this.scanLines[i].alpha <= 0) {
                this.scanLines.splice(i, 1);
            }
        }
    }

    performScan(terrain) {
        // Cast rays forward and downward
        // Random angle cone
        const angle = MathUtils.randomRange(-Math.PI / 2 - 0.5, -Math.PI / 2 + 0.5);
        const start = this.body.position.copy();

        // Raycast logic (simplified)
        // Just find ground intersection for a few points
        const checkX = start.x + Math.cos(angle) * MathUtils.randomRange(50, 200);
        const groundY = terrain.getHeight(checkX);

        // Add visual line
        this.scanLines.push({
            start: start,
            end: new Vector2(checkX, groundY),
            alpha: 1.0,
            color: '#00ffaa'
        });
    }

    draw(ctx) {
        ctx.save();
        ctx.lineWidth = 1;
        this.scanLines.forEach(line => {
            ctx.globalAlpha = line.alpha * 0.3;
            ctx.strokeStyle = line.color;
            ctx.beginPath();
            ctx.moveTo(line.start.x, line.start.y);
            ctx.lineTo(line.end.x, line.end.y);
            ctx.stroke();

            // Dot at impact
            ctx.globalAlpha = line.alpha;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(line.end.x, line.end.y, 2, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }
}
