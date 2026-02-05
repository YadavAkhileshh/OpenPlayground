/**
 * @file VisualFX.js
 * @description Advanced visual effects system for MirrorASCII.
 * 
 * Performance Optimized: Uses Typed Arrays (Float32Array) for frame buffers
 * to minimize GC pressure and memory overhead during high-frequency updates.
 */

class VisualFX {
    /**
     * Initializes the effects engine.
     */
    constructor() {
        this.ghostingAlpha = 0.0;
        this.glitchIntensity = 0.0;

        /** 
         * Previous brightness buffer.
         * @type {Float32Array|null} 
         */
        this.prevBrightness = null;

        /** 
         * Previous color buffer (stored as flattened RGB values).
         * @type {Uint8ClampedArray|null} 
         */
        this.prevColors = null;

        this.timePhase = 0;
        console.log('[VisualFX] Optimized effects engine initialized.');
    }

    /**
     * Applies enabled effects to the frame data.
     * @param {Array<{brightness: number, color: string}>} frameData Raw data from Processor.
     * @param {number} cols Grid columns.
     * @param {number} rows Grid rows.
     * @returns {Array<{brightness: number, color: string}>} Processed data.
     */
    apply(frameData, cols, rows) {
        if (!frameData) return null;

        const size = cols * rows;
        this.timePhase += 0.01;

        // Ensure buffers match current grid size
        if (!this.prevBrightness || this.prevBrightness.length !== size) {
            this.prevBrightness = new Float32Array(size);
            this.prevColors = new Uint8ClampedArray(size * 3);
        }

        // 1. Apply Ghosting and Update Buffers
        const processed = [];
        for (let i = 0; i < size; i++) {
            const cell = frameData[i];
            let b = cell.brightness;

            // Ghosting logic
            if (this.ghostingAlpha > 0) {
                b = b * (1 - this.ghostingAlpha) + this.prevBrightness[i] * this.ghostingAlpha;
            }

            // Save for next frame
            this.prevBrightness[i] = b;

            // Extract RGB from color string "rgb(r,g,b)" for storage
            // This is a bit slow due to string parsing, but better than full JSON clone
            const match = cell.color.match(/\d+/g);
            if (match) {
                this.prevColors[i * 3] = parseInt(match[0]);
                this.prevColors[i * 3 + 1] = parseInt(match[1]);
                this.prevColors[i * 3 + 2] = parseInt(match[2]);
            }

            processed.push({
                brightness: b,
                color: cell.color
            });
        }

        // 2. Glitch Effects (on the array itself)
        this._applyGlitchInPlace(processed, cols, rows);

        return processed;
    }

    /**
     * Randomly shifts rows in place.
     */
    _applyGlitchInPlace(data, cols, rows) {
        if (this.glitchIntensity <= 0 || Math.random() > 0.1 * this.glitchIntensity) return;

        const numGlitchedRows = Math.floor(Math.random() * 8 * this.glitchIntensity);

        for (let i = 0; i < numGlitchedRows; i++) {
            const row = Math.floor(Math.random() * rows);
            const offset = Math.floor((Math.random() - 0.5) * 15 * this.glitchIntensity);
            const startIndex = row * cols;

            // Temporary copy of the row
            const rowCopy = data.slice(startIndex, startIndex + cols);

            for (let c = 0; c < cols; c++) {
                const targetIdx = (c + offset + cols) % cols;
                data[startIndex + targetIdx] = rowCopy[c];
            }
        }
    }

    setGhosting(strength) {
        this.ghostingAlpha = Math.max(0, Math.min(0.95, strength));
    }

    setGlitch(intensity) {
        this.glitchIntensity = Math.max(0, Math.min(1, intensity));
    }
}

window.VisualFX = VisualFX;
