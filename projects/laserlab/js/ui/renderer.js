/**
 * Renderer Class
 * Handles Canvas 2D rendering.
 */
import { Vector } from '../math/vector.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw grid
        this.ctx.strokeStyle = '#223';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        for (let x = 0; x < this.width; x += 50) {
            this.ctx.moveTo(x, 0); this.ctx.lineTo(x, this.height);
        }
        for (let y = 0; y < this.height; y += 50) {
            this.ctx.moveTo(0, y); this.ctx.lineTo(this.width, y);
        }
        this.ctx.stroke();
    }

    render(scene, rays) {
        this.clear();

        // Draw entities
        for (const entity of scene.entities) {
            this.drawEntity(entity);
        }

        // Draw rays
        this.ctx.globalCompositeOperation = 'screen';
        // Use 'screen' or 'lighter' for glow
        for (const ray of rays) {
            this.drawRay(ray);
        }
        this.ctx.globalCompositeOperation = 'source-over';
    }

    drawEntity(entity) {
        this.ctx.save();
        this.ctx.translate(entity.position.x, entity.position.y);
        this.ctx.rotate(entity.angle);

        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.fillStyle = entity.color || '#444';

        if (entity.type === 'target') {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, entity.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = entity.isHit ? '#4f4' : '#222';
            this.ctx.strokeStyle = entity.isHit ? '#afa' : '#444';
            this.ctx.fill();
            this.ctx.stroke();

            // Glow if hit
            if (entity.isHit) {
                this.ctx.shadowBlur = 20;
                this.ctx.shadowColor = '#0f0';
                this.ctx.stroke();
                this.ctx.shadowBlur = 0;
            }
        }
        else if (entity.type === 'prism') {
            // Triangle (equilateral)
            const size = entity.size;
            const h = size * Math.sqrt(3) / 2;
            this.ctx.beginPath();
            this.ctx.moveTo(0, -h * 2 / 3);
            this.ctx.lineTo(-size / 2, h / 3);
            this.ctx.lineTo(size / 2, h / 3);
            this.ctx.closePath();
            this.ctx.fillStyle = 'rgba(200, 200, 255, 0.1)';
            this.ctx.strokeStyle = '#fff';
            this.ctx.fill();
            this.ctx.stroke();
        }
        else {
            // General Box (Wall, Mirror, Laser, Lens)
            this.ctx.beginPath();
            const w = entity.width;
            const h = entity.height;
            this.ctx.rect(-w / 2, -h / 2, w, h);
            this.ctx.fill();
            this.ctx.stroke();

            // Decorate Laser
            if (entity.type === 'laser') {
                this.ctx.fillStyle = entity.active ? entity.color : '#333';
                this.ctx.beginPath();
                this.ctx.arc(w / 2, 0, 5, 0, Math.PI * 2); // Emitter dot
                this.ctx.fill();
            }

            // Decorate Mirror
            if (entity.type === 'mirror') {
                this.ctx.beginPath();
                this.ctx.moveTo(-w / 2, -h / 2);
                this.ctx.lineTo(w / 2, -h / 2); // Reflective side visualization
                this.ctx.strokeStyle = '#aaf';
                this.ctx.lineWidth = 4;
                this.ctx.stroke();
            }
        }

        this.ctx.restore();
    }

    drawRay(ray) {
        if (ray.intensity < 0.01) return;

        this.ctx.strokeStyle = ray.color || '#f00';
        this.ctx.lineWidth = Math.max(1, ray.intensity * 3);
        this.ctx.globalAlpha = ray.intensity;

        // Glow effect
        this.ctx.shadowBlur = 10 * ray.intensity;
        this.ctx.shadowColor = ray.color;

        this.ctx.beginPath();
        this.ctx.moveTo(ray.p1.x, ray.p1.y);
        this.ctx.lineTo(ray.p2.x, ray.p2.y);
        this.ctx.stroke();

        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 1.0;
    }
}
