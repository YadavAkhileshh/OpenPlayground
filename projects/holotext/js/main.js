/**
 * Main Entry Point for HoloText
 * Initializes all subsystems, sets up the main render loop, and handles boot sequences.
 * 
 * Order of Initialization:
 * 1. LayerEngine - Creates the DOM structure
 * 2. InteractionManager - Sets up input handling
 * 3. LightingSystem - Configures ambient effects
 * 4. GlitchFX - Prepares visual artifacts
 * 5. UIController - Binds the HUD
 * 6. ParticleSystem - Adds depth
 * 7. AudioManager - Prepares sound engine
 * 8. ThemeManager - Applies initial theme
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {

    // Core Engine Components
    const layerEngine = new LayerEngine();
    const interactionManager = new InteractionManager();
    const lightingSystem = new LightingSystem();
    const glitchFX = new GlitchFX();
    const uiController = new UIController();

    // Expanded Feature Components
    const particleSystem = new ParticleSystem();
    const audioManager = new AudioManager();
    const themeManager = new ThemeManager();

    // ---------------------------------------------------------
    // SYSTEM INITIALIZATION
    // ---------------------------------------------------------

    // 1. Initialize Text Layers
    layerEngine.init();

    // 2. Initialize Interaction
    interactionManager.init();

    // 3. Initialize Visual FX
    lightingSystem.init();
    glitchFX.init();

    // 4. Initialize UI
    uiController.init();

    // 5. Initialize Extended Systems
    particleSystem.init();
    audioManager.init();
    themeManager.init();

    // ---------------------------------------------------------
    // BOOT ANIMATION
    // ---------------------------------------------------------

    const stage = Utils.qs('.stage');
    // Start invisible
    stage.style.opacity = '0';

    // Fade in after a short delay to simulate "power on"
    setTimeout(() => {
        stage.style.transition = 'opacity 2s ease-in';
        stage.style.opacity = '1';

        // Trigger a boot glitch effect
        if (glitchFX.triggerGlitch) {
            glitchFX.triggerGlitch();
        }
    }, 500);

    /**
     * The Main Render Loop
     * Uses requestAnimationFrame for optimal performance (60fps target).
     * Coordinate all system updates here.
     */
    function animate() {
        // Core Physics & Interaction
        interactionManager.update();

        // Visuals
        lightingSystem.update();
        glitchFX.update();

        // Particles
        particleSystem.update();

        // Audio & UI
        audioManager.update();
        uiController.update();

        // Recursion
        requestAnimationFrame(animate);
    }

    // Start the Engine Loop
    animate();

    // Console Banner
    console.log("%c HOLOTEXT ENGINE :: ONLINE ", "background: #000; color: #00f3ff; font-size: 14px; padding: 5px; font-weight: bold; border-left: 4px solid #00f3ff;");
    console.log("v1.0.0 - All Systems Nominal");
});
