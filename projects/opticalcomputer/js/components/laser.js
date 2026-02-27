import { Component } from './base.js';
import { Vec2, MathUtil } from '../engine/math.js';

export class Laser extends Component {
    constructor(x, y) {
        super(x, y, 'laser');
        this.color = '#ff2a2a'; // Default red
        this.width = 30;
        this.height = 30;
        this.isOn = true; // Lasers are on by default or controlled by logic
        this.power = 1.0;
    }

    getEmissionRay() {
        if (!this.isOn) return null;

        // Emit from the "front" of the laser
        const dir = Vec2.rotate(Vec2.create(1, 0), this.rotation);
        const origin = Vec2.add(this.position, Vec2.scale(dir, this.width / 2));

        return {
            origin: origin,
            direction: dir,
            intensity: this.power,
            color: this.color
        };
    }

    getSegments() {
        // Laser body acts as an obstacle (blocker)
        // Simple box shape
        const w = this.width / 2;
        const h = this.height / 2;

        // Corners relative to center (unrotated)
        const corners = [
            { x: -w, y: -h },
            { x: w, y: -h },
            { x: w, y: h },
            { x: -w, y: h }
        ];

        // Rotate and translate
        const worldCorners = corners.map(c => {
            const rot = Vec2.rotate(c, this.rotation);
            return Vec2.add(this.position, rot);
        });

        const segments = [];
        for (let i = 0; i < 4; i++) {
            segments.push({
                p1: worldCorners[i],
                p2: worldCorners[(i + 1) % 4],
                type: 'blocker', // Absorbs light
                component: this
            });
        }
        return segments;
    }
}
