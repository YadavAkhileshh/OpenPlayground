export class Renderer {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        // Optional: Draw background grid or gradient if not handled by CSS
        // this.ctx.fillStyle = '#1a1a2e';
        // this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawInputTrail(points) {
        if (points.length < 2) return;

        this.ctx.beginPath();
        this.ctx.strokeStyle = '#ff9a9e';
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }

        this.ctx.stroke();
    }

    drawCircle(x, y, radius, color, filled = true) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        if (filled) {
            this.ctx.fillStyle = color;
            this.ctx.fill();
        } else {
            this.ctx.strokeStyle = color;
            this.ctx.stroke();
        }
    }

    drawRect(x, y, w, h, color, filled = true) {
        if (filled) {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x, y, w, h);
        } else {
            this.ctx.strokeStyle = color;
            this.ctx.strokeRect(x, y, w, h);
        }
    }

    // Helper to visualize gesture Debug
    drawDebugPoint(v, color = 'red') {
        this.drawCircle(v.x, v.y, 5, color);
    }
}
