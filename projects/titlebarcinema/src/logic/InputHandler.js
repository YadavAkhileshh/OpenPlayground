/**
 * TitleBarCinema - InputHandler.js
 * 
 * ============================================================================
 * ARCHITECTURAL OVERVIEW
 * ============================================================================
 * The InputHandler module is the user-to-engine bridge. It abstracts 
 * low-level browser events (KeyboardEvent, MouseEvent, TouchEvent) into 
 * semantic game actions such as "Jump", "Pause", and "Start".
 * 
 * This abstraction allows the main engine logic to remain agnostic of 
 * the specific input device being used, facilitating easier cross-platform 
 * support (Mobile touch vs. Desktop keyboard).
 * 
 * ============================================================================
 * MODULE METADATA
 * ============================================================================
 * @project TitleBarCinema
 * @module Logic.InputHandler
 * @version 1.0.0
 * @author Antigravity
 */

/**
 * @class InputHandler
 * @description Manages listeners for user interaction and maps them to game commands.
 */
export class InputHandler {
    /**
     * @constructor
     * Initializes state sets and binds event listeners to the window object.
     */
    constructor() {
        /** 
         * @private @type {Set<string>} 
         * Set of currently depressed keys for multi-key support.
         */
        this.keys = new Set();

        /** @private @type {Function|null} Callback for Jump events */
        this.onJump = null;

        /** @private @type {Function|null} Callback for Start events */
        this.onStart = null;

        /** @private @type {Function|null} Callback for Pause/Resume events */
        this.onPause = null;

        // Initialize Native Viewport Listeners
        this.init();
    }

    /**
     * Binds native DOM event listeners to the component's internal logic.
     * Maps spacebar, clicking, and key 'P' to actions.
     * @private
     * @returns {void}
     */
    init() {
        // Keyboard: Down-press
        window.addEventListener('keydown', (e) => {
            this.keys.add(e.code);

            // Priority 1: Spacebar for Jumping
            if (e.code === 'Space') {
                e.preventDefault(); // Prevent page scrolling
                if (this.onJump) this.onJump();
            }

            // Priority 2: Key 'P' for Pausing
            if (e.code === 'KeyP') {
                if (this.onPause) this.onPause();
            }
        });

        // Keyboard: Up-release
        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        });

        // Mouse Support
        window.addEventListener('mousedown', (e) => {
            // Only trigger if clicking main content or valid area
            if (this.onJump) this.onJump();
        });

        // Touch Support (for mobile cinema viewing)
        window.addEventListener('touchstart', (e) => {
            if (this.onJump) {
                // Prevent multi-touch interference
                if (e.touches.length === 1) {
                    this.onJump();
                }
            }
        });
    }

    /**
     * Injects a callback for the Jump action.
     * @param {Function} callback - Semantic jump action logic.
     * @returns {void}
     */
    setJumpListener(callback) {
        this.onJump = callback;
    }

    /**
     * Injects a callback for the Pause toggle action.
     * @param {Function} callback - Semantic pause toggle logic.
     * @returns {void}
     */
    setPauseListener(callback) {
        this.onPause = callback;
    }

    /**
     * Injects a callback for the Start/Resume action.
     * @param {Function} callback - Semantic start logic.
     * @returns {void}
     */
    setStartListener(callback) {
        this.onStart = callback;
    }

    /**
     * Synchronous check to see if a specific key is currently held.
     * Used for continuous movement logic (not used in current 1D build).
     * @param {string} code - KeyboardEvent.code.
     * @returns {boolean}
     */
    isKeyDown(code) {
        return this.keys.has(code);
    }
}
