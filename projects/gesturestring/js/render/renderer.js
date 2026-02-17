/**
 * Renderer Module
 * Handles HTML5 Canvas rendering context.
 */
import { map } from '../math/utils.js';

export class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    clear() {
        // Use a composite operation to create trails if desired
        // this.ctx.fillStyle = 'rgba(5, 5, 16, 0.2)'; 
        // this.ctx.fillRect(0, 0, this.width, this.height);

        // Standard clear
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    /**
     * Draws a glowing line between two points.
     * @param {number} x1 
     * @param {number} y1 
     * @param {number} x2 
     * @param {number} y2 
     * @param {object} color - {r,g,b,a}
     * @param {number} thickness 
     */
    drawLine(x1, y1, x2, y2, color, thickness) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);

        const style = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
        this.ctx.strokeStyle = style;
        this.ctx.lineWidth = thickness;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // Glow effect
        this.ctx.shadowBlur = thickness * 2;
        this.ctx.shadowColor = style;

        this.ctx.stroke();

        // Reset shadow for performance if needed, or keep it per batch
        this.ctx.shadowBlur = 0;
    }

    /**
     * Draws a filled circle (particle).
     */
    drawCircle(x, y, radius, color) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
        this.ctx.shadowBlur = radius * 3;
        this.ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }
}
