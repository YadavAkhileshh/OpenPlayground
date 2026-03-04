/**
 * @file main.js
 * @description Application entry point. Initializes key modules and starts the loop.
 */

import { Engine } from './core/engine.js';

document.addEventListener('DOMContentLoaded', () => {
    console.clear();
    console.log("%c HYPERCUBE 4D SYSTEM ONLINE ", "background: #000; color: #00f3ff; font-weight: bold; padding: 4px;");

    // Initialize the Engine
    const canvas = document.getElementById('canvas');
    if (!canvas) {
        console.error("Canvas element not found.");
        return;
    }

    const app = new Engine(canvas);
    app.start();

    // Prevent default context menu on canvas
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
});
