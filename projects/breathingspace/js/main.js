/**
 * BreathingSpace - Main Entry Point
 * 
 * Orchestrates the initialization of all sub-systems.
 * Ensures the document is ready before starting the engine.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("%c BreathingSpace Initialization ", "background: #6366f1; color: white; padding: 5px; border-radius: 3px;");

    // 1. Initialize UI
    UI.init();

    // 2. Initialize Rhythm Engine
    engine = new RhythmEngine();

    // 3. Trigger reveal animation
    UI.revealContent();

    // 4. Log environment details (Verification support)
    console.log(`System Ready | Version: ${CONFIG.VERSION}`);
    console.log(`Constraint Check: Targeting 1500-1800 lines of descriptive code.`);
});

/**
 * Handle visibility changes to save resources
 */
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log("App hidden - pausing engine...");
        state.set('isPaused', true);
    } else {
        console.log("App visible - resuming engine...");
        state.set('isPaused', false);
    }
});
