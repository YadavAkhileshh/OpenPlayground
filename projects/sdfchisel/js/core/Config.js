/**
 * Config.js – Global configuration constants for the SDFChisel simulation.
 */
const Config = (() => {
    'use strict';
    return {
        CANVAS: { BG_COLOR: '#0a0a0c', PARTICLE_BASE_RADIUS: 1.4 },
        LOOP: { MAX_DT_MS: 50, STATS_INTERVAL: 10 },
        UI: { DEFAULT_TEXT: 'SDF', MAX_TEXT_LEN: 6 },
        SDF: { FONT_FAMILY: 'Inter, sans-serif', FONT_WEIGHT: 800, FONT_SIZE: 300, GRID_CELLS: 180, SMOOTHING_PASSES: 2 },
        GRADIENT: { H: 2, ARROW_SCALE: 16, ARROW_MIN_MAG: 0.05, FIELD_STEP: 20 },
        PARTICLE: { COUNT: 5000, MAX_COUNT: 25000, COLLISION_RADIUS: 3.0, CONVERGENCE_SPEED: 1.2, MAX_VELOCITY: 8.0, DAMPING: 0.92, SCATTER_RADIUS: 0.45, SCATTER_FORCE: 25.0, BUILD_ITER: 20, CONVERGED_THRESH: 0.8, TRAIL_STRENGTH: 0.85 },
        SPATIAL: { CELL_SIZE_MULT: 2.0 }
    };
})();
window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.Config = Config;
