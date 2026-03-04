/**
 * Main Entry Point
 * Initializes the game application.
 */

window.addEventListener('DOMContentLoaded', () => {
    console.log("LagMaze Initializing...");

    const game = new GameEngine();
    game.init();

    // Add global reference for debugging if needed
    window.game = game;

    // Initial glitch effect on title to draw attention
    const title = document.querySelector('.glitch');
    if (title) {
        title.setAttribute('data-text', title.textContent);
    }
});
