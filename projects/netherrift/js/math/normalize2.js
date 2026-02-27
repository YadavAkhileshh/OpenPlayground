export function normalize2(x, y) {
  const l = Math.sqrt(x*x + y*y);
  return l < 1e-10 ? [0, 0] : [x/l, y/l];
}
