/**
 * Color palettes for the renderer.
 * Each palette is a function that takes a value (0-1) and returns an RGB object or numeric array.
 * For performance, we might pre-calculate these into lookup tables in the renderer.
 * @module Renderer/Palettes
 */

export const PALETTES = {
    default: {
        name: "Default",
        stops: [
            { pos: 0.0, r: 0, g: 0, b: 0 },
            { pos: 0.2, r: 0, g: 0, b: 0 },
            { pos: 0.21, r: 0, g: 100, b: 0 },
            { pos: 0.4, r: 200, g: 200, b: 0 },
            { pos: 0.6, r: 255, g: 255, b: 255 }
        ]
    },
    thermal: {
        name: "Thermal",
        stops: [
            { pos: 0.0, r: 0, g: 0, b: 0 },
            { pos: 0.3, r: 0, g: 0, b: 255 },
            { pos: 0.6, r: 255, g: 255, b: 0 },
            { pos: 0.9, r: 255, g: 0, b: 0 }
        ]
    },
    biological: {
        name: "Biological",
        stops: [
            { pos: 0.0, r: 10, g: 20, b: 30 },
            { pos: 0.3, r: 40, g: 80, b: 100 },
            { pos: 0.6, r: 100, g: 200, b: 150 },
            { pos: 1.0, r: 220, g: 255, b: 220 }
        ]
    },
    spectral: {
        name: "Spectral",
        stops: [
            { pos: 0.0, r: 0, g: 0, b: 0 },
            { pos: 0.2, r: 148, g: 0, b: 211 },
            { pos: 0.4, r: 75, g: 0, b: 130 },
            { pos: 0.6, r: 0, g: 0, b: 255 },
            { pos: 0.8, r: 0, g: 255, b: 0 },
            { pos: 0.9, r: 255, g: 255, b: 0 },
            { pos: 1.0, r: 255, g: 0, b: 0 }
        ]
    },
    mono: {
        name: "Monochrome",
        stops: [
            { pos: 0.0, r: 0, g: 0, b: 0 },
            { pos: 1.0, r: 255, g: 255, b: 255 }
        ]
    }
};
