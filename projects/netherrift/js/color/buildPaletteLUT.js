export function buildPaletteLUT(stops) {
  const lut = new Uint8Array(256 * 4);
  const sorted = [...stops]
    .map((s, i, arr) => Array.isArray(s)
      ? { t: i / (arr.length - 1), r: s[0], g: s[1], b: s[2], a: s[3] }
      : s)
    .sort((a, b) => a.t - b.t);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let lo = sorted[0], hi = sorted[sorted.length - 1];
    for (let j = 0; j < sorted.length - 1; j++) {
      if (t >= sorted[j].t && t <= sorted[j+1].t) { lo = sorted[j]; hi = sorted[j+1]; break; }
    }
    const f = lo.t === hi.t ? 0 : (t - lo.t) / (hi.t - lo.t);
    const base = i * 4;
    lut[base]   = (lo.r + (hi.r - lo.r) * f) | 0;
    lut[base+1] = (lo.g + (hi.g - lo.g) * f) | 0;
    lut[base+2] = (lo.b + (hi.b - lo.b) * f) | 0;
    lut[base+3] = (lo.a + (hi.a - lo.a) * f) | 0;
  }
  return lut;
}
