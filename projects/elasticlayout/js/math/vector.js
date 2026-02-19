/**
 * Vector class for 2D physics calculations.
 * Provides standard vector operations to keep the physics engine clean.
 */
export class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        return new Vector(this.x + v.x, this.y + v.y);
    }

    sub(v) {
        return new Vector(this.x - v.x, this.y - v.y);
    }

    mult(n) {
        return new Vector(this.x * n, this.y * n);
    }

    div(n) {
        return new Vector(this.x / n, this.y / n);
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const m = this.mag();
        if (m !== 0) {
            return this.div(m);
        }
        return new Vector(0, 0);
    }

    dist(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    copy() {
        return new Vector(this.x, this.y);
    }
    
    // In-place operations for performance critical paths
    addMut(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }
    
    subMut(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    multMut(n) {
        this.x *= n;
        this.y *= n;
        return this;
    }
}
