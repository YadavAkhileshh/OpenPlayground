/** NetherRift — Global Configuration
 * All tunable constants: ENGINE, PARTICLES, NOISE, CURL, RENDER, PALETTES, INPUT, UI, DEBUG.
 */

// ─── Engine ────────────────────────────────────────────────────────
export const ENGINE = Object.freeze({
  TARGET_FPS:          60,
  FIXED_TIMESTEP:      1 / 60,        // seconds, used in integrator
  MAX_FRAME_BUDGET_MS: 14,            // hard cap per rAF tick
  ADAPTIVE_QUALITY:    true,          // auto-reduce particles if fps drops
  QUALITY_CHECK_EVERY: 120,           // frames between quality assessments
  QUALITY_FPS_LOW:     45,
  QUALITY_FPS_HIGH:    58,
  QUALITY_STEP:        5000,          // particles to shed / restore
});

// ─── Particle Pool ─────────────────────────────────────────────────
export const PARTICLES = Object.freeze({
  DEFAULT_COUNT:    50_000,
  MIN_COUNT:         5_000,
  MAX_COUNT:        80_000,
  // Lifespan range in seconds
  LIFESPAN_MIN:     2.5,
  LIFESPAN_MAX:     7.0,
  // Spawn radius from rift centres (px)
  SPAWN_RADIUS_MIN: 8,
  SPAWN_RADIUS_MAX: 180,
  // Jitter added to initial velocity
  VELOCITY_JITTER:  0.45,
  // How many particles respawn per frame per attractor
  RESPAWN_RATE:     400,
  // Fade-in duration (normalised lifespan fraction)
  FADE_IN_FRAC:     0.08,
  // Fade-out starts at this normalised age
  FADE_OUT_FRAC:    0.72,
  // Base alpha for young particles
  ALPHA_MAX:        0.88,
  // Point size range (px)
  SIZE_MIN:         0.6,
  SIZE_MAX:         2.2,
  // Turbulence amplitude added to curl vector
  TURBULENCE:       0.08,
});

// ─── Simplex Noise ─────────────────────────────────────────────────
export const NOISE = Object.freeze({
  // Spatial scale — lower = larger, smoother features
  SCALE:            0.0025,
  SCALE_MIN:        0.0005,
  SCALE_MAX:        0.008,
  // Temporal drift of the noise volume
  TIME_SCALE:       0.00018,
  // Second noise layer (finer details)
  SCALE2:           0.0068,
  TIME_SCALE2:      0.00030,
  // Blend weight of second layer
  LAYER2_WEIGHT:    0.32,
  // Number of FBM octaves (1 = raw simplex)
  OCTAVES:          3,
  LACUNARITY:       2.05,
  PERSISTENCE:      0.48,
  // Seed offsets for X/Y/Z field components
  SEED_X:           0,
  SEED_Y:           109.731,
  SEED_Z:           219.462,
});

// ─── Curl Calculator ───────────────────────────────────────────────
export const CURL = Object.freeze({
  // Finite-difference step for partial derivatives
  EPSILON:          0.0001,
  // Global scale multiplier applied to final curl vector
  INTENSITY:        1.0,
  INTENSITY_MIN:    0.10,
  INTENSITY_MAX:    4.00,
  // Optional divergence-correction passes (0 = pure curl)
  DIV_CORRECT_ITER: 0,
  // Vortex attractor strength when user tears a rift
  RIFT_STRENGTH:    3.20,
  RIFT_RADIUS:      220,      // px influence radius
  RIFT_FALLOFF:     2.5,      // power of radial falloff
});

// ─── Renderer ──────────────────────────────────────────────────────
export const RENDER = Object.freeze({
  // Trail fade: alpha fraction kept each frame  (lower = longer trails)
  TRAIL_ALPHA:         0.015,
  TRAIL_ALPHA_FAST:    0.055,   // used when trails toggle is off
  // Glow compositing
  GLOW_ENABLED:        true,
  GLOW_BLUR_RADIUS:    3,       // feGaussianBlur stdDeviation equivalent
  GLOW_PASSES:         2,       // off-screen blur iterations
  // Offscreen buffer scale (0.5 = half-res for glow)
  GLOW_BUFFER_SCALE:   0.50,
  // Composite blend of glow layer onto main canvas
  GLOW_ALPHA:          0.62,
  GLOW_COMPOSITE:      "screen",
  // Main composite mode for particle layer
  PARTICLE_COMPOSITE:  "screen",
  // Background clear colour (RGBA)
  BG_R: 0, BG_G: 0, BG_B: 0, BG_A: 255,
});

// ─── Colour Palettes ───────────────────────────────────────────────
// Each palette is an array of RGBA stops [r, g, b, a] mapped to
// normalised particle age [0 → 1].  Renderer interpolates between stops.
export const PALETTES = Object.freeze({
  inferno: [
    [20,   0,   0, 0],
    [140,  10,   0, 180],
    [230,  80,   0, 220],
    [255, 180,  20, 240],
    [255, 240, 180, 180],
    [255, 255, 255, 60],
  ],
  void: [
    [0,   0,   10, 0],
    [40,   0, 120, 160],
    [100,   0, 220, 210],
    [180,  60, 255, 230],
    [220, 160, 255, 160],
    [255, 240, 255, 50],
  ],
  spectral: [
    [0,   0,   0, 0],
    [0,  80,  80, 150],
    [0, 200, 160, 200],
    [60, 255, 210, 230],
    [180, 255, 240, 160],
    [240, 255, 255, 50],
  ],
  blood: [
    [0,   0,   0, 0],
    [80,   0,   0, 170],
    [180,   0,   0, 210],
    [200,  20,  20, 230],
    [220, 100,  60, 160],
    [240, 200, 180, 50],
  ],
  plasma: [
    [0,   0,   0, 0],
    [80,   0, 100, 160],
    [180,   0, 200, 210],
    [255,  60, 255, 230],
    [255, 180, 255, 160],
    [255, 240, 255, 50],
  ],
});
export const DEFAULT_PALETTE = "inferno";

// ─── Input ─────────────────────────────────────────────────────────
export const INPUT = Object.freeze({
  // Maximum simultaneous rift attractors tracked
  MAX_RIFTS:         6,
  // How many frames a rift persists after pointer up
  RIFT_DECAY_FRAMES: 90,
  // Minimum drag distance to register a rift tear (px)
  MIN_DRAG_PX:       12,
  // Scroll wheel zoom sensitivity
  SCROLL_SENSITIVITY: 0.0004,
  // Pinch zoom sensitivity
  PINCH_SENSITIVITY:  0.018,
});

// ─── UI ────────────────────────────────────────────────────────────
export const UI = Object.freeze({
  // How long the loading screen stays (ms) after engine is ready
  LOADING_LINGER_MS: 600,
  // Performance HUD opacity when idle
  HUD_IDLE_OPACITY:  0.65,
  // FPS graph history samples
  FPS_GRAPH_SAMPLES: 120,
});

// ─── Debug ─────────────────────────────────────────────────────────
export const DEBUG = Object.freeze({
  ENABLED:           false,
  DRAW_FIELD_LINES:  false,
  FIELD_LINE_STEP:   40,      // px between field-line seed points
  LOG_SPAWNS:        false,
});
