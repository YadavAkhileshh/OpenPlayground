/**
 * Renderer for the simulation.
 * 
 * The renderer is responsible for converting the abstract chemical concentrations (gridA, gridB)
 * into a visual representation on the HTML canvas.
 * 
 * Optimization Strategy:
 * 1. Pixel Manipulation: We use `ImageData` and access the `Uint32Array` buffer directly.
 *    This allows us to set pixel colors using a single 32-bit integer assignment (ABGR format),
 *    which is significantly faster than setting R, G, B, A channels individually.
 * 
 * 2. Color Lookup Table (LUT): Calculating color gradients for every pixel, every frame
 *    using linear interpolation is expensive. Instead, we pre-calculate a 1024-step
 *    gradient map once (or whenever the palette changes) and store it in a `Uint32Array` LUT.
 *    During rendering, we simply map the chemical concentration to an index (0-1023) and look up the color.
 * 
 * @module Renderer/Renderer
 */

import { PALETTES } from './palettes.js';
import { mapRange, clamp } from '../utils/math.js';

export class Renderer {
    /**
     * Creates a new Renderer.
     * @param {CanvasManager} canvasManager - The manager handling the canvas element.
     * @param {number} simulationWidth - Width of the simulation grid.
     * @param {number} simulationHeight - Height of the simulation grid.
     */
    constructor(canvasManager, simulationWidth, simulationHeight) {
        this.canvasManager = canvasManager;
        this.width = simulationWidth;
        this.height = simulationHeight;

        // Get the ImageData object from the canvas manager.
        // This is a 1D array of RGBA values (0-255).
        this.imageData = canvasManager.getImageData();

        // Create a 32-bit view of the image data buffer.
        // This allows us to write one pixel in a single operation.
        // Note: Canvas pixel format is usually Little Endian (ABGR) on most systems.
        this.buf32 = new Uint32Array(this.imageData.data.buffer);

        // Initialize the Color Lookup Table (LUT).
        // 1024 distinct color steps provides smooth enough gradients for the eye.
        this.colorLUT = new Uint32Array(1024);
        this.setPalette('default');
    }

    /**
     * Sets the active color palette and regenerates the LUT.
     * @param {string} paletteName - Key of the palette in the PALETTES object.
     */
    setPalette(paletteName) {
        const palette = PALETTES[paletteName] || PALETTES['default'];
        this.generateLUT(palette.stops);
    }

    /**
     * Generates a linear gradient lookup table from a list of color stops.
     * @param {Array} stops - Array of objects {pos: 0-1, r, g, b}.
     */
    generateLUT(stops) {
        // We want to fill the LUT (length 1024) with interpolated colors.
        for (let i = 0; i < 1024; i++) {
            // t is the normalized position [0, 1] in the gradient.
            const t = i / 1023;

            // Find which two color stops 't' currently falls between.
            let start = stops[0];
            let end = stops[stops.length - 1];

            for (let j = 0; j < stops.length - 1; j++) {
                if (t >= stops[j].pos && t <= stops[j + 1].pos) {
                    start = stops[j];
                    end = stops[j + 1];
                    break;
                }
            }

            // Calculate 'localT': how far are we between 'start' and 'end'?
            const range = end.pos - start.pos;
            const localT = range === 0 ? 0 : (t - start.pos) / range;

            // Interpolate R, G, B channels
            const r = Math.floor(start.r + (end.r - start.r) * localT);
            const g = Math.floor(start.g + (end.g - start.g) * localT);
            const b = Math.floor(start.b + (end.b - start.b) * localT);

            // Pack into 32-bit integer (Alpha | Blue | Green | Red)
            // Alpha is always 255 (fully opaque)
            this.colorLUT[i] = (255 << 24) | (b << 16) | (g << 8) | r;
        }
    }

    /**
     * Renders the simulation state to the canvas.
     * @param {SimulationEngine} simulation 
     */
    render(simulation) {
        const gridA = simulation.gridA;
        const gridB = simulation.gridB;
        const length = simulation.size;
        const buf32 = this.buf32;
        const lut = this.colorLUT;

        // B is the "activator" or the interesting chemical usually visualized
        // Typical visualization is looking at B, or A-B
        // Here we visualize concentration of B for simpler effect, or B-A

        let j = 0;
        for (let i = 0; i < length; i++) {
            const a = gridA[i];
            const b = gridB[i];

            // Value for visualization
            // Common formula: clamp((b - a) * someScale + offset)
            // Or just visualizing B. 
            // Let's try visualizing B normalized roughly.
            // B usually stays small, like 0.2-0.4 in patterns.

            let val = (a - b);

            // Map val to 0-1023
            // a-b range is approx -0.3 to 1.0

            let idx = Math.floor((1.0 - val) * 1023);
            if (idx < 0) idx = 0;
            if (idx > 1023) idx = 1023;

            buf32[i] = lut[idx];
        }

        this.canvasManager.putImageData(this.imageData);
    }
}
