/**
 * app.js
 * The main orchestrator for DecayDiary.
 * 
 * Responsible for bootstrapping the application, coordinating
 * between the engine, input system, and UI.
 */

class DecayDiaryApp {
    constructor() {
        this.name = "DecayDiary";
        this.version = "1.0.0";
    }

    /**
     * Initializes the application.
     * To be called when the DOM is fully loaded.
     */
    async launch() {
        console.group(`Initializing ${this.name} v${this.version}`);

        try {
            // 1. Initialize UI layers and Aesthetic Engine
            uiManager.init();
            if (typeof themeEngine !== 'undefined') {
                themeEngine.init();
            }

            // 2. Initialize Core Logic and Input capture
            inputHandler.init(CONFIG.SELECTORS.WRITING_AREA);

            // 3. Initialize Expansion Features (Phase 2)
            if (typeof particleSystem !== 'undefined') particleSystem.init();
            if (typeof illuminationSystem !== 'undefined') illuminationSystem.init();
            if (typeof archiveUtility !== 'undefined') archiveUtility.init();

            // Note: SoundEngine requires a user gesture. We'll bind it to the first click/keypress.
            const enableAudio = () => {
                if (typeof soundEngine !== 'undefined') soundEngine.init();
                document.removeEventListener('mousedown', enableAudio);
                document.removeEventListener('keydown', enableAudio);
            };
            document.addEventListener('mousedown', enableAudio);
            document.addEventListener('keydown', enableAudio);

            // 4. Start the Engines
            decayEngine.start();

            // 4. Notify system via EventBus
            if (typeof eventBus !== 'undefined') {
                eventBus.emit(EVENTS.APP_LAUNCHED, { version: this.version });
            }

            this.setupWindowListeners();

            console.log("Success: Application ready.");
        } catch (error) {
            console.error("Critical Failure during launch:", error);
            uiManager.notify("An error occurred during initialization.");
        } finally {
            console.groupEnd();
        }
    }

    /**
     * Wire up global window events for better UX.
     */
    setupWindowListeners() {
        // Pause engine when user leaves the tab to save resources
        window.addEventListener('blur', () => {
            decayEngine.pause();
        });

        // Resume when user returns
        window.addEventListener('focus', () => {
            decayEngine.resume();
        });

        // Handle window resize logic if needed (handled by CSS mostly)
        window.addEventListener('resize', () => {
            // Re-centering logic if necessary
        });
    }
}

// Instantiate and launch the application
const app = new DecayDiaryApp();

document.addEventListener('DOMContentLoaded', () => {
    app.launch();
});
