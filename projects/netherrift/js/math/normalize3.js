export function normalize3(x,y,z) {
  const l = Math.sqrt(x*x+y*y+z*z);
  return l < 1e-10 ? [0,0,0] : [x/l, y/l, z/l];
}
