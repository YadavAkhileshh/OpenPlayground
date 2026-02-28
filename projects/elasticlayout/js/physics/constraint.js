import { Vector } from '../math/vector.js';

export class Constraint {
    constructor(p1, p2, length = null, stiffness = 0.1) {
        this.p1 = p1;
        this.p2 = p2;
        // If length is not provided, use the initial distance
        this.length = length === null ? p1.pos.dist(p2.pos) : length;
        this.stiffness = stiffness;
    }

    resolve() {
        const dx = this.p1.pos.x - this.p2.pos.x;
        const dy = this.p1.pos.y - this.p2.pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist === 0) return; // Avoid division by zero

        const diff = (dist - this.length) / dist;
        const offset = diff * this.stiffness * 0.5;

        const offsetX = dx * offset;
        const offsetY = dy * offset;

        // Apply correction based on pinning
        // If neither is pinned, they share the movement
        if (!this.p1.isPinned && !this.p2.isPinned) {
            this.p1.pos.x -= offsetX;
            this.p1.pos.y -= offsetY;
            this.p2.pos.x += offsetX;
            this.p2.pos.y += offsetY;
        }
        // If p1 is pinned, p2 moves full distance
        else if (this.p1.isPinned && !this.p2.isPinned) {
            this.p2.pos.x += offsetX * 2;
            this.p2.pos.y += offsetY * 2;
        }
        // If p2 is pinned, p1 moves full distance
        else if (!this.p1.isPinned && this.p2.isPinned) {
            this.p1.pos.x -= offsetX * 2;
            this.p1.pos.y -= offsetY * 2;
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.p1.pos.x, this.p1.pos.y);
        ctx.lineTo(this.p2.pos.x, this.p2.pos.y);
        ctx.strokeStyle = 'rgba(88, 166, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}
