class Ray {
    constructor(origin, direction) {
        this.origin = origin;
        this.direction = direction.normalize();
    }

    // Moller-Trumbore intersection algorithm
    intersectTriangle(v0, v1, v2) {
        const edge1 = v1.sub(v0);
        const edge2 = v2.sub(v0);
        const h = this.direction.cross(edge2);
        const a = edge1.dot(h);

        if (a > -0.00001 && a < 0.00001) return null; // Parallel

        const f = 1.0 / a;
        const s = this.origin.sub(v0);
        const u = f * s.dot(h);

        if (u < 0.0 || u > 1.0) return null;

        const q = s.cross(edge1);
        const v = f * this.direction.dot(q);

        if (v < 0.0 || u + v > 1.0) return null;

        const t = f * edge2.dot(q);

        if (t > 0.00001) {
            return {
                point: this.origin.add(this.direction.multiply(t)),
                distance: t
            };
        }
        return null;
    }

    // Intersect with a Polygon (which handles n-gons by assuming fan or looping)
    intersectPolygon(polygon) {
        // Simple fan triangulation for n-gons
        // v0, v1, v2; v0, v2, v3; etc.
        let closest = null;
        const verts = polygon.vertices.map(v => v.pos);

        for (let i = 1; i < verts.length - 1; i++) {
            const hit = this.intersectTriangle(verts[0], verts[i], verts[i + 1]);
            if (hit) {
                if (!closest || hit.distance < closest.distance) {
                    closest = hit;
                }
            }
        }
        return closest;
    }

    // Transform ray by a matrix (inverse of object matrix to test in local space)
    applyMatrix4(matrix) {
        const o = this.origin.applyMatrix4(matrix);
        // Direction is a vector, so w=0, but applyMatrix4 assumes w=1 (point).
        // Custom direction transform:
        // Dir' = Rot * Scale * Dir
        // Since we don't have separate rot matrix easily, let's just transform two points and sub.
        const d = this.origin.add(this.direction).applyMatrix4(matrix).sub(o).normalize();
        return new Ray(o, d);
    }
}
