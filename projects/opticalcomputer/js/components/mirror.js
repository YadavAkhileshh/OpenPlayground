import { Component } from './base.js';
import { Vec2 } from '../engine/math.js';

export class Mirror extends Component {
    constructor(x, y) {
        super(x, y, 'mirror');
        this.width = 40;
        this.height = 10;
        this.reflectivity = 1.0;
    }

    getSegments() {
        // A mirror is a single reflective line segment
        const w = this.width / 2;

        // Reflective surface is the "top" (relative to rotation)
        // But for a simple mirror line, we can just treat it as a line segment
        // Let's make it a thin box, but only the front face reflects? 
        // For simplicity, let's treat the Main axis as the reflector.

        const dir = Vec2.rotate(Vec2.create(1, 0), this.rotation);
        const normal = Vec2.rotate(Vec2.create(0, 1), this.rotation); // Normal points "up"

        // Endpoints
        const p1 = Vec2.add(this.position, Vec2.scale(dir, -w));
        const p2 = Vec2.add(this.position, Vec2.scale(dir, w));

        return [{
            p1: p1,
            p2: p2,
            type: 'mirror',
            normal: normal,
            component: this
        }];
    }
}
