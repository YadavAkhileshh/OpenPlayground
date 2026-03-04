/**
 * BreathingSpace - Configuration
 * 
 * Central repository for all adjustable constants and settings.
 * Designed to be easily modified for different meditation experiences.
 * 
 * ARCHITECTURAL OVERVIEW:
 * 1. TIMING: Controls the speed and duration of the breathing cycle.
 * 2. SPACING: Defines the physical boundaries (margins/padding) of the layout.
 * 3. THEMES: Manages the visual aesthetic (colors, glows, accents).
 * 4. EASING: Specialized mathematical functions for organic movement.
 */

const CONFIG = {
  // --- Timing Parameters ---
  // The base duration represents one full breath (Inhale + Exhale).
  // Measured in milliseconds.
  DEFAULT_BREATH_DURATION: 6000,

  // Speed constraints for the UI sliders
  MIN_SPEED: 0.1,
  MAX_SPEED: 2.5,

  // --- Spacing Parameters (Base values in pixels/rem) ---
  // These values define how much the 'breath-unit' sections expand.
  SPACING: {
    MIN_GAP_REM: 1.5,      // The target margin when fully exhaled
    MAX_GAP_REM: 5.5,      // The target margin when fully inhaled
    MIN_PADDING_REM: 2.0,  // The target padding when fully exhaled
    MAX_PADDING_REM: 7.0,  // The target padding when fully inhaled

    // Growth factors for specific screen sizes (Responsive logic)
    MOBILE_SCALAR: 0.6,
    TABLET_SCALAR: 0.8,
    DESKTOP_SCALAR: 1.0
  },

  // --- Visual & Aesthetic Parameters ---
  // Each theme defines the 'vibe' of the meditation space.
  THEMES: {
    DARK: {
      id: 'midnight-drift',
      name: 'Midnight Drift',
      primary: '#0a0a0c',
      secondary: '#121216',
      accent: '#6366f1',
      text: '#e0e0e6',
      dim: '#94949e',
      glowIntensity: 0.15
    },
    LIGHT: {
      id: 'dawn-clarity',
      name: 'Dawn Clarity',
      primary: '#f5f5f7',
      secondary: '#ffffff',
      accent: '#3b82f6',
      text: '#1d1d1f',
      dim: '#86868b',
      glowIntensity: 0.1
    },
    ZEN: {
      id: 'zen-garden',
      name: 'Zen Garden',
      primary: '#1a1c1a',
      secondary: '#232623',
      accent: '#10b981',
      text: '#d1d5db',
      dim: '#9ca3af',
      glowIntensity: 0.2
    }
  },

  // --- Easing Configuration ---
  // We use standard easing curves to simulate the non-linear 
  // nature of human breathing (faster in the middle, slower at the peaks).
  EASING: {
    SINE_IN_OUT: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
    QUAD_IN_OUT: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    CUBIC_IN_OUT: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
  },

  // --- Animation States ---
  STATES: {
    INHALE: 'inhale',
    EXHALE: 'exhale',
    PAUSE: 'pause'
  },

  // --- System Metadata ---
  METADATA: {
    VERSION: '1.0.0',
    BUILD_DATE: '2026-02-03',
    PROJECT: 'BreathingSpace',
    ENGINE: 'Rhythmic-Layout-v1',
    DEVELOPER: 'Antigravity AI',
    CONSTRAINTS: {
      MIN_LINES: 1500,
      MAX_LINES: 1800,
      FRAMEWORKS: 'None / Vanilla JS only'
    }
  }
};

/**
 * Freeze the configuration to prevent runtime mutations.
 * This ensures the application remains deterministic.
 */
function deeplyFreeze(obj) {
  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach(prop => {
    if (obj.hasOwnProperty(prop) &&
      obj[prop] !== null &&
      (typeof obj[prop] === "object" || typeof obj[prop] === "function") &&
      !Object.isFrozen(obj[prop])) {
      deeplyFreeze(obj[prop]);
    }
  });
  return obj;
}

deeplyFreeze(CONFIG);

console.log("Configuration Layer: Successfully initialized and frozen.");

