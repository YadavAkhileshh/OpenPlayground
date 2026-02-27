// utils.js — Constellation Map Utilities

const Utils = {
  save(stars, lines, labels) {
    try {
      localStorage.setItem(
        CONFIG.STORAGE_KEY,
        JSON.stringify({ stars, lines, labels }),
      );
    } catch (e) {}
  },

  load() {
    try {
      const r = localStorage.getItem(CONFIG.STORAGE_KEY);
      return r ? JSON.parse(r) : null;
    } catch (e) {
      return null;
    }
  },

  distance(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  },

  nearestStar(stars, x, y, threshold = 20) {
    let best = null,
      bestDist = threshold;
    stars.forEach((s, i) => {
      const d = Utils.distance(s, { x, y });
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    return best;
  },

  randomBgStar(W, H) {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 0.8 + 0.2,
      alpha: Math.random() * 0.5 + 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * CONFIG.TWINKLE_SPEED + 0.005,
    };
  },

  uid() {
    return Math.random().toString(36).slice(2, 8);
  },

  exportSVG(canvas, stars, lines, labels, bgStars) {
    const W = canvas.width,
      H = canvas.height;
    const toSVGCircle = (s) =>
      `<circle cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="${s.size}" fill="${s.color}" opacity="0.95"/>`;
    const toSVGLine = (l) => {
      const a = stars[l[0]],
        b = stars[l[1]];
      if (!a || !b) return "";
      return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${CONFIG.LINE_COLOR}" stroke-width="${CONFIG.LINE_WIDTH}"/>`;
    };
    const toSVGLabel = (lb) =>
      `<text x="${lb.x}" y="${lb.y}" fill="rgba(200,220,255,0.8)" font-size="11" font-family="serif" font-style="italic">${lb.text}</text>`;
    const bgCircles = bgStars
      .map(
        (s) =>
          `<circle cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="${s.r.toFixed(2)}" fill="white" opacity="${s.alpha.toFixed(2)}"/>`,
      )
      .join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#020510"/>${bgCircles}${lines.map(toSVGLine).join("")}${stars.map(toSVGCircle).join("")}${labels.map(toSVGLabel).join("")}</svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "constellation-map.svg";
    a.click();
  },
};
