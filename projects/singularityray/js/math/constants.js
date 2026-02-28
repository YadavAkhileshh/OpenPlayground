/**
 * SingularityRay JS - Math - Constants
 * Mathematical, Physical, and Rendering constants for the engine.
 */

// Math limits
export const EPSILON = 0.000001;
export const PI = Math.PI;
export const TWO_PI = Math.PI * 2.0;
export const HALF_PI = Math.PI * 0.5;

// Physics approximations (dimensionless for aesthetics)
export const G_CONST = 1.0;          // Base gravitational constant
export const C_SPEED = 1.0;          // Speed of light used in metric formulation
export const Schwarzschild_R = 1.0;  // Base radius mapped to slider M=1.0

// Rendering constants
export const MAX_MARCH_STEPS = 150;     // Fallback if slider doesn't load
export const MAX_RAY_DIST = 100.0;      // Horizon/infinity cutoff
export const MIN_SURF_DIST = 0.01;      // Collision tolerance

// Screen space configuration
export const FIELD_OF_VIEW = 75.0 * (PI / 180.0); // 75 deg FOV
export const SUB_PIXELS = 1;            // Anti-aliasing sample count (1 = off for performance)

// Space Distortion parameters
export const LENSING_STRENGTH = 1.5;    // Multiplier for ray bending calculations
export const EVENT_HORIZON_ABSORPTION = 1.0;
export const PHOTON_SPHERE_R = 1.5 * Schwarzschild_R; // Radius where light orbits spherically
export const ISCO_R = 3.0 * Schwarzschild_R;          // Innermost Stable Circular Orbit
