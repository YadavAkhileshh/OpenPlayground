/**
 * Starfield Class
 * Manage ambient background particles.
 */
import { Vector3 } from '../math/vector3.js';
import { randomRange } from '../math/utils.js';

export class Starfield {
    constructor(count = 200) {
        this.stars = [];
        this.count = count;
        this.init();
    }

    init() {
        for (let i = 0; i < this.count; i++) {
            this.stars.push({
                pos: new Vector3(
                    randomRange(-2000, 2000),
                    randomRange(-1500, 1500),
                    randomRange(-2000, 500)
                ),
                size: randomRange(0.5, 2),
                brightness: randomRange(0.2, 1)
            });
        }
    }

    draw(renderer, camera, viewProj) {
        const ctx = renderer.ctx;
        const width = renderer.width;
        const height = renderer.height;

        ctx.fillStyle = '#ffffff';

        for (const star of this.stars) {
            // Parallax is automatic if we use the camera matrix correctly
            // But starfields are often static or move slowly.
            // Let's just project them.

            const proj = camera.project(star.pos, viewProj, width, height);

            if (proj.visible) {
                // Fade based on depth
                const alpha = star.brightness * Math.min(1, proj.scale);
                ctx.globalAlpha = alpha;

                // Draw star
                ctx.beginPath();
                ctx.arc(proj.x, proj.y, star.size * proj.scale, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1.0;
    }
}
