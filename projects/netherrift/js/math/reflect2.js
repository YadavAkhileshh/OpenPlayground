import { dot2 } from "./dot2.js";
export function reflect2(vx, vy, nx, ny) {
  const d = 2 * dot2(vx, vy, nx, ny);
  return [vx - d*nx, vy - d*ny];
}
