export function addBlend(dr,dg,db,da, sr,sg,sb,sa) {
  return [Math.min(255,dr+sr), Math.min(255,dg+sg), Math.min(255,db+sb), Math.min(255,da+sa)];
}
