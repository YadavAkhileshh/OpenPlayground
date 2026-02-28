/**
 * KeystrokeFingerprint - Visualizer
 * Renders real-time typing dynamics on a canvas.
 */

export class Visualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.events = [];
        this.resize();

        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    resize() {
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.clientWidth;
        this.canvas.height = parent.clientHeight;
    }

    /**
     * Adds an event to be visualized.
     * @param {string} type 'down' or 'up'
     */
    addEvent(type) {
        this.events.push({
            type: type,
            time: performance.now(),
            x: this.canvas.width // Start at right edge
        });
    }

    clear() {
        this.events = [];
    }

    /**
     * Main animation loop.
     */
    animate() {
        requestAnimationFrame(() => this.animate());

        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const now = performance.now();
        const SPEED = 0.2; // Pixels per ms

        // Clear background
        ctx.fillStyle = '#0a0a14'; // Matches dark theme
        ctx.fillRect(0, 0, width, height);

        // Draw grid lines
        ctx.strokeStyle = '#1e1e2e';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let y = height / 2 - 50; y < height / 2 + 50; y += 25) {
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
        }
        ctx.stroke();

        // Update and draw events
        ctx.lineWidth = 2;

        // Remove old events
        this.events = this.events.filter(e => {
            const age = now - e.time;
            const x = width - (age * SPEED);
            return x > -10;
        });

        // We want to connect downs and ups to show "Key Held" blocks
        // This is a simple visualizer: discrete events as ticks
        this.events.forEach(e => {
            const age = now - e.time;
            const x = width - (age * SPEED);

            ctx.beginPath();
            if (e.type === 'down') {
                ctx.strokeStyle = '#00f2ff'; // Cyan for down
                ctx.moveTo(x, height / 2 - 20);
                ctx.lineTo(x, height / 2 + 20);
            } else {
                ctx.strokeStyle = '#ff0055'; // Pink for up
                ctx.moveTo(x, height / 2 - 10);
                ctx.lineTo(x, height / 2 + 10);
            }
            ctx.stroke();

            // Glow effect
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.shadowBlur = 0;
        });

        // Draw centerline
        ctx.strokeStyle = '#ffffff';
        ctx.globalAlpha = 0.1;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }
}
