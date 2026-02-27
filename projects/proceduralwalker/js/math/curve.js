/**
 * CubicBezier Class
 * Represents a cubic bezier curve.
 */
class CubicBezier {
    constructor(p0, p1, p2, p3) {
        this.p0 = p0;
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
    }

    getPoint(t) {
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * t;

        const x = uuu * this.p0.x +
            3 * uu * t * this.p1.x +
            3 * u * tt * this.p2.x +
            ttt * this.p3.x;

        const y = uuu * this.p0.y +
            3 * uu * t * this.p1.y +
            3 * u * tt * this.p2.y +
            ttt * this.p3.y;

        return new Vector2(x, y);
    }
}

/**
 * CatmullRomSpline Class
 * Interpolates smoothly through a series of points.
 */
class CatmullRomSpline {
    constructor(points) {
        this.points = points;
    }

    getPoint(t) {
        // Find segment
        const p = (this.points.length - 1) * t;
        const intPoint = Math.floor(p);
        const weight = p - intPoint;

        const p0 = this.points[intPoint === 0 ? intPoint : intPoint - 1];
        const p1 = this.points[intPoint];
        const p2 = this.points[intPoint > this.points.length - 2 ? this.points.length - 1 : intPoint + 1];
        const p3 = this.points[intPoint > this.points.length - 3 ? this.points.length - 1 : intPoint + 2];

        return this.catmullRom(p0, p1, p2, p3, weight);
    }

    catmullRom(p0, p1, p2, p3, t) {
        const t2 = t * t;
        const t3 = t2 * t;

        const v0 = (p2.x - p0.x) * 0.5;
        const v1 = (p3.x - p1.x) * 0.5;
        const x = (2 * p1.x - 2 * p2.x + v0 + v1) * t3 + (-3 * p1.x + 3 * p2.x - 2 * v0 - v1) * t2 + v0 * t + p1.x;

        const u0 = (p2.y - p0.y) * 0.5;
        const u1 = (p3.y - p1.y) * 0.5;
        const y = (2 * p1.y - 2 * p2.y + u0 + u1) * t3 + (-3 * p1.y + 3 * p2.y - 2 * u0 - u1) * t2 + u0 * t + p1.y;

        return new Vector2(x, y);
    }
}
