export function samplePalette(lut, t, out, outOff) {
  const i = Math.min(255, Math.max(0, t * 255 | 0)) * 4;
  out[outOff]   = lut[i];
  out[outOff+1] = lut[i+1];
  out[outOff+2] = lut[i+2];
  out[outOff+3] = lut[i+3];
}
