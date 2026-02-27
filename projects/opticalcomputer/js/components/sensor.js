import { Component } from './base.js';
import { Vec2 } from '../engine/math.js';

export class Sensor extends Component {
    constructor(x, y) {
        super(x, y, 'sensor');
        this.width = 30;
        this.height = 30;
        this.isLit = false;
        this.threshold = 0.1; // Min intensity to trigger
    }

    reset() {
        this.isLit = false;
    }

    onHit(intensity) {
        if (intensity >= this.threshold) {
            this.isLit = true;
        }
    }

    getSegments() {
        // Sensor is a target. It detects hits but stops the beam (absorbs it)
        const w = this.width / 2;
        const h = this.height / 2;

        // Simple box collider
        const corners = [
            { x: -w, y: -h },
            { x: w, y: -h },
            { x: w, y: h },
            { x: -w, y: h }
        ];

        const worldCorners = corners.map(c => {
            const rot = Vec2.rotate(c, this.rotation);
            return Vec2.add(this.position, rot);
        });

        const segments = [];
        for (let i = 0; i < 4; i++) {
            segments.push({
                p1: worldCorners[i],
                p2: worldCorners[(i + 1) % 4],
                type: 'sensor',
                component: this
            });
        }
        return segments;
    }
}
