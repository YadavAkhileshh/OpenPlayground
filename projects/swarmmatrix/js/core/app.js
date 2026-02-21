/**
 * js/core/app.js
 * Main entry point for SwarmMatrix.
 */

import { state } from './state.js';
import { GameLoop } from './loop.js';
import { Simulation } from '../simulation/simulation.js';
import { Renderer } from '../render/renderer.js';
import { UIManager } from '../ui/uiManager.js';

class App {
    constructor() {
        this.init();
    }

    async init() {
        console.log("Initializing SwarmMatrix...");

        // Ensure canvas respects window scaling
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());

        // Initialize core systems
        this.simulation = new Simulation(state.get('width'), state.get('height'));
        this.renderer = new Renderer(this.simulation);
        this.uiManager = new UIManager(this.simulation, this.renderer);

        // Setup loop
        this.loop = new GameLoop(this.simulation, this.renderer, this.uiManager);

        // Bind UI to interaction tools and loop
        this.uiManager.bindLoop(this.loop);

        // Populate initial world state
        this.simulation.init();

        // Start
        this.loop.start();
        console.log("System Online. Running simulation loop.");
    }

    handleResize() {
        state.set('width', window.innerWidth);
        state.set('height', window.innerHeight);

        const simCanvas = document.getElementById('simulation-canvas');
        const uiCanvas = document.getElementById('ui-overlay-canvas');

        if (simCanvas && uiCanvas) {
            simCanvas.width = state.get('width');
            simCanvas.height = state.get('height');
            uiCanvas.width = state.get('width');
            uiCanvas.height = state.get('height');

            // Re-render when resizing if paused to prevent blank screen
            if (state.get('isPaused') && this.renderer) {
                this.renderer.render();
            }
        }
    }
}

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
