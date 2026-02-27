/**
 * @file main.js
 * @description Entry point for MonolithRay. Initializes components.
 */

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log("MonolithRay: Initializing...");

    // 1. Init UI
    // 1. Init UI
    window.UI = new Overlay();

    // 1b. Init Input
    const input = new Input(document.getElementById('renderer'));

    // 2. Init Camera
    const camera = new Camera();

    // Attach to window for global access (debug/orbit)
    window.game = {
        camera: camera,
        input: input
    };

    // 3. Init Renderer
    const renderer = new Renderer('renderer');

    // 4. Start Loop
    renderer.start(camera, input);

    console.log("MonolithRay: Started.");
});
