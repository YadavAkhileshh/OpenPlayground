/**
 * QuadCompress Main Entry Point
 * 
 * Bootstraps the application, initializing all subsystems and wiring
 * them together.
 * 
 * @module Main
 */

import { CONFIG, validateConfig } from './config.js';
import { Logger } from './utils/logger.js';
import { ImageLoader } from './core/imageLoader.js';
import { QuadTree } from './core/quadtree.js';
import { Renderer } from './view/renderer.js';
import { Animator } from './view/animator.js';
import { Controls } from './ui/controls.js';
import { StatsUI } from './ui/stats.js';

class App {
    constructor() {
        this.initialized = false;

        // Systems
        this.imageLoader = null;
        this.quadTree = null;
        this.renderer = null;
        this.animator = null;
        this.controls = null;
        this.stats = null;
    }

    async init() {
        try {
            Logger.system('Initializing QuadCompress...');
            validateConfig();

            // 1. Initialize Core Systems
            this.imageLoader = new ImageLoader('source-canvas');
            this.quadTree = new QuadTree();

            // 2. Initialize View
            this.renderer = new Renderer('display-canvas');

            // 3. Initialize UI
            this.stats = new StatsUI();

            // 4. Orchestrator
            this.animator = new Animator(this.quadTree, this.renderer, this.stats);

            // 5. Controls (Input)
            // Controls needs reference to Animator to trigger updates
            this.controls = new Controls(this.animator, this.imageLoader);

            // 6. Load Demo Image (Optional)
            // Can add a default image here if needed

            this.initialized = true;

            // Remove splash screen / loader if it existed
            document.getElementById('status-text').textContent = 'SYSTEM ACTIVE';

            Logger.success('App', 'Initialization Complete. Waiting for input.');

        } catch (err) {
            Logger.error('App', 'Fatal Initialization Error');
            Logger.error('App', err);
            document.body.innerHTML = `<h1 style="color:red; padding: 20px;">SYSTEM FAILURE: ${err.message}</h1>`;
        }
    }
}

// Start app when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    window.app = app; // Expose for debugging
    app.init();
});
