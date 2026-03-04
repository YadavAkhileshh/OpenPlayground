/**
 * Vec2.js – 2D vector class for particle physics and gradient computations.
 */
const Vec2 = (() => {
    'use strict';
    const { sqrt, abs, atan2, cos, sin, hypot } = Math;
    const EPSILON = 1e-10;

    function Vec2(x = 0, y = 0) { this.x = x; this.y = y; }

    Vec2.zero = () => new Vec2(0, 0);
    Vec2.one = () => new Vec2(1, 1);
    Vec2.fromAngle = (a, l = 1) => new Vec2(cos(a) * l, sin(a) * l);
    Vec2.fromArray = (a) => new Vec2(a[0], a[1]);
    Vec2.lerp = (a, b, t) => new Vec2(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
    Vec2.distance = (a, b) => hypot(b.x - a.x, b.y - a.y);
    Vec2.distanceSq = (a, b) => { const dx = b.x - a.x, dy = b.y - a.y; return dx * dx + dy * dy; };
    Vec2.dot = (a, b) => a.x * b.x + a.y * b.y;
    Vec2.cross = (a, b) => a.x * b.y - a.y * b.x;
    Vec2.add = (a, b) => new Vec2(a.x + b.x, a.y + b.y);
    Vec2.sub = (a, b) => new Vec2(a.x - b.x, a.y - b.y);
    Vec2.mul = (a, s) => new Vec2(a.x * s, a.y * s);
    Vec2.div = (a, s) => s ? new Vec2(a.x / s, a.y / s) : Vec2.zero();
    Vec2.normalize = (v) => { const l = hypot(v.x, v.y); return l > EPSILON ? new Vec2(v.x / l, v.y / l) : Vec2.zero(); };
    Vec2.angle = (v) => atan2(v.y, v.x);
    Vec2.reflect = (v, n) => { const d = 2 * Vec2.dot(v, n); return new Vec2(v.x - d * n.x, v.y - d * n.y); };
    Vec2.rotate = (v, a) => { const c = cos(a), s = sin(a); return new Vec2(v.x * c - v.y * s, v.x * s + v.y * c); };
    Vec2.perp = (v) => new Vec2(-v.y, v.x);
    Vec2.abs = (v) => new Vec2(abs(v.x), abs(v.y));
    Vec2.clampLength = (v, mx) => { const lsq = v.x * v.x + v.y * v.y; if (lsq > mx * mx) { const s = mx / sqrt(lsq); return new Vec2(v.x * s, v.y * s); } return new Vec2(v.x, v.y); };
    Vec2.project = (a, b) => { const lsq = b.x * b.x + b.y * b.y; if (lsq < EPSILON) return Vec2.zero(); const s = Vec2.dot(a, b) / lsq; return new Vec2(b.x * s, b.y * s); };

    Vec2.prototype.set = function (x, y) { this.x = x; this.y = y; return this; };
    Vec2.prototype.copy = function (o) { this.x = o.x; this.y = o.y; return this; };
    Vec2.prototype.add = function (o) { this.x += o.x; this.y += o.y; return this; };
    Vec2.prototype.addScaled = function (o, s) { this.x += o.x * s; this.y += o.y * s; return this; };
    Vec2.prototype.sub = function (o) { this.x -= o.x; this.y -= o.y; return this; };
    Vec2.prototype.scale = function (s) { this.x *= s; this.y *= s; return this; };
    Vec2.prototype.normalizeSelf = function () { const l = hypot(this.x, this.y); if (l > EPSILON) { this.x /= l; this.y /= l; } return this; };
    Vec2.prototype.rotateSelf = function (a) { const c = cos(a), s = sin(a), nx = this.x * c - this.y * s; this.y = this.x * s + this.y * c; this.x = nx; return this; };
    Vec2.prototype.clampLengthSelf = function (mx) { const lsq = this.x * this.x + this.y * this.y; if (lsq > mx * mx) { const s = mx / sqrt(lsq); this.x *= s; this.y *= s; } return this; };
    Vec2.prototype.negate = function () { this.x = -this.x; this.y = -this.y; return this; };
    Vec2.prototype.zero = function () { this.x = 0; this.y = 0; return this; };
    Vec2.prototype.length = function () { return hypot(this.x, this.y); };
    Vec2.prototype.lengthSq = function () { return this.x * this.x + this.y * this.y; };
    Vec2.prototype.dot = function (o) { return this.x * o.x + this.y * o.y; };
    Vec2.prototype.cross = function (o) { return this.x * o.y - this.y * o.x; };
    Vec2.prototype.distanceTo = function (o) { return hypot(o.x - this.x, o.y - this.y); };
    Vec2.prototype.distanceSqTo = function (o) { const dx = o.x - this.x, dy = o.y - this.y; return dx * dx + dy * dy; };
    Vec2.prototype.angle = function () { return atan2(this.y, this.x); };
    Vec2.prototype.isZero = function () { return Math.abs(this.x) < EPSILON && Math.abs(this.y) < EPSILON; };
    Vec2.prototype.clone = function () { return new Vec2(this.x, this.y); };
    Vec2.prototype.toArray = function () { return [this.x, this.y]; };

    // Temporary scratch vectors
    Vec2.tmp = [new Vec2(), new Vec2(), new Vec2()];

    // Pool acquire (round-robin)
    const POOL_SZ = 128;
    const _pool = Array.from({ length: POOL_SZ }, () => new Vec2());
    let _pi = 0;
    Vec2.acquire = (x = 0, y = 0) => { const v = _pool[_pi++ % POOL_SZ]; v.x = x; v.y = y; return v; };

    return Vec2;
})();
window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.Vec2 = Vec2;
