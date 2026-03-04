/**
 * KaleidoScroll - Geometry Calculator Module
 * Handles all geometric calculations for kaleidoscope rendering
 * including symmetry patterns, transformations, and mathematical utilities
 */

const GeometryCalculator = (() => {
    'use strict';

    // Mathematical constants
    const PI = Math.PI;
    const TWO_PI = PI * 2;
    const HALF_PI = PI / 2;
    const DEG_TO_RAD = PI / 180;
    const RAD_TO_DEG = 180 / PI;

    /**
     * Point class for 2D coordinates
     */
    class Point {
        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }

        clone() {
            return new Point(this.x, this.y);
        }

        distance(other) {
            const dx = this.x - other.x;
            const dy = this.y - other.y;
            return Math.sqrt(dx * dx + dy * dy);
        }

        angle() {
            return Math.atan2(this.y, this.x);
        }

        rotate(angle, center = new Point(0, 0)) {
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const dx = this.x - center.x;
            const dy = this.y - center.y;
            
            this.x = center.x + (dx * cos - dy * sin);
            this.y = center.y + (dx * sin + dy * cos);
            
            return this;
        }

        scale(factor, center = new Point(0, 0)) {
            this.x = center.x + (this.x - center.x) * factor;
            this.y = center.y + (this.y - center.y) * factor;
            return this;
        }

        translate(dx, dy) {
            this.x += dx;
            this.y += dy;
            return this;
        }
    }

    /**
     * Matrix class for 2D transformations
     */
    class Matrix2D {
        constructor() {
            this.reset();
        }

        reset() {
            this.a = 1; this.b = 0; this.c = 0;
            this.d = 1; this.e = 0; this.f = 0;
            return this;
        }

        translate(x, y) {
            this.e += this.a * x + this.c * y;
            this.f += this.b * x + this.d * y;
            return this;
        }

        rotate(angle) {
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const a = this.a;
            const b = this.b;
            const c = this.c;
            const d = this.d;

            this.a = a * cos + c * sin;
            this.b = b * cos + d * sin;
            this.c = c * cos - a * sin;
            this.d = d * cos - b * sin;
            
            return this;
        }

        scale(sx, sy = sx) {
            this.a *= sx;
            this.b *= sx;
            this.c *= sy;
            this.d *= sy;
            return this;
        }

        multiply(m) {
            const a = this.a * m.a + this.c * m.b;
            const b = this.b * m.a + this.d * m.b;
            const c = this.a * m.c + this.c * m.d;
            const d = this.b * m.c + this.d * m.d;
            const e = this.a * m.e + this.c * m.f + this.e;
            const f = this.b * m.e + this.d * m.f + this.f;

            this.a = a; this.b = b; this.c = c;
            this.d = d; this.e = e; this.f = f;
            
            return this;
        }

        transformPoint(point) {
            const x = point.x * this.a + point.y * this.c + this.e;
            const y = point.x * this.b + point.y * this.d + this.f;
            return new Point(x, y);
        }

        applyToContext(ctx) {
            ctx.setTransform(this.a, this.b, this.c, this.d, this.e, this.f);
        }
    }

    /**
     * Calculate symmetry slice angle based on segment count
     */
    function calculateSliceAngle(segments) {
        return TWO_PI / segments;
    }

    /**
     * Calculate mirror positions for kaleidoscope effect
     */
    function calculateMirrorPositions(segments, radius, centerX, centerY) {
        const positions = [];
        const sliceAngle = calculateSliceAngle(segments);

        for (let i = 0; i < segments; i++) {
            const angle = i * sliceAngle;
            positions.push({
                angle: angle,
                startAngle: angle,
                endAngle: angle + sliceAngle,
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius,
                index: i
            });
        }

        return positions;
    }

    /**
     * Calculate polygon vertices for symmetry visualization
     */
    function calculatePolygonVertices(sides, radius, centerX, centerY, rotation = 0) {
        const vertices = [];
        const angleStep = TWO_PI / sides;

        for (let i = 0; i < sides; i++) {
            const angle = i * angleStep + rotation;
            vertices.push(new Point(
                centerX + Math.cos(angle) * radius,
                centerY + Math.sin(angle) * radius
            ));
        }

        return vertices;
    }

    /**
     * Calculate reflection matrix for mirror effect
     */
    function calculateReflectionMatrix(angle) {
        const cos = Math.cos(2 * angle);
        const sin = Math.sin(2 * angle);
        
        const matrix = new Matrix2D();
        matrix.a = cos;
        matrix.b = sin;
        matrix.c = sin;
        matrix.d = -cos;
        
        return matrix;
    }

    /**
     * Linear interpolation
     */
    function lerp(start, end, t) {
        return start + (end - start) * t;
    }

    /**
     * Clamp value between min and max
     */
    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * Map value from one range to another
     */
    function map(value, inMin, inMax, outMin, outMax) {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    }

    /**
     * Normalize angle to 0-2PI range
     */
    function normalizeAngle(angle) {
        while (angle < 0) angle += TWO_PI;
        while (angle >= TWO_PI) angle -= TWO_PI;
        return angle;
    }

    /**
     * Calculate distance between two points
     */
    function distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calculate angle between two points
     */
    function angleBetween(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }

    /**
     * Rotate point around center
     */
    function rotatePoint(x, y, centerX, centerY, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const dx = x - centerX;
        const dy = y - centerY;
        
        return {
            x: centerX + (dx * cos - dy * sin),
            y: centerY + (dx * sin + dy * cos)
        };
    }

    /**
     * Scale point from center
     */
    function scalePoint(x, y, centerX, centerY, factor) {
        return {
            x: centerX + (x - centerX) * factor,
            y: centerY + (y - centerY) * factor
        };
    }

    /**
     * Calculate bezier curve point at t
     */
    function bezierPoint(t, p0, p1, p2, p3) {
        const oneMinusT = 1 - t;
        const oneMinusTSq = oneMinusT * oneMinusT;
        const oneMinusTCube = oneMinusTSq * oneMinusT;
        const tSq = t * t;
        const tCube = tSq * t;

        return oneMinusTCube * p0 +
               3 * oneMinusTSq * t * p1 +
               3 * oneMinusT * tSq * p2 +
               tCube * p3;
    }

    /**
     * Calculate smooth step interpolation
     */
    function smoothStep(edge0, edge1, x) {
        const t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
        return t * t * (3 - 2 * t);
    }

    /**
     * Calculate smoother step interpolation
     */
    function smootherStep(edge0, edge1, x) {
        const t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    /**
     * Calculate easing functions
     */
    const Easing = {
        linear: t => t,
        easeInQuad: t => t * t,
        easeOutQuad: t => t * (2 - t),
        easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeInCubic: t => t * t * t,
        easeOutCubic: t => (--t) * t * t + 1,
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
        easeInQuart: t => t * t * t * t,
        easeOutQuart: t => 1 - (--t) * t * t * t,
        easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
        easeInQuint: t => t * t * t * t * t,
        easeOutQuint: t => 1 + (--t) * t * t * t * t,
        easeInOutQuint: t => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
        easeInSine: t => 1 - Math.cos(t * HALF_PI),
        easeOutSine: t => Math.sin(t * HALF_PI),
        easeInOutSine: t => -(Math.cos(PI * t) - 1) / 2,
        easeInExpo: t => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
        easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
        easeInOutExpo: t => {
            if (t === 0 || t === 1) return t;
            if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
            return (2 - Math.pow(2, -20 * t + 10)) / 2;
        },
        easeInCirc: t => 1 - Math.sqrt(1 - t * t),
        easeOutCirc: t => Math.sqrt(1 - (--t) * t),
        easeInOutCirc: t => {
            if (t < 0.5) return (1 - Math.sqrt(1 - 4 * t * t)) / 2;
            return (Math.sqrt(1 - (-2 * t + 2) * (-2 * t + 2)) + 1) / 2;
        },
        easeInBack: t => {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return c3 * t * t * t - c1 * t * t;
        },
        easeOutBack: t => {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        },
        easeInOutBack: t => {
            const c1 = 1.70158;
            const c2 = c1 * 1.525;
            if (t < 0.5) {
                return (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2;
            }
            return (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
        },
        easeInElastic: t => {
            const c4 = (2 * PI) / 3;
            if (t === 0 || t === 1) return t;
            return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
        },
        easeOutElastic: t => {
            const c4 = (2 * PI) / 3;
            if (t === 0 || t === 1) return t;
            return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
        },
        easeInOutElastic: t => {
            const c5 = (2 * PI) / 4.5;
            if (t === 0 || t === 1) return t;
            if (t < 0.5) {
                return -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2;
            }
            return (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
        },
        easeInBounce: t => 1 - Easing.easeOutBounce(1 - t),
        easeOutBounce: t => {
            const n1 = 7.5625;
            const d1 = 2.75;
            if (t < 1 / d1) return n1 * t * t;
            if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
            if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        },
        easeInOutBounce: t => {
            if (t < 0.5) return Easing.easeInBounce(t * 2) / 2;
            return (1 + Easing.easeOutBounce(t * 2 - 1)) / 2;
        }
    };

    /**
     * Random number utilities
     */
    function random(min = 0, max = 1) {
        return Math.random() * (max - min) + min;
    }

    function randomInt(min, max) {
        return Math.floor(random(min, max + 1));
    }

    function randomGaussian(mean = 0, std = 1) {
        const u = 1 - Math.random();
        const v = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * PI * v);
        return z * std + mean;
    }

    // Public API
    return {
        Point,
        Matrix2D,
        calculateSliceAngle,
        calculateMirrorPositions,
        calculatePolygonVertices,
        calculateReflectionMatrix,
        lerp,
        clamp,
        map,
        normalizeAngle,
        distance,
        angleBetween,
        rotatePoint,
        scalePoint,
        bezierPoint,
        smoothStep,
        smootherStep,
        Easing,
        random,
        randomInt,
        randomGaussian,
        PI,
        TWO_PI,
        HALF_PI,
        DEG_TO_RAD,
        RAD_TO_DEG
    };
})();
