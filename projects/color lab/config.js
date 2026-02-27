// config.js — Color Palette Lab Configuration
const CONFIG = {
  STORAGE_KEY: "color_lab_v1",
  PALETTE_SIZE: 5,
  HARMONY_MODES: [
    "analogous",
    "complementary",
    "triadic",
    "split-complementary",
    "monochromatic",
    "random",
  ],
  DEFAULT_MODE: "analogous",
  DEFAULT_BASE_HUE: 210,
  PRESET_PALETTES: [
    {
      name: "Ocean Depths",
      hues: [200, 220, 240, 260, 180],
      sat: 65,
      light: 45,
    },
    { name: "Autumn Grove", hues: [25, 35, 50, 15, 8], sat: 70, light: 42 },
    { name: "Neon Pulse", hues: [300, 260, 180, 120, 60], sat: 90, light: 55 },
    { name: "Stone & Rust", hues: [20, 200, 30, 195, 35], sat: 30, light: 50 },
  ],
};
