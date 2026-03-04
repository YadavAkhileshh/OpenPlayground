/**
 * GlitchFX
 * Adds random digital artifacts and stutters to the hologram.
 * Simulates signal interference and data corruption.
 */
class GlitchFX {
    /**
     * Creates a new GlitchFX instance.
     * Sets up timing variables for the glitch loop.
     */
    constructor() {
        this.container = Utils.qs('#hologram-container');
        this.timer = 0;
        this.nextGlitchTime = 100;
        this.isGlitching = false;
    }

    /**
     * Initializes the glitch effect system.
     */
    init() {
        console.log('GlitchFX: Initialized');
    }

    /**
     * Called every frame.
     * Checks if it's time to trigger a glitch event.
     */
    update() {
        this.timer++;

        if (this.timer > this.nextGlitchTime) {
            this.triggerGlitch();
            this.timer = 0;
            // Random interval between glitches (1-5 seconds)
            this.nextGlitchTime = Utils.randomInt(60, 300);
        }
    }

    /**
     * Executes a single glitch event.
     * Randomly skews a text layer and changes its color momentarily.
     */
    triggerGlitch() {
        if (!this.container) return;

        State.runtime.isGlitching = true;

        // Add global glitch class for container-wide effects
        this.container.classList.add('glitching');

        // Randomly offset a few layers
        const layers = Utils.qsa('.holo-layer');
        if (layers.length === 0) return;

        const randomLayerIndex = Utils.randomInt(0, layers.length - 1);
        const randomLayer = layers[randomLayerIndex];

        if (randomLayer) {
            const originalTransform = randomLayer.style.transform;
            const skewX = Utils.randomInt(-20, 20);
            const skewY = Utils.randomInt(-10, 10);
            const moveX = Utils.randomInt(-5, 5);
            const moveY = Utils.randomInt(-5, 5);

            // Apply chaotic transform
            randomLayer.style.transform += ` translate(${moveX}px, ${moveY}px) skew(${skewX}deg, ${skewY}deg)`;

            // Flash white/bright
            const originalColor = randomLayer.style.color;
            randomLayer.style.color = '#fff';

            // Revert after short duration (50-150ms)
            setTimeout(() => {
                randomLayer.style.transform = originalTransform;
                randomLayer.style.color = originalColor || '';
                this.container.classList.remove('glitching');
                State.runtime.isGlitching = false;
            }, Utils.randomInt(50, 150));
        }
    }
}
