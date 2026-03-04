/**
 * NetherRift — Color Utilities
 * Palette LUTs, blending helpers, and soft-disc stamp builder.
 */

import { PALETTES, DEFAULT_PALETTE, RENDER } from "../config.js";

import { buildPaletteLUT } from '../color/buildPaletteLUT.js';
export { buildPaletteLUT };
export { samplePalette } from '../color/samplePalette.js';
export { paletteToCSSRGBA } from '../color/paletteToCSSRGBA.js';

//  HSL  RGB 
/** Convert HSL (each in [0,1]) to {r,g,b} each in [0,255]. */
export function hslToRgb(h, s, l) {
  if (s === 0) { const v = l * 255 | 0; return { r: v, g: v, b: v }; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const hue = x => {
    const t = x < 0 ? x + 1 : x > 1 ? x - 1 : x;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return { r: hue(h + 1 / 3) * 255 | 0, g: hue(h) * 255 | 0, b: hue(h - 1 / 3) * 255 | 0 };
}

/** Convert {r,g,b} in [0,255] to {h,s,l} in [0,1]. */
export function rgbToHsl(r, g, b) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn), d = max - min;
  const l = (max + min) / 2;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (l > 0.5 ? 2 - max - min : max + min);
  const h = max === rn ? (gn - bn) / d + (gn < bn ? 6 : 0) :
    max === gn ? (bn - rn) / d + 2 : (rn - gn) / d + 4;
  return { h: h / 6, s, l };
}

export { addBlend } from '../color/addBlend.js';
export { screenBlend } from '../color/screenBlend.js';

//  Soft-disc stamp 
/** Map sRGB byte to linear (approx gamma 2.2). */
export const toLinear = c => (c / 255) ** 2.2;
/** Map linear float to sRGB byte. */
export const fromLinear = v => Math.min(255, (v ** (1 / 2.2) * 255) | 0);

/**
 * Pre-build a soft radial-disc stamp as a Float32Array of alpha values.
 * Pixels outside radius have alpha 0. Center (radius) has alpha 1.
 * @param {number} radius — integer pixel radius
 * @returns {{data:Float32Array, size:number}}
 */
export function buildDiscStamp(radius) {
  const size = radius * 2 + 1;
  const data = new Float32Array(size * size);
  const r2 = radius * radius;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - radius, dy = y - radius;
      const d2 = dx * dx + dy * dy;
      if (d2 <= r2) {
        const t = 1 - Math.sqrt(d2) / radius;
        data[y * size + x] = t * t;       // quadratic falloff
      }
    }
  }
  return { data, size };
}

//  Named palette LUTs (eagerly built) 
/** Map of palette name  pre-built Uint8Array LUT. */
export const PALETTE_LUTS = Object.fromEntries(
  Object.entries(PALETTES).map(([name, stops]) => [name, buildPaletteLUT(stops)])
);

/** Currently active LUT — updated by setPalette(). */
export let activeLUT = PALETTE_LUTS[DEFAULT_PALETTE];

/**
 * Switch active LUT by palette name.
 * @param {string} name
 */
export function setPaletteName(name) {
  if (PALETTE_LUTS[name]) activeLUT = PALETTE_LUTS[name];
}
