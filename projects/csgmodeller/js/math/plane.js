class Plane {
    constructor(normal, w) {
        this.normal = normal;
        this.w = w;
    }

    clone() {
        return new Plane(this.normal.clone(), this.w);
    }

    flip() {
        this.normal = this.normal.negate();
        this.w = -this.w;
    }

    // Create a plane from 3 points
    static fromPoints(a, b, c) {
        const n = b.sub(a).cross(c.sub(a)).normalize();
        return new Plane(n, n.dot(a));
    }

    static get EPSILON() {
        return 1e-5;
    }

    // Split a polygon by this plane
    // Stores resulting polygons in the coplanarFront, coplanarBack, front, and back arrays
    splitPolygon(polygon, coplanarFront, coplanarBack, front, back) {
        const COPLANAR = 0;
        const FRONT = 1;
        const BACK = 2;
        const SPANNING = 3;

        // Classify each point
        // 0: coplanar, 1: front, 2: back
        const types = [];
        let polygonType = 0;

        for (let i = 0; i < polygon.vertices.length; i++) {
            const t = this.normal.dot(polygon.vertices[i].pos) - this.w;
            const type = (t < -Plane.EPSILON) ? BACK : (t > Plane.EPSILON) ? FRONT : COPLANAR;
            polygonType |= type;
            types.push(type);
        }

        // Put the polygon in the correct list, splitting it when necessary
        switch (polygonType) {
            case COPLANAR:
                (this.normal.dot(polygon.plane.normal) > 0 ? coplanarFront : coplanarBack).push(polygon);
                break;
            case FRONT:
                front.push(polygon);
                break;
            case BACK:
                back.push(polygon);
                break;
            case SPANNING:
                const f = [], b = [];
                for (let i = 0; i < polygon.vertices.length; i++) {
                    const j = (i + 1) % polygon.vertices.length;
                    const ti = types[i], tj = types[j];
                    const vi = polygon.vertices[i], vj = polygon.vertices[j];
                    if (ti != BACK) f.push(vi);
                    if (ti != FRONT) b.push(vi);
                    if ((ti | tj) == SPANNING) {
                        // Interpolate between the two points to find the intersection
                        const t = (this.w - this.normal.dot(vi.pos)) / this.normal.dot(vj.pos.sub(vi.pos));
                        const v = vi.interpolate(vj, t);
                        f.push(v);
                        b.push(v);
                    }
                }
                if (f.length >= 3) front.push(new Polygon(f, polygon.shared));
                if (b.length >= 3) back.push(new Polygon(b, polygon.shared));
                break;
        }
    }
}
