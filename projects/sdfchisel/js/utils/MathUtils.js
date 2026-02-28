/**
 * MathUtils.js – Mathematical utilities for SDF computation and particle physics.
 */
const MathUtils = (() => {
  'use strict';
  const TWO_PI = Math.PI * 2;
  const HALF_PI = Math.PI / 2;
  const SQRT2 = Math.SQRT2;
  const EPSILON = 1e-7;
  const INF = Infinity;

  const clamp = (v, lo, hi) => v < lo ? lo : v > hi ? hi : v;
  const saturate = (v) => v < 0 ? 0 : v > 1 ? 1 : v;
  const clampAbs = (v, lim) => v > lim ? lim : v < -lim ? -lim : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const smoothstep = (e0, e1, x) => { const t = saturate((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
  const smootherstep = (e0, e1, x) => { const t = saturate((x - e0) / (e1 - e0)); return t * t * t * (t * (t * 6 - 15) + 10); };
  const bilinear = (q00, q10, q01, q11, tx, ty) => lerp(lerp(q00, q10, tx), lerp(q01, q11, tx), ty);
  const remap = (v, a, b, c, d) => c + (d - c) * ((v - a) / (b - a));
  const remapClamped = (v, a, b, c, d) => c + (d - c) * saturate((v - a) / (b - a));
  const atan2Safe = (y, x) => { const a = Math.atan2(y, x); return a < 0 ? a + TWO_PI : a; };
  const angleDiff = (a, b) => { let d = (b - a) % TWO_PI; if (d > Math.PI) d -= TWO_PI; if (d < -Math.PI) d += TWO_PI; return d; };
  const degToRad = (d) => d * (Math.PI / 180);
  const radToDeg = (r) => r * (180 / Math.PI);
  const expDecay = (a, b, k, dt) => b + (a - b) * Math.exp(-k * dt);
  const roundTo = (v, p) => { const s = 10 ** p; return Math.round(v * s) / s; };
  const snapToGrid = (v, g) => Math.round(v / g) * g;
  const random = (lo = 0, hi = 1) => lo + Math.random() * (hi - lo);
  const randomInt = (lo, hi) => Math.floor(lo + Math.random() * (hi - lo + 1));
  function randomGaussian(mean = 0, std = 1) {
    let u = 0, v = 0;
    while (!u) u = Math.random();
    while (!v) v = Math.random();
    return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(TWO_PI * v);
  }
  function randomInCircle(r = 1) {
    const rad = r * Math.sqrt(Math.random()), t = Math.random() * TWO_PI;
    return { x: rad * Math.cos(t), y: rad * Math.sin(t) };
  }
  function randomOnCircle(r = 1) {
    const t = Math.random() * TWO_PI; return { x: r * Math.cos(t), y: r * Math.sin(t) };
  }
  function makeLCG(seed) {
    let s = seed >>> 0;
    return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
  }
  const dist2 = (ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay; return dx * dx + dy * dy; };
  const dist = (ax, ay, bx, by) => Math.sqrt(dist2(ax, ay, bx, by));
  function distSqToSegment(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, lenSq = dx * dx + dy * dy;
    const t = lenSq < EPSILON ? 0 : saturate(((px - ax) * dx + (py - ay) * dy) / lenSq);
    const nx = ax + t * dx - px, ny = ay + t * dy - py; return nx * nx + ny * ny;
  }
  function sdBox(px, py, hw, hh) {
    const dx = Math.abs(px) - hw, dy = Math.abs(py) - hh;
    return Math.sqrt(Math.max(dx, 0) ** 2 + Math.max(dy, 0) ** 2) + Math.min(Math.max(dx, dy), 0);
  }
  const sdCircle = (px, py, cx, cy, r) => dist(px, py, cx, cy) - r;
  const sdSegment = (px, py, ax, ay, bx, by) => Math.sqrt(distSqToSegment(px, py, ax, ay, bx, by));
  const sdSmoothUnion = (d1, d2, k) => { const h = Math.max(k - Math.abs(d1 - d2), 0) / k; return Math.min(d1, d2) - h * h * k * 0.25; };
  const bezierQuadratic = (p0, p1, p2, t) => { const mt = 1 - t; return mt * mt * p0 + 2 * mt * t * p1 + t * t * p2; };
  const bezierCubic = (p0, p1, p2, p3, t) => { const mt = 1 - t; return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3; };
  const bezierQuadraticDeriv = (p0, p1, p2, t) => 2 * (1 - t) * (p1 - p0) + 2 * t * (p2 - p1);
  const bezierCubicDeriv = (p0, p1, p2, p3, t) => { const mt = 1 - t; return 3 * mt * mt * (p1 - p0) + 6 * mt * t * (p2 - p1) + 3 * t * t * (p3 - p2); };
  function distToQuadBezier(px, py, x0, y0, x1, y1, x2, y2) {
    const S = 16; let minD = INF, minT = 0;
    for (let i = 0; i <= S; i++) {
      const t = i / S, bx = bezierQuadratic(x0, x1, x2, t), by = bezierQuadratic(y0, y1, y2, t);
      const d = dist2(px, py, bx, by); if (d < minD) { minD = d; minT = t; }
    }
    let t = minT;
    for (let it = 0; it < 3; it++) {
      const bx = bezierQuadratic(x0, x1, x2, t), by = bezierQuadratic(y0, y1, y2, t);
      const dbx = bezierQuadraticDeriv(x0, x1, x2, t), dby = bezierQuadraticDeriv(y0, y1, y2, t);
      const ex = bx - px, ey = by - py, num = ex * dbx + ey * dby;
      const den = dbx * dbx + dby * dby + ex * (2 * (x2 - 2 * x1 + x0)) + ey * (2 * (y2 - 2 * y1 + y0));
      if (Math.abs(den) > EPSILON) t -= num / den; t = saturate(t);
    }
    const bx = bezierQuadratic(x0, x1, x2, t), by = bezierQuadratic(y0, y1, y2, t);
    return Math.sqrt(dist2(px, py, bx, by));
  }
  const sign = (v) => v < 0 ? -1 : v > 0 ? 1 : 0;
  const fract = (v) => v - Math.floor(v);
  const mod = (a, b) => ((a % b) + b) % b;
  const isPow2 = (n) => n > 0 && (n & (n - 1)) === 0;
  const arrayMin = (a) => { let m = INF; for (let i = 0; i < a.length; i++) if (a[i] < m) m = a[i]; return m; };
  const arrayMax = (a) => { let m = -INF; for (let i = 0; i < a.length; i++) if (a[i] > m) m = a[i]; return m; };
  const arraySum = (a) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return s; };
  const arrayMean = (a) => a.length ? arraySum(a) / a.length : 0;
  return {
    TWO_PI, HALF_PI, SQRT2, EPSILON, INF,
    clamp, saturate, clampAbs, lerp, smoothstep, smootherstep, bilinear,
    remap, remapClamped, atan2Safe, angleDiff, degToRad, radToDeg,
    expDecay, roundTo, snapToGrid,
    random, randomInt, randomGaussian, randomInCircle, randomOnCircle, makeLCG,
    dist2, dist, distSqToSegment,
    sdBox, sdCircle, sdSegment, sdSmoothUnion,
    bezierQuadratic, bezierCubic, bezierQuadraticDeriv, bezierCubicDeriv, distToQuadBezier,
    sign, fract, mod, isPow2, arrayMin, arrayMax, arraySum, arrayMean
  };
})();
window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.MathUtils = MathUtils;
