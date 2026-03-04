/**
 * SlimeNet - Real-time Graph
 * 
 * Visualizes stats like FPS or Agent Count over time.
 */

class StatsGraph {
    constructor(containerId, width = 280, height = 50) {
        this.container = document.getElementById(containerId);

        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = '100%';
        this.canvas.style.marginTop = '10px';
        this.canvas.style.background = 'rgba(0,0,0,0.3)';
        this.canvas.style.border = '1px solid rgba(255,255,255,0.1)';

        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        this.data = new Array(width).fill(0);
        this.maxVal = 60;
    }

    update(value) {
        this.data.shift();
        this.data.push(value);

        // Auto-scale max (slowly)
        if (value > this.maxVal) this.maxVal = value;
        // Decay max
        if (Math.random() < 0.01) this.maxVal *= 0.99;

        this.draw();
    }

    draw() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const ctx = this.ctx;

        ctx.clearRect(0, 0, w, h);

        ctx.beginPath();
        ctx.strokeStyle = '#00ffaa';
        ctx.lineWidth = 1;

        for (let i = 0; i < w; i++) {
            const val = this.data[i];
            const y = h - (val / this.maxVal) * h;
            if (i === 0) ctx.moveTo(i, y);
            else ctx.lineTo(i, y);
        }
        ctx.stroke();
    }
}

window.StatsGraph = StatsGraph;
