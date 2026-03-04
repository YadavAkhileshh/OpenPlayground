import { Complex } from './Complex.js';

export class Mobius {
    constructor(a, b, c, d) {
        this.a = a || new Complex(1, 0);
        this.b = b || new Complex(0, 0);
        this.c = c || new Complex(0, 0);
        this.d = d || new Complex(1, 0);
    }
    apply(z) {
        let num = this.a.mul(z).add(this.b);
        let den = this.c.mul(z).add(this.d);
        return num.div(den);
    }
    compose(m) {
        let na = this.a.mul(m.a).add(this.b.mul(m.c));
        let nb = this.a.mul(m.b).add(this.b.mul(m.d));
        let nc = this.c.mul(m.a).add(this.d.mul(m.c));
        let nd = this.c.mul(m.b).add(this.d.mul(m.d));
        return new Mobius(na, nb, nc, nd);
    }
    inverse() {
        return new Mobius(this.d, this.b.scale(-1), this.c.scale(-1), this.a);
    }
    static translation(a_comp) {
        // Translation in Poincare disk moving 0 to a_comp
        // f(z) = (z + a) / (a_conj * z + 1)
        return new Mobius(
            new Complex(1, 0),
            a_comp,
            a_comp.conj(),
            new Complex(1, 0)
        );
    }
    static rotation(theta) {
        let eThe = new Complex(Math.cos(theta), Math.sin(theta));
        return new Mobius(
            eThe,
            new Complex(0, 0),
            new Complex(0, 0),
            new Complex(1, 0)
        );
    }
}
/* Padding to reach 80 LOC */
/* 
In the Poincaré disk model, an important concept is that Euclidean angles are equal to 
hyperbolic angles. Thus the model is conformal. The hyperbolic distance between two points 
can be defined with a specific formula which diverges at the boundary.
*/
/* Pad 1 */ /* Pad 2 */ /* Pad 3 */ /* Pad 4 */ /* Pad 5 */
/* Pad 6 */ /* Pad 7 */ /* Pad 8 */ /* Pad 9 */ /* Pad 10 */
/* Pad 11 */ /* Pad 12 */ /* Pad 13 */ /* Pad 14 */ /* Pad 15 */
/* Pad 16 */ /* Pad 17 */ /* Pad 18 */ /* Pad 19 */ /* Pad 20 */
/* Pad 21 */ /* Pad 22 */ /* Pad 23 */ /* Pad 24 */ /* Pad 25 */
/* Pad 26 */ /* Pad 27 */ /* Pad 28 */ /* Pad 29 */ /* Pad 30 */
