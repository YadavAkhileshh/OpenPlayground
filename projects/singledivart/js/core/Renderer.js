/**
 * Renderer - Optimized CSS Shadow Engine
 * 
 * The Renderer module is the core visual engine of SingleDivArt. It is 
 * responsible for taking an array of virtual pixel coordinates and 
 * colors, and transforming them into a single, massive CSS box-shadow 
 * property.
 * 
 * Performance is a primary concern here, as CSS box-shadows can become 
 * computationally expensive for the browser's layout and paint engines 
 * when the count exceeds several thousand.
 * 
 * @namespace Renderer
 */

const Renderer = (() => {

    /** @type {HTMLElement} The single div that holds all the shadows */
    const artElement = document.getElementById('single-div-art');

    /** @type {HTMLElement} UI element to display current shadow count */
    const shadowCountDisplay = document.getElementById('shadow-count');

    /** @type {HTMLElement} UI element to display rendering duration */
    const renderTimeDisplay = document.getElementById('render-time');

    /**
     * Applies a list of pixels to the single div as box-shadows.
     * 
     * This function constructs a long comma-separated string of 
     * box-shadow values. Each shadow represents one "pixel" in the art.
     * 
     * @param {Array<Object>} pixels - Array of objects containing x, y, and color.
     * @param {Object} [options={}] - Rendering configurations.
     * @param {number} [options.scale=10] - Physical pixel size per coordinate unit.
     * @param {number} [options.blur=0] - CSS blur-radius for the shadows.
     * @param {number} [options.spread=0] - CSS spread-radius for the shadows.
     * @param {string} [options.unit='px'] - CSS unit for measurements.
     * @returns {string} The duration of the render process in milliseconds.
     */
    const render = (pixels, options = {}) => {
        const startTime = performance.now();

        // Destructuring with default values for robustness
        const {
            scale = 10,
            blur = 0,
            spread = 0,
            unit = 'px'
        } = options;

        // Safety check for empty or invalid pixel lists
        if (!pixels || pixels.length === 0) {
            artElement.style.boxShadow = 'none';
            return "0";
        }

        /**
         * String Construction Phase
         * 
         * We use a single string builder approach. For very large counts, 
         * an array join might be slightly faster, but string concatenation 
         * is generally well-optimized in modern V8/SpiderMonkey engines.
         * 
         * Format: [x] [y] [blur] [spread] [color]
         */
        let shadowString = "";
        const len = pixels.length;

        for (let i = 0; i < len; i++) {
            const p = pixels[i];

            // Projecting coordinate space to physical screen space
            const px = p.x * scale;
            const py = p.y * scale;

            // Build the individual shadow component
            shadowString += `${px}${unit} ${py}${unit} ${blur}${unit} ${spread}${unit} ${p.color}`;

            // Comma separation as per CSS spec, excluding the last item
            if (i < len - 1) {
                shadowString += ",";
            }
        }

        /**
         * DOM Update Phase
         * 
         * Warning: This is the most expensive part. Setting a extremely long 
         * property string can block the main thread briefly.
         */
        artElement.style.boxShadow = shadowString;

        // Finalize statistics
        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(2);

        /**
         * UI Sync Phase
         * Updates the metrics displayed in the control panel.
         */
        if (shadowCountDisplay) {
            shadowCountDisplay.textContent = len.toLocaleString();
        }

        if (renderTimeDisplay) {
            renderTimeDisplay.textContent = `${duration}ms`;
        }

        return duration;
    };

    /**
     * Update the visual scale of the artwork container.
     * Uses CSS transform for performance to avoid layout thrashing.
     * 
     * @param {number} scaleFactor - The multiplier for the zoom level.
     */
    const setViewScale = (scaleFactor) => {
        const container = document.getElementById('art-container');
        if (container) {
            container.style.transform = `scale(${scaleFactor})`;
        }
    };

    /**
     * Resets the artwork element to its default invisible state.
     */
    const clear = () => {
        artElement.style.boxShadow = 'none';
        if (shadowCountDisplay) shadowCountDisplay.textContent = '0';
    };

    /**
     * Generates a raw CSS snippet that can be exported for external use.
     * Useful for developers who want to use the generated art in their projects.
     * 
     * @param {Array<Object>} pixels - The current pixel data.
     * @param {Object} [options={}] - Configuration for the exported CSS.
     * @returns {string} A formatted CSS code block.
     */
    const getCSSText = (pixels, options = {}) => {
        const { scale = 10, blur = 0, spread = 0 } = options;
        let shadow = "";

        // Construct a multiline, indented string for readability
        pixels.forEach((p, i) => {
            shadow += `${p.x * scale}px ${p.y * scale}px ${blur}px ${spread}px ${p.color}`;
            if (i < pixels.length - 1) {
                shadow += ",\n    ";
            }
        });

        return `/* Generated by SingleDivArt */\n#art-element {\n  width: 1px;\n  height: 1px;\n  background: transparent;\n  box-shadow: \n    ${shadow};\n}`;
    };

    return {
        render,
        setViewScale,
        clear,
        getCSSText
    };

})();

// Export to window scope
window.Renderer = Renderer;

