export function rotate2(x, y, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  return [x*c - y*s, x*s + y*c];
}
