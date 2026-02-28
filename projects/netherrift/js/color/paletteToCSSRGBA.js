export function paletteToCSSRGBA(lut, t) {
  const i = Math.min(255, Math.max(0, t * 255 | 0)) * 4;
  return `rgba(${lut[i]},${lut[i+1]},${lut[i+2]},${(lut[i+3]/255).toFixed(3)})`;
}
