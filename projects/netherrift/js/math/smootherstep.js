import { clamp } from "./clamp.js";
export function smootherstep(t) {
  const c = clamp(t, 0, 1);
  return c * c * c * (c * (c * 6 - 15) + 10);
}
