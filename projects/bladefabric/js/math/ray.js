// ray.js
import { Vec2 } from './vec2.js';

export class Ray {
    constructor(origin = new Vec2(), dir = new Vec2(1, 0)) {
        this.origin = origin.clone();
        this.dir = dir.clone().normalize();
    }

    getPoint(t) {
        return new Vec2(this.origin.x + this.dir.x * t, this.origin.y + this.dir.y * t);
    }
}
