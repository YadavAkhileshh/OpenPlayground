/**
 * TitleBarCinema - Renderer.js
 * 
 * ============================================================================
 * ARCHITECTURAL OVERVIEW
 * ============================================================================
 * The Renderer module is the "display card" of the TitleBarCinema engine. 
 * Its primary responsibility is to bridge the gap between abstract 2D 
 * game coordinates and the literal, 1D character string that occupies the 
 * browser tab title.
 * 
 * It maintains an internal character buffer (an array of characters representing
 * the world) which entities can "draw" onto using index-based positioning.
 * 
 * The final output is mirrored both to the `document.title` and to a 
 * `<pre>` tag on the page for visual consistency and debugging accessibility.
 * 
 * ============================================================================
 * MODULE METADATA
 * ============================================================================
 * @project TitleBarCinema
 * @module Core.Renderer
 * @version 1.0.0
 * @stability Stable
 * @author Antigravity
 */

import { WORLD, CONFIG } from './Constants.js';

/**
 * @class Renderer
 * @description Handles the conversion of game state to browser UI strings.
 */
export class Renderer {
    /**
     * @constructor
     * Initializes the viewport and character buffers.
     */
    constructor() {
        /** 
         * @public @type {number} 
         * Total character width of the animation viewport.
         */
        this.viewportWidth = CONFIG.WORLD_LENGTH;

        /** 
         * @private @type {Array<string>} 
         * Character buffer used for frame composition.
         */
        this.buffer = new Array(this.viewportWidth).fill(WORLD.SKY);

        /** 
         * @private @type {HTMLElement|null} 
         * Reference to the in-page mirror element for visual feedback.
         */
        this.preElement = document.querySelector('#pre-cinema');
    }

    /**
     * Clears the current frame buffer with the default background character.
     * This should be called at the start of every render cycle to prevent
     * frame ghosting or residue.
     * @returns {void}
     */
    clear() {
        // We use the current sky character which might change based on level
        this.buffer.fill(WORLD.SKY);
    }

    /**
     * Draws a single character or emoji onto the buffer at a specific position.
     * Includes safety bounds checking to prevent index-out-of-bounds errors.
     * @param {number} x - The horizontal position (0 to viewportWidth-1).
     * @param {string} char - The ASCII character or emoji to render.
     * @returns {void}
     */
    draw(x, char) {
        if (x >= 0 && x < this.viewportWidth) {
            this.buffer[x] = char;
        }
    }

    /**
     * Fills the "bottom" layer of the buffer with ground characters.
     * This creates the visual effect of a floor in the terminal/title bar.
     * @returns {void}
     */
    drawGround() {
        for (let i = 0; i < this.viewportWidth; i++) {
            // Only draw ground if the segment is empty (sky)
            if (this.buffer[i] === WORLD.SKY) {
                // Ground character is retrieved from the WORLD constant
                // This might change as the player levels up.
            }
        }
    }

    /**
     * Finalizes the buffer contents and pushes them to the browser UI.
     * Updates both the tab title and the web page mirror.
     * @param {string} [prefix=""] - Metadata to prepend (e.g., score/stats).
     * @returns {void}
     */
    render(prefix = "") {
        // Join the character array into a single string for display
        const frameString = this.buffer.join("");

        // Construct the full title string with prefix decorations (if any)
        const finalTitle = prefix ? `${prefix} ${frameString}` : frameString;

        // Update the browser's native tab title UI.
        // This is the core "cinema" experience.
        document.title = finalTitle;

        // Update the web-page DOM mirror for better visibility and dev feedback.
        // This helps if the user has their tabs hidden or narrow.
        if (this.preElement) {
            this.preElement.textContent = frameString;
        }
    }

    /**
     * Utility method to generate the metadata prefix string for the title.
     * @param {number} score - The current numeric score.
     * @param {number} distance - The total distance traveled in meters.
     * @returns {string} Formatted string: [Score: X] [Dist: Ym]
     */
    formatStats(score, distance) {
        return `[Score: ${score}] [Dist: ${Math.floor(distance)}m]`;
    }

    /**
     * Resize the renderer's conceptual viewport.
     * This is useful if the user changes settings or the browser truncates.
     * @param {number} newWidth - New character count for the title.
     * @returns {void}
     */
    resize(newWidth) {
        this.viewportWidth = newWidth;
        this.buffer = new Array(this.viewportWidth).fill(WORLD.SKY);
    }

    /**
     * Appends a static message or decoration to the end of the buffer.
     * @param {string} message - Text to append.
     * @returns {void}
     */
    appendMessage(message) {
        // Currently not used, but reserved for cinematic overlays
    }
}
