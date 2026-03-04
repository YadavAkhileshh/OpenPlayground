/**
 * Preset configurations for the Gray-Scott simulation.
 * Different feed (f) and kill (k) rates produce different patterns.
 * @module UI/Presets
 */

export const PRESETS = {
    default: { f: 0.0545, k: 0.0620, name: "Default" },
    solitons: { f: 0.030, k: 0.0620, name: "Solitons" },
    pulsating: { f: 0.025, k: 0.060, name: "Pulsating Solitons" },
    worms: { f: 0.078, k: 0.061, name: "Worms" },
    mazes: { f: 0.029, k: 0.057, name: "Mazes" },
    holes: { f: 0.039, k: 0.058, name: "Holes" },
    cells: { f: 0.030, k: 0.056, name: "Cells" },
    chaos: { f: 0.026, k: 0.051, name: "Chaos" },
    u_skate: { f: 0.062, k: 0.061, name: "U-Skate World" },
    fingerprints: { f: 0.030, k: 0.052, name: "Fingerprints" },
    spots_and_loops: { f: 0.038, k: 0.061, name: "Spots & Loops" },
    moving_spots: { f: 0.014, k: 0.054, name: "Moving Spots" },
    waves: { f: 0.025, k: 0.050, name: "Waves" },
    coral: { f: 0.058, k: 0.063, name: "Brain Coral" },
    mitosis: { f: 0.0367, k: 0.0649, name: "Mitosis" }
};

