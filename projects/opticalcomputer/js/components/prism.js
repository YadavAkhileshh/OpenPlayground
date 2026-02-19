import { Component } from './base.js';
import { Vec2 } from '../engine/math.js';

export class Prism extends Component {
    constructor(x, y) {
        super(x, y, 'prism');
        this.width = 40;
        this.height = 40;
        this.ior = 1.5; // Index of Refraction (Glass)
    }

    getSegments() {
        // Triangle shape
        const r = this.width / 2;

        // Equilateral triangle points
        const p1 = { x: 0, y: -r };
        const p2 = { x: r * 0.866, y: r * 0.5 };
        const p3 = { x: -r * 0.866, y: r * 0.5 };

        const points = [p1, p2, p3];

        const worldPoints = points.map(p => {
            const rot = Vec2.rotate(p, this.rotation);
            return Vec2.add(this.position, rot);
        });

        const segments = [];
        for (let i = 0; i < 3; i++) {
            const a = worldPoints[i];
            const b = worldPoints[(i + 1) % 3];

            // Calculate normal for this face
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const normal = Vec2.normalize({ x: -dy, y: dx }); // Outward normal

            segments.push({
                p1: a,
                p2: b,
                type: 'refractor',
                normal: normal,
                ior: this.ior,
                component: this
            });
        }

        return segments;
    }
}
