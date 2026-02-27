class Vertex {
    constructor(pos, normal) {
        this.pos = pos.clone();
        this.normal = normal.clone();
    }

    clone() {
        return new Vertex(this.pos.clone(), this.normal.clone());
    }

    flip() {
        this.normal = this.normal.negate();
    }

    // Linearly interpolate between two vertices
    interpolate(other, t) {
        return new Vertex(
            this.pos.lerp(other.pos, t),
            this.normal.lerp(other.normal, t)
        );
    }
}
