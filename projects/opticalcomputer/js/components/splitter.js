import { Component } from './base.js';
import { Vec2 } from '../engine/math.js';

export class Splitter extends Component {
    constructor(x, y) {
        super(x, y, 'splitter');
        this.width = 40;
        this.height = 40;
        this.ratio = 0.5; // 50-50 split
    }

    getSegments() {
        // A splitter acts like a mirror that also lets light through
        // Modeled as a diagonal line inside the box
        const w = this.width / 2;
        const h = this.height / 2;

        // Diagonal from top-left to bottom-right (relative)
        // If rotation is 0, it splits horizontal beam into horizontal(transmit) and vertical(reflect)

        // Let's define the splitter plane as a line segment
        // It reflects 50% and transmits 50%

        const dir = Vec2.rotate(Vec2.create(1, 0), this.rotation);
        const normal = Vec2.rotate(Vec2.create(0, 1), this.rotation);

        const p1 = Vec2.add(this.position, Vec2.scale(dir, -w));
        const p2 = Vec2.add(this.position, Vec2.scale(dir, w));

        return [{
            p1: p1,
            p2: p2,
            type: 'splitter',
            normal: normal,
            component: this,
            ratio: this.ratio
        }];
    }
}
