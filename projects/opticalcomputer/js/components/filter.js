import { Component } from './base.js';
import { Vec2 } from '../engine/math.js';

export class Filter extends Component {
    constructor(x, y) {
        super(x, y, 'filter');
        this.width = 10;
        this.height = 40;
        this.color = '#ff0000'; // Default red filter
        this.wavelength = 'red'; // red, green, blue
    }

    getSegments() {
        // A filter is a thin line that modifies the ray passing through
        const w = this.width / 2;
        const h = this.height / 2;

        // Vertical strip (relative to rotation)
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

        // We treat it as 2 transparent faces? Or just a volume?
        // For 2D raycaster, usually a line segment that "transmits" with modification.

        // Let's use the main axis (Y-axis in local space) as receiving face?
        // Actually, usually filters are plates. Rays hit the face.

        // Let's define the "face" as the long side? No, usually short side is thickness.
        // Let's say it acts like a Splitter but 100% transmission of matching color, 0% of others.

        // Defined by a line segment through the center?
        const dir = Vec2.rotate(Vec2.create(0, 1), this.rotation); // Up vector
        const p1 = Vec2.add(this.position, Vec2.scale(dir, -h));
        const p2 = Vec2.add(this.position, Vec2.scale(dir, h));

        // Also need the side faces to block? 
        // For simplicity, just one transmission line.

        return [{
            p1: p1,
            p2: p2,
            type: 'filter',
            component: this,
            color: this.color
        }];
    }
}
