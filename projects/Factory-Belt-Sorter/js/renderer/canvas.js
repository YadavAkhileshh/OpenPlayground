/**
 * Renderer
 * Handles drawing the Grid state to the HTML Canvas.
 */

import { Colors, Config } from '../core/config.js';

/**
 * Canvas Renderer
 * 
 * Renders the state of the Grid to an HTML5 Canvas element.
 * uses direct 32-bit integer manipulation of the ImageData buffer 
 * for maximum performance (approaching 60 FPS at >1080p resolutions).
 * 
 * Converts Material IDs and Meta data into RGBA colors.
 */
export class Renderer {
    constructor(canvas, grid) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false }); // optimization
        this.grid = grid;

        this.width = canvas.width;
        this.height = canvas.height;

        // ImageData buffer
        this.imageData = this.ctx.createImageData(this.width, this.height);

        // Create a 32-bit view for fast pixel manipulation
        this.buf32 = new Uint32Array(this.imageData.data.buffer);
    }

    draw() {
        const size = this.grid.size;
        const cells = this.grid.cells;
        const meta = this.grid.meta; // for color variations

        // Clear buffer is implicit if we overwrite everything, 
        // but since we have "empty" cells we need to clear or draw black
        // Faster to just fill black once if needed? 
        // Actually, just iterating and setting color is fine.

        for (let i = 0; i < this.grid.size; i++) {
            const type = cells[i];
            if (type !== Config.MATERIALS.EMPTY) {
                let color = Colors[type];

                // Add some variation based on meta or position noise
                if (type === Config.MATERIALS.FIRE) {
                    // Simple variation: slightly darken
                    if (Math.random() > 0.8) this.buf32[i] = 0xFF00AAFF; // brighter
                    else this.buf32[i] = color;
                } else if (type === Config.MATERIALS.WATER) {
                    if (meta[i] % 2 === 0) this.buf32[i] = color;
                    else this.buf32[i] = 0xFFE17951; // slightly lighter
                } else if (type === Config.MATERIALS.DISCO) {
                    const hue = (meta[i] * 2 + this.grid.frameCount) % 360;
                    this.buf32[i] = this.hslToInt(hue, 100, 50);
                } else {
                    this.buf32[i] = color;
                }
            }
        }

        this.ctx.putImageData(this.imageData, 0, 0);
    }

    // Helper to convert HSL to ABGR integer (little-endian RGBA)
    hslToInt(h, s, l) {
        s /= 100;
        l /= 100;
        let c = (1 - Math.abs(2 * l - 1)) * s,
            x = c * (1 - Math.abs((h / 60) % 2 - 1)),
            m = l - c / 2,
            r = 0,
            g = 0,
            b = 0;

        if (0 <= h && h < 60) {
            r = c; g = x; b = 0;
        } else if (60 <= h && h < 120) {
            r = x; g = c; b = 0;
        } else if (120 <= h && h < 180) {
            r = 0; g = c; b = x;
        } else if (180 <= h && h < 240) {
            r = 0; g = x; b = c;
        } else if (240 <= h && h < 300) {
            r = x; g = 0; b = c;
        } else if (300 <= h && h < 360) {
            r = c; g = 0; b = x;
        }
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        // ABGR for Uint32 Little Endian
        return (255 << 24) | (b << 16) | (g << 8) | r;
    }
}