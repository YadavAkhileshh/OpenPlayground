/**
 * noise.js
 * Generates static grain and scratch effects on a canvas overlay.
 */

export class NoiseRenderer {
    constructor() {
        this.container = document.getElementById('noise-overlay');
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.resize();
        window.addEventListener('resize', this.resize.bind(this));
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    /**
     * Renders a frame of noise.
     * @param {number} intensity - 0.0 to 1.0
     */
    render(intensity) {
        if (intensity <= 0.01) {
            this.ctx.clearRect(0, 0, this.width, this.height);
            return;
        }

        const opacity = Math.min(intensity * 0.3, 0.4); // Max 40% opacity
        this.container.style.opacity = opacity;

        // Optimization: Don't redraw every single frame if low intensity?
        // Actually, noise needs to be alive. We'll draw every frame.

        this.ctx.clearRect(0, 0, this.width, this.height);

        // 1. Static Grain
        // We'll generate random pixels.
        // For performance, we can create a pattern or just fillRects randomly.
        // ImageData manipulation is fastest for fullscreen noise.

        const density = Math.floor(intensity * 5000); // Number of dots
        this.ctx.fillStyle = `rgba(0,0,0, ${0.1 + intensity * 0.2})`;

        for (let i = 0; i < density; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const s = Math.random() * 2;
            this.ctx.fillRect(x, y, s, s);
        }

        // 2. Scratches (Vertical lines) - Only at higher intensity
        if (intensity > 0.3) {
            const scratches = Math.floor(intensity * 5);
            this.ctx.strokeStyle = `rgba(255,255,255, ${0.1 + intensity * 0.3})`;
            this.ctx.lineWidth = 1;

            for (let i = 0; i < scratches; i++) {
                if (Math.random() > 0.9) { // Flicker effect
                    const x = Math.random() * this.width;
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, 0);
                    this.ctx.lineTo(x, this.height);
                    this.ctx.stroke();
                }
            }
        }
    }
}
