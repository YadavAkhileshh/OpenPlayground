// config.js — Constellation Map Configuration
const CONFIG = {
  STORAGE_KEY: "constellation_map_v1",
  STAR_SIZES: { small: 2, medium: 3.5, large: 6 },
  STAR_COLORS: [
    "#ffffff",
    "#ffe4b5",
    "#add8e6",
    "#ffa07a",
    "#98fb98",
    "#dda0dd",
  ],
  LINE_COLOR: "rgba(180, 210, 255, 0.45)",
  LINE_WIDTH: 1.2,
  BACKGROUND_STARS: 280,
  TWINKLE_SPEED: 0.02,
  TOOLS: ["star", "line", "label", "erase"],
  DEFAULT_TOOL: "star",
  DEFAULT_STAR_SIZE: "medium",
  CONSTELLATIONS_PRESET: [
    {
      name: "The Navigator",
      stars: [
        { x: 0.3, y: 0.25 },
        { x: 0.38, y: 0.3 },
        { x: 0.34, y: 0.4 },
        { x: 0.28, y: 0.45 },
        { x: 0.22, y: 0.35 },
      ],
      lines: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 0],
      ],
      labelPos: { x: 0.31, y: 0.22 },
    },
  ],
};
