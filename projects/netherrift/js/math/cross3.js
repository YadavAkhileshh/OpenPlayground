export function cross3(ax,ay,az,bx,by,bz) {
  return [ay*bz - az*by, az*bx - ax*bz, ax*by - ay*bx];
}
