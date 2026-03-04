/**
 * Global State Management
 * Stores configuration and runtime state for the entire application.
 * Acts as a central source of truth for UI, Engine, and Interaction components.
 */

const State = {
    /**
     * Configuration settings that can be adjusted by the user.
     */
    config: {
        /** The text to display in the hologram. */
        text: "HOLOTEXT",

        /** Total number of volumetric layers (DOM nodes). */
        layerCount: 50,

        /** Maximum Z-translation in pixels. determines the "thickness". */
        depthIntensity: 150,

        /** Opacity multiplier for the glow effect. */
        glowOpacity: 0.8,

        /** Speed of the rotation interpolation (0.0 to 1.0). */
        rotateSpeed: 0.1,

        /** Flag indicating if the user is on a mobile device. */
        isMobile: window.innerWidth < 768
    },

    /**
     * Runtime state values that change every frame or on interaction.
     */
    runtime: {
        /** Normalized mouse X position (-1 to 1). */
        mouseX: 0,

        /** Normalized mouse Y position (-1 to 1). */
        mouseY: 0,

        /** Target X rotation in degrees. */
        targetRotateX: 0,

        /** Target Y rotation in degrees. */
        targetRotateY: 0,

        /** Current interpolated X rotation in degrees. */
        currentRotateX: 0,

        /** Current interpolated Y rotation in degrees. */
        currentRotateY: 0,

        /** Flag indicating if the glitch effect is currently active. */
        isGlitching: false
    },

    /**
     * Updates a config value and dispatches a 'config-updated' event.
     * Components should listen for this event to react to changes.
     * 
     * @param {string} key - The config key to update.
     * @param {any} value - The new value.
     */
    updateConfig(key, value) {
        if (this.config.hasOwnProperty(key)) {
            // Basic validation could go here
            this.config[key] = value;

            // Dispatch custom event for reactive updates
            const event = new CustomEvent('config-updated', {
                detail: {
                    key,
                    value
                }
            });
            window.dispatchEvent(event);

            if (key === 'text') {
                console.log(`State: Text updated to "${value}"`);
            }
        } else {
            console.warn(`State: Attempted to update non-existent config key "${key}"`);
        }
    }
};
