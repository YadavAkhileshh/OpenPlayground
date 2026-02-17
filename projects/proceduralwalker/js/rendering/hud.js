/**
 * HUD Class
 * Draws vector-style UI elements directly on the canvas.
 */
class HUD {
    constructor() {
        this.fpsHistory = new Array(60).fill(60);
    }

    update(fps) {
        this.fpsHistory.shift();
        this.fpsHistory.push(fps);
    }

    draw(ctx, width, height, robot) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform to screen space

        this.drawFPSGraph(ctx, width, height);
        this.drawCrosshairs(ctx, width, height);
        this.drawRobotStats(ctx, robot);

        ctx.restore();
    }

    drawFPSGraph(ctx, width, height) {
        const x = width - 120;
        const y = 20;
        const w = 100;
        const h = 40;

        ctx.fillStyle = 'rgba(0, 20, 10, 0.8)';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#00ffaa';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);

        ctx.beginPath();
        for (let i = 0; i < this.fpsHistory.length; i++) {
            const val = this.fpsHistory[i];
            const px = x + (i / 60) * w;
            const py = y + h - (val / 120) * h;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        ctx.font = '10px monospace';
        ctx.fillStyle = '#00ffaa';
        ctx.fillText('FPS_HIST', x, y - 5);
    }

    drawCrosshairs(ctx, width, height) {
        const cx = width / 2;
        const cy = height / 2;
        const s = 20;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(cx - s, cy);
        ctx.lineTo(cx + s, cy);
        ctx.moveTo(cx, cy - s);
        ctx.lineTo(cx, cy + s);
        ctx.stroke();

        // Corner brackets
        const m = 40;
        ctx.beginPath();
        // TL
        ctx.moveTo(m, m + 20); ctx.lineTo(m, m); ctx.lineTo(m + 20, m);
        // TR
        ctx.moveTo(width - m, m + 20); ctx.lineTo(width - m, m); ctx.lineTo(width - m - 20, m);
        // BL
        ctx.moveTo(m, height - m - 20); ctx.lineTo(m, height - m); ctx.lineTo(m + 20, height - m);
        // BR
        ctx.moveTo(width - m, height - m - 20); ctx.lineTo(width - m, height - m); ctx.lineTo(width - m - 20, height - m);
        ctx.stroke();
    }

    drawRobotStats(ctx, robot) {
        if (!robot) return;

        const x = 20;
        const y = window.innerHeight - 150;

        ctx.font = '12px monospace';
        ctx.fillStyle = '#00ffaa';

        ctx.fillText(`POS_X: ${robot.position.x.toFixed(2)}`, x, y);
        ctx.fillText(`POS_Y: ${robot.position.y.toFixed(2)}`, x, y + 15);
        ctx.fillText(`VEL_X: ${robot.velocity.x.toFixed(2)}`, x, y + 30);

        // Leg data
        let ly = y + 50;
        robot.legs.forEach((leg, i) => {
            const status = leg.isMoving ? 'MOV' : 'STB';
            ctx.fillStyle = leg.isMoving ? '#fff' : '#888';
            ctx.fillText(`L${i}: ${status}`, x, ly);
            ly += 12;
        });
    }
}
