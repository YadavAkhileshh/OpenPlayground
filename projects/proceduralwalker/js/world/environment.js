/**
 * Environment Class
 * Manages background layers and decorative elements.
 */
class Environment {
    constructor(terrain) {
        this.terrain = terrain;
        this.stars = [];
        this.distantMountains = [];

        this.generateStars();
        this.generateMountains();
    }

    generateStars() {
        for (let i = 0; i < 200; i++) {
            this.stars.push({
                x: Math.random() * 2000,
                y: Math.random() * 600,
                size: Math.random() * 2,
                opacity: Math.random()
            });
        }
    }

    generateMountains() {
        // Simple generated skyline
        let x = 0;
        let y = 300;
        for (let i = 0; i < 100; i++) {
            x += Math.random() * 100 + 50;
            y += Math.random() * 100 - 50;
            y = MathUtils.clamp(y, 100, 500);
            this.distantMountains.push({ x, y });
        }
    }

    drawBackground(ctx, camX, camY) {
        // Draw Stars (Parallax 0.1)
        ctx.save();
        ctx.translate(camX * 0.9, camY * 0.9); // Inverse movement for parallax

        ctx.fillStyle = '#fff';
        this.stars.forEach(s => {
            // Very simple tiling logic or just fixed background
            // Let's just draw them relative to camera modulo screen width for infinite stars
            let renderX = (s.x - camX * 0.1) % 2000;
            if (renderX < 0) renderX += 2000;

            ctx.globalAlpha = s.opacity;
            ctx.beginPath();
            ctx.arc(renderX, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();

        // Draw Distant Mountains (Parallax 0.3)
        // Similar logic needed
    }
}
