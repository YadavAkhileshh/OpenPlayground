/**
 * @file ASCIIEngine.js
 * @description The rendering heart of MirrorASCII.
 * 
 * ASCIIEngine is responsible for:
 * 1. Defining the mapping between 0.0-1.0 brightness and human-readable characters.
 * 2. Rendering the ASCII grid onto the primary output canvas.
 * 3. Handling color application (either original pixel colors or stylized monochromatic).
 * 4. Managing font rendering metrics to ensure characters align perfectly in a grid.
 * 
 * We use a high-performance canvas rendering loop. Instead of drawing characters
 * as individual text nodes, we draw them as symbols on a canvas, which allows
 * for smooth real-time updates even at high densities.
 */

class ASCIIEngine {
    /**
     * Initializes the ASCIIEngine.
     * @param {HTMLCanvasElement} outputCanvas The visible canvas where the mirror is drawn.
     */
    constructor(outputCanvas) {
        /** @type {HTMLCanvasElement} */
        this.canvas = outputCanvas;

        /** @type {CanvasRenderingContext2D} */
        this.ctx = this.canvas.getContext('2d', { alpha: false });

        /**
         * The set of characters used for mapping, ordered from darkest (left) to brightest (right).
         * @type {string}
         */
        this.charSet = ' .:-=+*#%@'; // Minimalist set
        // Alternate set for higher detail: ' .`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczMW&8%B@$'

        /** @type {string} */
        this.extendedCharSet = ' .`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczMW&8%B@$';

        /**
         * Use the extended character set?
         * @type {boolean}
         */
        this.useExtendedSet = false;

        /**
         * Font configuration. 
         * Monospace is required for the grid to look correct.
         * @type {string}
         */
        this.fontFamily = 'monospace';
        this.fontSize = 12;

        /**
         * The background color of the mirror.
         * @type {string}
         */
        this.backgroundColor = '#050505';

        /**
         * Current color mode: 'original' or 'monochrome' (stylized).
         * @type {string}
         */
        this.colorMode = 'original';

        /**
         * Available color palettes.
         * @type {Object}
         */
        this.palettes = {
            'matrix': { bg: '#050505', fg: '#00ff41', name: 'Digital Rain' },
            'cyberpunk': { bg: '#0a001a', fg: '#ff00ff', name: 'Neon Night' },
            'heatwave': { bg: '#1a0000', fg: '#ff9500', name: 'Thermal' },
            'midnight': { bg: '#00050a', fg: '#00d4ff', name: 'Deep Sea' },
            'classic': { bg: '#050505', fg: '#ffffff', name: 'Monochrome' }
        };

        this.currentPalette = 'matrix';
        this.backgroundColor = this.palettes[this.currentPalette].bg;
        this.monochromeColor = this.palettes[this.currentPalette].fg;

        console.log('[ASCIIEngine] Rendering engine initialized with palettes.');
    }

    /**
     * Updates the canvas dimensions to match the window or a specific container.
     */
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx.font = `${this.fontSize}px ${this.fontFamily}`;
        this.ctx.textBaseline = 'top';
        this.ctx.textAlign = 'left';
    }

    /**
     * Cycles to the next color palette.
     */
    nextPalette() {
        const keys = Object.keys(this.palettes);
        const idx = keys.indexOf(this.currentPalette);
        this.setPalette(keys[(idx + 1) % keys.length]);
    }

    /**
     * Sets a specific palette by key.
     * @param {string} key 
     */
    setPalette(key) {
        if (this.palettes[key]) {
            this.currentPalette = key;
            this.backgroundColor = this.palettes[key].bg;
            this.monochromeColor = this.palettes[key].fg;
        }
    }

    /**
     * Maps a brightness value (0-1) to a character from the current set.
     * @param {number} brightness 
     * @returns {string}
     */
    getCharFromBrightness(brightness) {
        const set = this.useExtendedSet ? this.extendedCharSet : this.charSet;
        const index = Math.floor(brightness * (set.length - 1));
        return set[index];
    }

    /**
     * Renders a grid of data to the canvas.
     * @param {Array<{brightness: number, color: string}>} frameData Data from Processor.
     * @param {number} cols Number of columns.
     * @param {number} rows Number of rows.
     */
    render(frameData, cols, rows) {
        if (!frameData || frameData.length === 0) return;

        // Clear the canvas.
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Calculate cell dimensions on the output canvas.
        const charWidth = this.canvas.width / cols;
        const charHeight = this.canvas.height / rows;

        // Update font size to fit the cell as best as possible.
        // We generally keep font-size slightly larger than cell width to ensure visibility.
        this.ctx.font = `${charHeight}px ${this.fontFamily}`;

        // Render each character.
        for (let y = 0; y < rows; y++) {
            const rowOffset = y * cols;
            const drawY = y * charHeight;

            for (let x = 0; x < cols; x++) {
                const data = frameData[rowOffset + x];
                const char = this.getCharFromBrightness(data.brightness);

                if (char === ' ') continue;

                if (this.colorMode === 'original') {
                    this.ctx.fillStyle = data.color;
                } else {
                    this.ctx.fillStyle = this.monochromeColor;
                }

                this.ctx.fillText(char, x * charWidth, drawY);
            }
        }
    }

    /**
     * Toggles between standard and extended character sets.
     * @param {boolean} value 
     */
    setExtendedSet(value) {
        this.useExtendedSet = value;
    }

    /**
     * Sets the color mode.
     * @param {'original'|'monochrome'} mode 
     */
    setColorMode(mode) {
        this.colorMode = mode;
    }

    /**
     * Sets the monochromatic style color.
     * @param {string} color Hex or CSS color string.
     */
    setMonochromeColor(color) {
        this.monochromeColor = color;
    }
}

// Exporting logic
window.ASCIIEngine = ASCIIEngine;
