/**
 * js/math/Complex.js
 * Represents a complex number (real + imaginary * i)
 * Essential for describing probability amplitudes in quantum mechanics.
 */

class Complex {
    /**
     * @param {number} real 
     * @param {number} imag 
     */
    constructor(real, imag = 0) {
        this.real = real;
        this.imag = imag;
    }

    /**
     * Creates a new Complex instance.
     * @returns {Complex}
     */
    clone() {
        return new Complex(this.real, this.imag);
    }

    /**
     * Returns a string representation like "0.50 + 0.50i"
     * @param {number} precision 
     * @returns {string}
     */
    toString(precision = 2) {
        const reStr = this.real.toFixed(precision);
        const imStr = Math.abs(this.imag).toFixed(precision);
        const sign = this.imag >= 0 ? '+' : '-';
        return `${reStr} ${sign} ${imStr}i`;
    }

    /**
     * Add another complex number to this one.
     * @param {Complex} other 
     * @returns {Complex} New instance
     */
    add(other) {
        return new Complex(this.real + other.real, this.imag + other.imag);
    }

    /**
     * Subtract another complex number from this one.
     * @param {Complex} other 
     * @returns {Complex} New instance
     */
    sub(other) {
        return new Complex(this.real - other.real, this.imag - other.imag);
    }

    /**
     * Multiply this complex number by another.
     * (a+bi)(c+di) = (ac - bd) + (ad + bc)i
     * @param {Complex} other 
     * @returns {Complex} New instance
     */
    mul(other) {
        if (typeof other === 'number') {
            return new Complex(this.real * other, this.imag * other);
        }
        const re = (this.real * other.real) - (this.imag * other.imag);
        const im = (this.real * other.imag) + (this.imag * other.real);
        return new Complex(re, im);
    }

    /**
     * Alias for multiplication by scalar.
     * @param {number} scalar 
     * @returns {Complex} New instance
     */
    scale(scalar) {
        return new Complex(this.real * scalar, this.imag * scalar);
    }

    /**
     * Divide this complex number by another.
     * @param {Complex} other 
     * @returns {Complex} New instance
     */
    div(other) {
        if (typeof other === 'number') {
            return new Complex(this.real / other, this.imag / other);
        }
        const denominator = (other.real * other.real) + (other.imag * other.imag);
        if (denominator === 0) {
            throw new Error("Complex Division by Zero");
        }
        const re = ((this.real * other.real) + (this.imag * other.imag)) / denominator;
        const im = ((this.imag * other.real) - (this.real * other.imag)) / denominator;
        return new Complex(re, im);
    }

    /**
     * Complex conjugate. (a - bi)
     * @returns {Complex} New instance
     */
    conjugate() {
        return new Complex(this.real, -this.imag);
    }

    /**
     * Modulus squared |z|^2 (probability)
     * @returns {number}
     */
    magSquared() {
        return (this.real * this.real) + (this.imag * this.imag);
    }

    /**
     * Modulus |z| (amplitude)
     * @returns {number}
     */
    magnitude() {
        return Math.sqrt(this.magSquared());
    }

    /**
     * The argument (phase angle) of the complex number in radians. [ -PI to PI ]
     * @returns {number}
     */
    phase() {
        return Math.atan2(this.imag, this.real);
    }

    /**
     * Normalizes the complex number to unit length.
     * @returns {Complex} New instance
     */
    normalize() {
        const mag = this.magnitude();
        if (mag === 0) return this.clone();
        return this.scale(1.0 / mag);
    }

    /**
     * Clean up floating point errors using MathUtils.
     * Mutates self.
     * @returns {Complex} this
     */
    clean() {
        this.real = window.MathUtils.roundToZero(this.real);
        this.imag = window.MathUtils.roundToZero(this.imag);
        return this;
    }

    /**
     * e^(i * theta) -> cos(theta) + i*sin(theta)
     * @param {number} theta Angle in radians
     * @returns {Complex}
     */
    static fromEuler(theta) {
        return new Complex(Math.cos(theta), Math.sin(theta));
    }

    /**
     * Helper to statically create an instance
     * @param {number} re 
     * @param {number} im 
     * @returns {Complex}
     */
    static create(re, im = 0) {
        return new Complex(re, im);
    }

    /**
     * The pre-cached ZERO constant
     */
    static ZERO = new Complex(0, 0);

    /**
     * The pre-cached ONE constant
     */
    static ONE = new Complex(1, 0);

    /**
     * The pre-cached I constant
     */
    static I = new Complex(0, 1);
}

window.Complex = Complex;
