import Game from './core/Game.js';

window.addEventListener('scroll', noScroll);

function logDebug(msg) {
    const debugEl = document.getElementById('debug-overlay');
    if (debugEl) debugEl.innerHTML += `<div>${msg}</div>`;
    console.log(msg);
}

window.onerror = function (message, source, lineno, colno, error) {
    logDebug(`ERROR: ${message} at ${source}:${lineno}`);
    return false;
};

window.addEventListener('DOMContentLoaded', () => {
    try {
        logDebug('Initializing Game...');
        const game = new Game();
        game.start();

        // Debug
        window.game = game;

        setInterval(() => {
            if (game && game.world) {
                const count = game.world.entities.length;
                document.getElementById('debug-overlay').innerHTML = `<div>Entities: ${count} | FPS: ${Math.round(1 / game.step)}</div>`;
            }
        }, 1000);

    } catch (e) {
        logDebug(`CRITICAL START ERROR: ${e.message}`);
        console.error(e);
    }
});

function noScroll() {
    window.scrollTo(0, 0);
}
