/**
 * @file main.js
 * @description Application entry point for MirrorASCII.
 * 
 * This script initializes all high-level modules and ties them together
 * to start the living reflection mirror.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('[MirrorASCII] Starting application...');

    // 1. Initialize DOM elements required for the engines
    const canvas = document.getElementById('ascii-canvas');
    if (!canvas) {
        console.error('[Main] Could not find ascii-canvas element.');
        return;
    }

    // 2. Instantiate core managers and engines
    const cameraManager = new CameraManager();
    const processor = new Processor(cameraManager);
    const asciiEngine = new ASCIIEngine(canvas);
    const visualFx = new VisualFX();
    const debugManager = new DebugManager();

    // 3. Instantiate UI Manager (The Orchestrator)
    const uiManager = new UIManager(cameraManager, processor, asciiEngine, visualFx, debugManager);

    // 4. Instantiate Controls (The Interaction Layer)
    const controls = new Controls(processor, asciiEngine, uiManager, visualFx, debugManager);

    // 5. Kick off the initialization process
    uiManager.init().then(() => {
        console.log('[MirrorASCII] Initialization complete.');

        // Log some system info for debugging
        const dims = cameraManager.getDimensions();
        console.log(`[System] Camera Resolution: ${dims.width}x${dims.height}`);
        console.log(`[System] Grid Resolution: ${processor.gridWidth} cols`);
    }).catch(err => {
        console.error('[MirrorASCII] Fatal initialization error:', err);
    });
});
