/**
 * Vignette Effect
 * Draws a radial gradient overlay to darken edges.
 */
export class Vignette {
    constructor(renderer) {
        this.renderer = renderer;
        this.strength = 0.5;
        this.color = 'rgba(0,0,0,';
    }

    draw() {
        const ctx = this.renderer.ctx;
        const width = this.renderer.width;
        const height = this.renderer.height;
        const radius = Math.max(width, height) * 0.8;

        // Save context state if needed (usually safe to just draw over)

        const gradient = ctx.createRadialGradient(
            width / 2, height / 2, radius * 0.4,
            width / 2, height / 2, radius
        );

        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, `rgba(0,0,0,${this.strength})`);

        ctx.fillStyle = gradient;
        ctx.globalCompositeOperation = 'source-over'; // Default
        ctx.fillRect(0, 0, width, height);
    }
}
