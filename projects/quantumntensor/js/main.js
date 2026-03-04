/**
 * js/main.js
 * Entry point binding everything together when DOM loads.
 */

document.addEventListener("DOMContentLoaded", () => {

    // Globally accessible logger since Math engines use it deep down
    window.AppLogger = new window.LoggerClass('math-logs');
    window.AppLogger.log(`System Boot... QuantumTensor Engine v${window.AppConfig.VERSION}`);

    try {
        const uiManager = new window.UIManager();
        const stateManager = new window.StateManager(uiManager);
        const inputHandler = new window.InputHandler(stateManager, uiManager);
        const loop = new window.GameLoop(stateManager);

        // Initialize
        uiManager.buildPalette();
        inputHandler.init();
        stateManager.init();
        loop.start();

        window.AppLogger.log(`Initialization Complete. Workspace ready.`);

        // Expose globally for browser debug if needed
        window.QT = { uiManager, stateManager };

    } catch (e) {
        window.AppLogger.error(`FATAL BOOT ERROR: ${e.message}`);
        console.error(e);
    }
});
