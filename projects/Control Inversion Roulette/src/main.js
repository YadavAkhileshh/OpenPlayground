/**
 * Main Entry Point
 * 
 * Initializes the game modules and starts the game loop.
 */

import { Game } from './Game.js';

// Wait for the DOM to be fully loaded
window.addEventListener('DOMContentLoaded', () => {
    console.log('Control Inversion Roulette - Initializing...');

    // Get the canvas element
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Fatal Error: Game canvas not found!');
        return;
    }

    // Initialize the Game instance
    const game = new Game(canvas);

    // Start the game
    game.start();

    console.log('Game initialized successfully.');
});
