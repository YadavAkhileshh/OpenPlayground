/**
 * Background.js
 * Handles parallax background layers.
 */

import { Settings } from '../core/Settings.js';

export class Background {
    constructor() {
        this.layers = [
            { speed: 0.1, elements: [] }, // Far background (ink drops)
            { speed: 0.2, elements: [] }, // Mid background (faint strokes)
        ];

        // Populate initial elements
        for (let i = 0; i < 20; i++) {
            this.layers[0].elements.push(this.createRandomElement(Settings.CANVAS_WIDTH * 2));
            this.layers[1].elements.push(this.createRandomElement(Settings.CANVAS_WIDTH * 2));
        }
    }

    createRandomElement(maxX) {
        return {
            x: Math.random() * maxX,
            y: Math.random() * Settings.CANVAS_HEIGHT,
            size: Math.random() * 20 + 5,
            type: Math.random() > 0.5 ? 'circle' : 'line'
        };
    }

    update(dt, cameraX) {
        // Parallax math:
        // Render offset = (cameraX * speed) % WrapWidth
    }

    draw(ctx, cameraX) {
        ctx.save();

        this.layers.forEach(layer => {
            const parallaxX = cameraX * layer.speed;

            // Draw elements wrapped
            layer.elements.forEach(el => {
                let drawX = el.x - parallaxX;
                // Wrap logic for infinite scrolling
                // Simple version: just draw static noise that moves slightly?
                // Or easier: Just draw a grid or paper texture that is fixed but shifts phase

                // Let's rely on the CSS texture for the base, and just add some floating ink particles here

                // Modulo to keep them in view?
                const wrapWidth = Settings.CANVAS_WIDTH;
                drawX = ((drawX % wrapWidth) + wrapWidth) % wrapWidth;

                ctx.fillStyle = 'rgba(44, 62, 80, 0.05)';
                ctx.beginPath();
                ctx.arc(drawX, el.y, el.size, 0, Math.PI * 2);
                ctx.fill();
            });
        });

        ctx.restore();
    }
}
