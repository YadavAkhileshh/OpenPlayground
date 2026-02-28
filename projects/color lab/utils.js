// utils.js — Color Palette Lab Utilities

const Utils = {
  hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => {
      const k = (n + h / 30) % 12;
      return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    };
    return (
      "#" +
      [f(0), f(8), f(4)]
        .map((x) =>
          Math.round(x * 255)
            .toString(16)
            .padStart(2, "0"),
        )
        .join("")
    );
  },

  hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  },

  luminance({ r, g, b }) {
    const ch = [r, g, b].map((c) => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  },

  contrast(hex1, hex2) {
    const l1 = this.luminance(this.hexToRgb(hex1));
    const l2 = this.luminance(this.hexToRgb(hex2));
    const bright = Math.max(l1, l2),
      dark = Math.min(l1, l2);
    return ((bright + 0.05) / (dark + 0.05)).toFixed(2);
  },

  wcagLabel(ratio) {
    if (ratio >= 7) return { label: "AAA", ok: true };
    if (ratio >= 4.5) return { label: "AA", ok: true };
    if (ratio >= 3) return { label: "AA Large", ok: true };
    return { label: "FAIL", ok: false };
  },

  generateHarmony(baseHue, mode, sat = 65, light = 50) {
    const hues = {
      analogous: [0, 30, 60, -30, -60],
      complementary: [0, 180, 20, 200, -20],
      triadic: [0, 120, 240, 60, 180],
      "split-complementary": [0, 150, 210, 30, -30],
      monochromatic: [0, 0, 0, 0, 0],
      random: Array.from({ length: 5 }, () => Math.floor(Math.random() * 360)),
    };
    const offsets = hues[mode] || hues["analogous"];
    return offsets.map((offset, i) => {
      const h = (baseHue + offset + 360) % 360;
      const s =
        mode === "monochromatic"
          ? Math.max(10, sat - i * 15)
          : sat + (Math.random() * 10 - 5);
      const l =
        mode === "monochromatic"
          ? 25 + i * 15
          : light + (Math.random() * 10 - 5);
      return this.hslToHex(
        h,
        Math.min(100, Math.max(0, s)),
        Math.min(90, Math.max(10, l)),
      );
    });
  },

  toCSSVars(palette) {
    return palette.map((hex, i) => `  --color-${i + 1}: ${hex};`).join("\n");
  },

  save(data) {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
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

  copyToClipboard(text) {
    navigator.clipboard?.writeText(text).catch(() => {});
  },
};
