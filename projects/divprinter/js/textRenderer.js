/**
 * ================================================
 * TextRenderer.js - Core Rendering Engine
 * ================================================
 * 
 * Handles text-to-pixel conversion, DOM batching, letter spacing,
 * and alignment logic. This is the computational heart of DivPrinter.
 * 
 * Key responsibilities:
 * - Convert text strings to pixel coordinates
 * - Batch DOM operations for performance
 * - Calculate letter spacing and word positioning
 * - Apply density filters
 * - Manage color modes
 */

class TextRenderer {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.pixels = [];
        this.settings = {
            fontSize: 3,
            density: 100,
            letterSpacing: 2,
            primaryColor: '#00ff88',
            secondaryColor: '#ff0088',
            colorMode: 'solid'
        };
    }

    /**
     * Main render method - converts text to pixels and renders them
     * @param {string} text - The text to render
     * @param {Object} settings - Rendering settings
     * @returns {Object} Rendering statistics
     */
    render(text, settings = {}) {
        const startTime = performance.now();
        
        // Update settings
        this.updateSettings(settings);
        
        // Clear existing pixels
        this.clearCanvas();
        
        // Convert text to pixel data
        const pixelData = this.textToPixels(text);
        
        // Apply density filter
        const filteredPixels = this.applyDensity(pixelData);
        
        // Create DOM elements (batched)
        this.createPixelElements(filteredPixels);
        
        const endTime = performance.now();
        const renderTime = Math.round(endTime - startTime);
        
        return {
            pixelCount: filteredPixels.length,
            renderTime: renderTime,
            charCount: text.length
        };
    }

    /**
     * Update renderer settings
     * @param {Object} settings - New settings to apply
     */
    updateSettings(settings) {
        this.settings = { ...this.settings, ...settings };
    }

    /**
     * Convert text string to pixel coordinates
     * @param {string} text - Input text
     * @returns {Array} Array of pixel objects with x, y, color
     */
    textToPixels(text) {
        const pixels = [];
        const lines = text.split('\n');
        let globalY = 0;

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            const linePixels = this.processLine(line, globalY);
            pixels.push(...linePixels);
            globalY += (FontData.CHAR_HEIGHT + 2) * this.settings.fontSize;
        }

        return pixels;
    }

    /**
     * Process a single line of text
     * @param {string} line - Line of text
     * @param {number} startY - Starting Y coordinate
     * @returns {Array} Array of pixel objects
     */
    processLine(line, startY) {
        const pixels = [];
        let currentX = 0;

        // Calculate total width for centering
        const totalWidth = this.calculateLineWidth(line);
        const centerOffset = -totalWidth / 2;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const charPixels = FontData.getChar(char);
            
            // Convert character pixels to world coordinates
            for (let j = 0; j < charPixels.length; j++) {
                const [localX, localY] = charPixels[j];
                
                const worldX = (currentX + localX) * this.settings.fontSize + centerOffset;
                const worldY = (startY + localY) * this.settings.fontSize;
                
                pixels.push({
                    x: worldX,
                    y: worldY,
                    charIndex: i,
                    pixelIndex: j,
                    char: char
                });
            }
            
            // Advance X position
            currentX += FontData.CHAR_WIDTH + this.settings.letterSpacing;
        }

        return pixels;
    }

    /**
     * Calculate the width of a line in pixels
     * @param {string} line - Line of text
     * @returns {number} Width in pixels
     */
    calculateLineWidth(line) {
        if (line.length === 0) return 0;
        
        const charWidth = FontData.CHAR_WIDTH * this.settings.fontSize;
        const spacing = this.settings.letterSpacing * this.settings.fontSize;
        
        return (line.length * charWidth) + ((line.length - 1) * spacing);
    }

    /**
     * Apply density filter to reduce pixel count
     * @param {Array} pixels - Full pixel array
     * @returns {Array} Filtered pixel array
     */
    applyDensity(pixels) {
        if (this.settings.density >= 100) {
            return pixels;
        }

        const filtered = [];
        const densityRatio = this.settings.density / 100;

        for (let i = 0; i < pixels.length; i++) {
            if (Math.random() < densityRatio) {
                filtered.push(pixels[i]);
            }
        }

        return filtered;
    }

    /**
     * Create DOM elements for pixels (batched for performance)
     * @param {Array} pixels - Pixel data array
     */
    createPixelElements(pixels) {
        const fragment = document.createDocumentFragment();
        this.pixels = [];

        for (let i = 0; i < pixels.length; i++) {
            const pixel = pixels[i];
            const div = this.createPixelDiv(pixel, i, pixels.length);
            fragment.appendChild(div);
            this.pixels.push(div);
        }

        this.canvas.appendChild(fragment);
    }

    /**
     * Create a single pixel div element
     * @param {Object} pixel - Pixel data
     * @param {number} index - Pixel index
     * @param {number} total - Total pixel count
     * @returns {HTMLElement} Pixel div element
     */
    createPixelDiv(pixel, index, total) {
        const div = document.createElement('div');
        div.className = 'pixel';
        
        // Position
        div.style.left = `${pixel.x}px`;
        div.style.top = `${pixel.y}px`;
        
        // Size
        div.style.width = `${this.settings.fontSize}px`;
        div.style.height = `${this.settings.fontSize}px`;
        
        // Color
        const color = this.calculatePixelColor(pixel, index, total);
        div.style.backgroundColor = color;
        
        // Store metadata
        div.dataset.x = pixel.x;
        div.dataset.y = pixel.y;
        div.dataset.index = index;
        div.dataset.char = pixel.char;
        
        return div;
    }

    /**
     * Calculate color for a pixel based on color mode
     * @param {Object} pixel - Pixel data
     * @param {number} index - Pixel index
     * @param {number} total - Total pixel count
     * @returns {string} Color string
     */
    calculatePixelColor(pixel, index, total) {
        const mode = this.settings.colorMode;
        const primary = this.settings.primaryColor;
        const secondary = this.settings.secondaryColor;

        switch (mode) {
            case 'solid':
                return primary;

            case 'gradient':
                return this.interpolateColor(primary, secondary, index / total);

            case 'rainbow':
                const hue = (index / total) * 360;
                return `hsl(${hue}, 100%, 50%)`;

            case 'random':
                return this.randomColor();

            case 'pulse':
                return primary; // Animation handled by CSS

            default:
                return primary;
        }
    }

    /**
     * Interpolate between two colors
     * @param {string} color1 - Start color (hex)
     * @param {string} color2 - End color (hex)
     * @param {number} factor - Interpolation factor (0-1)
     * @returns {string} Interpolated color
     */
    interpolateColor(color1, color2, factor) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);
        
        const r = Math.round(c1.r + (c2.r - c1.r) * factor);
        const g = Math.round(c1.g + (c2.g - c1.g) * factor);
        const b = Math.round(c1.b + (c2.b - c1.b) * factor);
        
        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * Convert hex color to RGB
     * @param {string} hex - Hex color string
     * @returns {Object} RGB object
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 255, b: 136 };
    }

    /**
     * Generate a random color
     * @returns {string} Random color string
     */
    randomColor() {
        const hue = Math.floor(Math.random() * 360);
        const saturation = 70 + Math.floor(Math.random() * 30);
        const lightness = 50 + Math.floor(Math.random() * 20);
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    /**
     * Clear all pixels from canvas
     */
    clearCanvas() {
        while (this.canvas.firstChild) {
            this.canvas.removeChild(this.canvas.firstChild);
        }
        this.pixels = [];
    }

    /**
     * Get current pixel count
     * @returns {number} Number of pixels
     */
    getPixelCount() {
        return this.pixels.length;
    }

    /**
     * Update existing pixels with new color mode
     * @param {string} colorMode - Color mode to apply
     */
    updateColors(colorMode) {
        this.settings.colorMode = colorMode;
        const total = this.pixels.length;

        for (let i = 0; i < total; i++) {
            const div = this.pixels[i];
            const pixel = {
                x: parseFloat(div.dataset.x),
                y: parseFloat(div.dataset.y),
                char: div.dataset.char
            };
            const color = this.calculatePixelColor(pixel, i, total);
            div.style.backgroundColor = color;
        }
    }

    /**
     * Apply pulse animation to pixels
     */
    applyPulseAnimation() {
        for (let i = 0; i < this.pixels.length; i++) {
            this.pixels[i].classList.add('pulse');
        }
    }

    /**
     * Remove pulse animation from pixels
     */
    removePulseAnimation() {
        for (let i = 0; i < this.pixels.length; i++) {
            this.pixels[i].classList.remove('pulse');
        }
    }

    /**
     * Get bounding box of rendered text
     * @returns {Object} Bounding box {minX, maxX, minY, maxY, width, height}
     */
    getBoundingBox() {
        if (this.pixels.length === 0) {
            return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 };
        }

        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        for (let i = 0; i < this.pixels.length; i++) {
            const x = parseFloat(this.pixels[i].dataset.x);
            const y = parseFloat(this.pixels[i].dataset.y);
            
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        }

        return {
            minX,
            maxX,
            minY,
            maxY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    /**
     * Export current rendering as data
     * @returns {Object} Export data
     */
    exportData() {
        return {
            pixels: this.pixels.map(div => ({
                x: div.dataset.x,
                y: div.dataset.y,
                color: div.style.backgroundColor,
                char: div.dataset.char
            })),
            settings: { ...this.settings },
            boundingBox: this.getBoundingBox()
        };
    }
}

// Make TextRenderer available globally
window.TextRenderer = TextRenderer;
