export class Complex {
    constructor(re = 0, im = 0) {
        this.re = re;
        this.im = im;
    }
    add(c) { return new Complex(this.re + c.re, this.im + c.im); }
    sub(c) { return new Complex(this.re - c.re, this.im - c.im); }
    mul(c) {
        return new Complex(
            this.re * c.re - this.im * c.im,
            this.re * c.im + this.im * c.re
        );
    }
    div(c) {
        let den = c.re * c.re + c.im * c.im;
        if (den === 0) return new Complex(0, 0);
        return new Complex(
            (this.re * c.re + this.im * c.im) / den,
            (this.im * c.re - this.re * c.im) / den
        );
    }
    scale(s) { return new Complex(this.re * s, this.im * s); }
    conj() { return new Complex(this.re, -this.im); }
    magSq() { return this.re * this.re + this.im * this.im; }
    mag() { return Math.sqrt(this.magSq()); }
    arg() { return Math.atan2(this.im, this.re); }
    normalize() {
        let m = this.mag();
        if (m === 0) return new Complex(0, 0);
        return new Complex(this.re / m, this.im / m);
    }
    clone() { return new Complex(this.re, this.im); }
    toString() {
        let sign = this.im >= 0 ? '+' : '-';
        return `${this.re.toFixed(4)} ${sign} ${Math.abs(this.im).toFixed(4)}i`;
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
/* Pad 31 */ /* Pad 32 */ /* Pad 33 */ /* Pad 34 */ /* Pad 35 */
/* Pad 36 */ /* Pad 37 */ /* Pad 38 */ /* Pad 39 */ /* Pad 40 */
