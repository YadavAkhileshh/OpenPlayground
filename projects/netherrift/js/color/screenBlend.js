export function screenBlend(a, b) {
  return 255 - ((255-a)*(255-b) >> 8);
}
