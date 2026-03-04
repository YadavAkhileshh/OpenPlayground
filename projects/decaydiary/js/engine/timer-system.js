/**
 * timer-system.js
 * Tracks the "age" and state of every captured character.
 * 
 * This module maintains a registry of all active spans and 
 * provides methods to update their status based on the elapsed time.
 */

class TimerSystem {
    constructor() {
        /**
         * Map of DOM element IDs to timing data objects
         * @type {Map<string, Object>}
         */
        this.registry = new Map();

        /**
         * Counter for unique character IDs
         * @type {number}
         */
        this.charIdCounter = 0;
    }

    /**
     * Registers a new character into the tracking system.
     * @param {HTMLElement} element - The span element wrapping the character.
     * @returns {string} The unique ID assigned to the character.
     */
    register(element) {
        const id = `char-${this.charIdCounter++}`;
        const timestamp = Date.now();

        element.id = id;
        element.classList.add('decay-char');

        this.registry.set(id, {
            element: element,
            born: timestamp,
            status: 'fresh' // 'fresh' | 'fading' | 'expired'
        });

        return id;
    }

    /**
     * Updates the state of all registered characters.
     * @param {number} currentTime - The current timestamp.
     * @returns {Array<string>} List of expired character IDs for cleanup.
     */
    tick(currentTime) {
        const expiredIds = [];

        // Calculate effective delta (Phase 2: Illumination slowdown)
        let multiplier = 1.0;
        if (typeof illuminationSystem !== 'undefined') {
            multiplier = illuminationSystem.getTimeMultiplier();
        }

        this.registry.forEach((data, id) => {
            const age = currentTime - data.born;

            // Phase 1: Fresh -> Fading
            if (age >= CONFIG.DECAY.START_DELAY && data.status === 'fresh') {
                this.startFading(data);
            }

            // Update opacity if fading
            if (data.status === 'fading') {
                const fadeAge = age - CONFIG.DECAY.START_DELAY;

                // Slow down progress calculation if illuminated
                const progress = Math.min(fadeAge / (CONFIG.DECAY.FADE_DURATION / multiplier), 1);

                this.updateOpacity(data, progress);

                // Phase 2: Fading -> Expired
                if (progress >= 1) {
                    data.status = 'expired';
                    expiredIds.push(id);
                }
            }
        });

        return expiredIds;
    }

    /**
     * Transition a character to the fading state.
     * @private
     */
    startFading(data) {
        data.status = 'fading';
        data.element.classList.add('fading');
    }

    /**
     * Updates the visual opacity based on fade progress.
     * @private
     */
    updateOpacity(data, progress) {
        const opacity = 1 - progress;
        data.element.style.opacity = opacity.toFixed(3);

        // Optional: Add subtle blur as it decays
        if (progress > 0.5) {
            const blur = (progress - 0.5) * CONFIG.VISUALS.MAX_BLUR;
            data.element.style.filter = `blur(${blur}px)`;
        }
    }

    /**
     * Removes a character from the tracking registry and DOM.
     * @param {string} id - The unique ID of the character.
     */
    unregister(id) {
        const data = this.registry.get(id);
        if (data && data.element) {
            data.element.remove();
        }
        this.registry.delete(id);
    }

    /**
     * Returns the total count of currently captured characters.
     */
    get count() {
        return this.registry.size;
    }
}

// Global instance for the application
const timerSystem = new TimerSystem();
