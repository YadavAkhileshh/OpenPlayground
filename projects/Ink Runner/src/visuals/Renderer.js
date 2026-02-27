/**
 * Renderer.js
 * Handles all drawing to the canvas.
 */

import { Settings } from '../core/Settings.js';

export class Renderer {
    constructor(ctx, camera) {
        this.ctx = ctx;
        this.camera = camera;
    }

    render(world, player, particles) {
        this.ctx.save();

        // Apply Camera Transform
        this.ctx.translate(-this.camera.x, -this.camera.y);

        // Draw World (Ink Strokes)
        this.ctx.fillStyle = Settings.INK_COLOR;
        this.ctx.strokeStyle = Settings.INK_COLOR;
        this.ctx.lineWidth = Settings.INK_THICKNESS;
        this.ctx.lineCap = 'round';

        world.strokes.forEach(stroke => {
            this.ctx.globalAlpha = stroke.opacity;
            this.ctx.beginPath();
            this.ctx.moveTo(stroke.x, stroke.y);
            this.ctx.lineTo(stroke.x + stroke.width, stroke.y);
            this.ctx.stroke();

            // Draw "drips" or texture?
            // Simple logic for now
        });
        this.ctx.globalAlpha = 1.0;

        // Draw Player
        this.ctx.fillStyle = '#e74c3c'; // Red player for contrast
        this.ctx.fillRect(player.x, player.y, player.width, player.height);

        // Draw Particles
        if (particles) {
            particles.forEach(p => {
                this.ctx.fillStyle = p.color;
                this.ctx.fillRect(p.x, p.y, p.width, p.height);
            });
        }

        this.ctx.restore();
    }
}
