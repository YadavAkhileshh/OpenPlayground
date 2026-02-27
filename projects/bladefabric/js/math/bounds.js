// bounds.js
import { Vec2 } from './vec2.js';

export class AABB {
    constructor(min = new Vec2(), max = new Vec2()) {
        this.min = min.clone();
        this.max = max.clone();
    }

    set(min, max) {
        this.min.copy(min);
        this.max.copy(max);
        return this;
    }

    clone() {
        return new AABB(this.min, this.max);
    }

    isValid() {
        const d = Vec2.sub(this.max, this.min);
        let valid = d.x >= 0.0 && d.y >= 0.0;
        valid = valid && !isNaN(this.min.x) && !isNaN(this.max.x);
        return valid;
    }

    getCenter() {
        return new Vec2((this.min.x + this.max.x) * 0.5, (this.min.y + this.max.y) * 0.5);
    }

    getExtents() {
        return new Vec2((this.max.x - this.min.x) * 0.5, (this.max.y - this.min.y) * 0.5);
    }

    getPerimeter() {
        const wx = this.max.x - this.min.x;
        const wy = this.max.y - this.min.y;
        return 2.0 * (wx + wy);
    }

    combine(aabb) {
        this.min.x = Math.min(this.min.x, aabb.min.x);
        this.min.y = Math.min(this.min.y, aabb.min.y);
        this.max.x = Math.max(this.max.x, aabb.max.x);
        this.max.y = Math.max(this.max.y, aabb.max.y);
        return this;
    }

    combineTwo(aabb1, aabb2) {
        this.min.x = Math.min(aabb1.min.x, aabb2.min.x);
        this.min.y = Math.min(aabb1.min.y, aabb2.min.y);
        this.max.x = Math.max(aabb1.max.x, aabb2.max.x);
        this.max.y = Math.max(aabb1.max.y, aabb2.max.y);
        return this;
    }

    contains(aabb) {
        let result = true;
        result = result && this.min.x <= aabb.min.x;
        result = result && this.min.y <= aabb.min.y;
        result = result && aabb.max.x <= this.max.x;
        result = result && aabb.max.y <= this.max.y;
        return result;
    }

    containsPoint(p) {
        if (p.x < this.min.x || p.x > this.max.x || p.y < this.min.y || p.y > this.max.y) return false;
        return true;
    }

    overlaps(aabb) {
        const d1x = aabb.min.x - this.max.x;
        const d1y = aabb.min.y - this.max.y;
        const d2x = this.min.x - aabb.max.x;
        const d2y = this.min.y - aabb.max.y;

        if (d1x > 0.0 || d1y > 0.0) return false;
        if (d2x > 0.0 || d2y > 0.0) return false;

        return true;
    }

    expand(margin) {
        this.min.x -= margin;
        this.min.y -= margin;
        this.max.x += margin;
        this.max.y += margin;
        return this;
    }
}
