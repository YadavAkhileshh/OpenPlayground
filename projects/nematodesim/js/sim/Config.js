// NematodeSim — Global Configuration
// Central source of truth for all tunable simulation parameters.
// Changing values here propagates through the entire system.

export const Config = {

  // ── Simulation Timing ─────────────────────────────────────────────────────
  TARGET_FPS        : 60,
  SUB_STEPS         : 4,           // Physics sub-steps per render frame
  DT                : 1 / 60,     // Fixed timestep (seconds)

  // ── World ─────────────────────────────────────────────────────────────────
  WORLD_PADDING     : 45,          // Px from canvas edge before wrapping

  // ── Organism Population ───────────────────────────────────────────────────
  ORGANISM_COUNT    : 6,           // Number of nematodes in the tank
  SEGMENT_COUNT     : 18,          // Node chain length per organism
  SEGMENT_LENGTH    : 13,          // Rest-length of each body segment (px)

  // ── Body Radii (used by spline renderer) ──────────────────────────────────
  RADIUS_HEAD       : 5.0,
  RADIUS_MID        : 6.8,
  RADIUS_TAIL       : 1.4,

  // ── Verlet Integration ────────────────────────────────────────────────────
  CONSTRAINT_ITERS  : 8,           // Jacobi iteration count per sub-step
  DAMPING           : 0.972,       // Positional damping applied each step
  NODE_MASS         : 1.0,         // Default node mass (kg, arbitrary units)
  ANGLE_STIFFNESS   : 0.18,        // Angle constraint stiffness [0-1]
  DIST_STIFFNESS    : 1.0,         // Distance constraint stiffness [0-1]

  // ── Anisotropic Stokes Drag ───────────────────────────────────────────────
  VISCOSITY_DEFAULT : 0.30,        // Normalized fluid viscosity [0-1]
  VISCOSITY_MIN     : 0.04,
  VISCOSITY_MAX     : 0.96,
  DRAG_TANGENTIAL   : 1.0,         // γ_t  — along-body drag coefficient
  DRAG_NORMAL       : 2.0,         // γ_n  — transverse drag (≈2γ_t slender body)

  // ── CPG / Neuromuscular Oscillator ────────────────────────────────────────
  FREQUENCY_DEFAULT : 1.4,         // Body-wave frequency (Hz)
  FREQUENCY_MIN     : 0.15,
  FREQUENCY_MAX     : 4.5,
  WAVE_AMPLITUDE    : 365,         // Peak lateral muscle force (N, arb)
  PHASE_SHIFT       : Math.PI / 3.5, // Phase lag between consecutive segments

  // ── Rendering ─────────────────────────────────────────────────────────────
  BG_COLOR          : '#020d0b',
  GLOW_BLUR         : 14,
  DRAG_ARROW_COLOR  : '#ff5533',
  HUD_COLOR         : '#33cc99',
  GRID_ALPHA        : 0.045,
  GRID_CELL         : 60,

  // ── Organism palette (6 colours for 6 organisms) ─────────────────────────
  ORGANISM_COLORS   : [
    '#22ffd8', '#00e6c0', '#18ffb4',
    '#00cca3', '#11f0c8', '#33ffdf',
  ],

  // ── Stability Guards ──────────────────────────────────────────────────────
  MAX_SPEED_LIMIT   : 88,          // Clamp node velocity (px/s)
  MAX_FORCE_LIMIT   : 230,         // Clamp force magnitude per node
  NAN_RESET_INTERVAL: 48,          // Frames between NaN/Inf scans

};

export default Config;
