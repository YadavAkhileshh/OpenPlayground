/**
 * Represents a 2D Transformation Matrix [a, b, c, d, e, f]
 */
export class Matrix {
    constructor() {
        this.reset();
    }

    /**
     * Resets the matrix to identity.
     */
    reset() {
        this.a = 1; this.b = 0;
        this.c = 0; this.d = 1;
        this.e = 0; this.f = 0;
        return this;
    }

    /**
     * Sets the matrix.
     */
    set(a, b, c, d, e, f) {
        this.a = a; this.b = b;
        this.c = c; this.d = d;
        this.e = e; this.f = f;
        return this;
    }

    /**
     * Multiplies current matrix with another.
     */
    multiply(mat) {
        const a1 = this.a, b1 = this.b, c1 = this.c, d1 = this.d, e1 = this.e, f1 = this.f;
        const a2 = mat.a, b2 = mat.b, c2 = mat.c, d2 = mat.d, e2 = mat.e, f2 = mat.f;

        this.a = a1 * a2 + c1 * b2;
        this.b = b1 * a2 + d1 * b2;
        this.c = a1 * c2 + c1 * d2;
        this.d = b1 * c2 + d1 * d2;
        this.e = a1 * e2 + c1 * f2 + e1;
        this.f = b1 * e2 + d1 * f2 + f1;

        return this;
    }

    /**
     * Translates the matrix.
     */
    translate(x, y) {
        this.e += this.a * x + this.c * y;
        this.f += this.b * x + this.d * y;
        return this;
    }

    /**
     * Scales the matrix.
     */
    scale(x, y) {
        this.a *= x;
        this.b *= x;
        this.c *= y;
        this.d *= y;
        return this;
    }

    /**
     * Inverts the matrix.
     */
    invert() {
        const det = this.a * this.d - this.b * this.c;
        if (!det) return this;

        const a1 = this.a, b1 = this.b, c1 = this.c, d1 = this.d, e1 = this.e, f1 = this.f;

        this.a = d1 / det;
        this.b = -b1 / det;
        this.c = -c1 / det;
        this.d = a1 / det;
        this.e = (c1 * f1 - d1 * e1) / det;
        this.f = -(a1 * f1 - b1 * e1) / det;

        return this;
    }

    /**
     * Applies the transform to a given Vector2 in place.
     * @param {Vector2} vec
     */
    transformPoint(vec) {
        const x = vec.x;
        const y = vec.y;
        vec.x = x * this.a + y * this.c + this.e;
        vec.y = x * this.b + y * this.d + this.f;
        return vec;
    }

    /**
     * Applies this matrix to a 2D Canvas Context.
     * @param {CanvasRenderingContext2D} ctx
     */
    applyToContext(ctx) {
        ctx.setTransform(this.a, this.b, this.c, this.d, this.e, this.f);
    }
}
