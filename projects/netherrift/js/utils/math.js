/**
 * NetherRift — Math Utilities
 * Pure, side-effect-free helpers for all subsystems.
 */

export { clamp } from '../math/clamp.js';
export { lerp } from '../math/lerp.js';
export { invLerp } from '../math/invLerp.js';
export { remap } from '../math/remap.js';
export { fract } from '../math/fract.js';
export { posMod } from '../math/posMod.js';
export { wrapAngle } from '../math/wrapAngle.js';
export { isFiniteNum } from '../math/isFiniteNum.js';

export { smoothstep } from '../math/smoothstep.js';
export { smootherstep } from '../math/smootherstep.js';

export { lenSq2 } from '../math/lenSq2.js';
export { len2 } from '../math/len2.js';
export { distSq2 } from '../math/distSq2.js';
export { dist2 } from '../math/dist2.js';
export { dot2 } from '../math/dot2.js';
export { cross2 } from '../math/cross2.js';

export { normalize2 } from '../math/normalize2.js';
export { rotate2 } from '../math/rotate2.js';
export { reflect2 } from '../math/reflect2.js';

export { lenSq3 } from '../math/lenSq3.js';
export { len3 } from '../math/len3.js';
export { dot3 } from '../math/dot3.js';
export { cross3 } from '../math/cross3.js';
export { normalize3 } from '../math/normalize3.js';
//  Easing 
export { easeInQuad } from '../math/easeInQuad.js';
export { easeOutQuad } from '../math/easeOutQuad.js';
export const easeInOutQuad = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
export const easeInCubic = t => t * t * t;
export const easeOutCubic = t => { const u = 1 - t; return 1 - u * u * u; };
export const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const easeOutExpo = t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
export function easeOutElastic(t) {
  if (t === 0 || t === 1) return t;
  const c4 = (2 * Math.PI) / 3;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

//  PRNG — Mulberry32 
/**
 * Mulberry32 hash: deterministic float [0,1) from a 32-bit seed.
 * @param {number} seed @returns {number}
 */
export function mulberry32(seed) {
  let t = (seed + 0x6D2B79F5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/**
 * Hash two integers to float [0,1).
 * @param {number} a @param {number} b @returns {number}
 */
export function hash2ToFloat(a, b) {
  let h = (a * 73856093) ^ (b * 19349663);
  h ^= h >>> 16;
  h = Math.imul(h, 0x45d9f3b);
  h ^= h >>> 16;
  return (h >>> 0) / 0x100000000;
}

/** Random float in [min, max) from seed. */
export const randRange = (seed, min, max) => min + mulberry32(seed) * (max - min);

/** Random 2-D unit vector from seed. */
export function randUnitVec2(seed) {
  const a = mulberry32(seed) * Math.PI * 2;
  return [Math.cos(a), Math.sin(a)];
}

//  Misc 
/** Next power-of-two  n. */
export function nextPow2(n) {
  let v = n - 1; v |= v >> 1; v |= v >> 2; v |= v >> 4; v |= v >> 8; v |= v >> 16; return v + 1;
}

/** Average of a numeric array. */
export function average(arr) {
  if (!arr.length) return 0;
  let s = 0; for (let i = 0; i < arr.length; i++) s += arr[i]; return s / arr.length;
}

/**
 * Bilinear interpolation over a 22 grid.
 * @param {number} q00 @param {number} q10
 * @param {number} q01 @param {number} q11
 * @param {number} tx  @param {number} ty
 * @returns {number}
 */
export function bilinear(q00, q10, q01, q11, tx, ty) {
  return lerp(lerp(q00, q10, tx), lerp(q01, q11, tx), ty);
}

/**
 * Catmull-Rom spline through control points at normalised position t.
 * @param {number[]} pts — at least 4 values
 * @param {number}   t   — [0,1]
 * @returns {number}
 */
export function catmullRom(pts, t) {
  const n = pts.length - 1;
  const seg = t * n;
  const i = Math.floor(seg), f = seg - i;
  const p0 = pts[Math.max(0, i - 1)];
  const p1 = pts[i];
  const p2 = pts[Math.min(n, i + 1)];
  const p3 = pts[Math.min(n, i + 2)];
  const f2 = f * f, f3 = f2 * f;
  return 0.5 * ((-p0 + 3 * p1 - 3 * p2 + p3) * f3 + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f2 + (-p0 + p2) * f + 2 * p1);
}
