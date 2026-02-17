/**
 * Main Application Entry Point
 * SingleDivArt - Pushing CSS to the boundaries
 */

document.addEventListener('DOMContentLoaded', () => {

    console.log("%c SingleDivArt %c v1.0.0 ", "background: #00ff88; color: #000; font-weight: bold; border-radius: 3px 0 0 3px;", "background: #222; color: #00ff88; border-radius: 0 3px 3px 0;");

    // 1. Initialize Utilities
    // (MathUtils and ColorUtils are already global)

    // 2. Initialize Core Engine
    Engine.init();

    // 3. Initialize Viewport Interaction
    Canvas.init();

    // 4. Initialize Theme
    Theme.init();

    // 5. Initialize UI Controls
    Controls.init();

    // 6. Perform Initial Generation
    setTimeout(() => {
        Engine.generate();
    }, 500);

    // Global interaction listener for aesthetic updates
    window.addEventListener('single-div-render-complete', (e) => {
        Theme.updateAmbientGlow(e.detail.pixels);
    });

    console.log("Application Fully Loaded");
});

/**
 * Global Error Handling
 */
window.onerror = (message, source, lineno, colno, error) => {
    console.error("SingleDivArt Error:", message, "at", source, ":", lineno);
};
