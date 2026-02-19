/**
 * main.js
 * 
 * Entry point for the application.
 */

import { GameManager } from './managers/GameManager.js';

window.addEventListener('load', () => {
    const game = new GameManager();
    game.init();

    // Check line count helper (optional)
    // console.log("Game Loaded");
});
