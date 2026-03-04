/**
 * LightingSystem
 * Simulates dynamic lighting and glow effects.
 * Updates CSS variables to control the "light source" position and intensity
 * based on user interaction.
 */
class LightingSystem {
    /**
     * Creates a new LightingSystem instance.
     * Caches the root element for CSS variable updates.
     */
    constructor() {
        this.root = document.documentElement;
        this.lightPos = { x: 0, y: 0 };
    }

    /**
     * Initializes the lighting system.
     * Sets initial light position.
     */
    init() {
        this.updateLightPosition(0, 0);
        console.log('LightingSystem: Initialized');
    }

    /**
     * Updates the internal light position state.
     * @param {number} x - Normalized X position.
     * @param {number} y - Normalized Y position.
     */
    updateLightPosition(x, y) {
        this.lightPos.x = x;
        this.lightPos.y = y;
    }

    /**
     * Called every frame by the main loop.
     * Calculates the light position opposite to the mouse to simulate reflection.
     * Modulates glow intensity based on distance from center.
     */
    update() {
        // Move the "light" opposite to the mouse to simulate a reflection or source
        // effectively moving the highlight across the text surface
        const lightX = -State.runtime.mouseX * 100;
        const lightY = -State.runtime.mouseY * 100;

        this.root.style.setProperty('--light-x', `${lightX}%`);
        this.root.style.setProperty('--light-y', `${lightY}%`);

        // Dynamic glow intensity based on how close to center we are
        // Closer to center = brighter
        const dist = Math.sqrt(
            State.runtime.mouseX * State.runtime.mouseX +
            State.runtime.mouseY * State.runtime.mouseY
        );

        // Inverse relationship: closer to 0 (center) -> higher intensity
        // Clamped to avoid extreme values
        const intensity = Utils.mapRange(Utils.clamp(dist, 0, 1.5), 0, 1.5, 1, 0.5);
        this.root.style.setProperty('--holo-glow-intensity', intensity);
    }
}
