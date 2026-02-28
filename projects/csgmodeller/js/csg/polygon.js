class Polygon {
    constructor(vertices, shared) {
        this.vertices = vertices;
        this.shared = shared;
        this.plane = Plane.fromPoints(vertices[0].pos, vertices[1].pos, vertices[2].pos);
    }

    clone() {
        const vertices = this.vertices.map(v => v.clone());
        return new Polygon(vertices, this.shared);
    }

    flip() {
        this.vertices.reverse().map(v => v.flip());
        this.plane.flip();
    }
}
