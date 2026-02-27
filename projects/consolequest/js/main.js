import { Game } from './core/game.js';
import { logger } from './utils/logger.js';
import { ASCII } from './utils/ascii.js';

window.onload = () => {
    // Disable default context menu to encourage dev tools use? 
    // No, that might annoy user.

    console.log("%c SYSTEM BOOT SEQUENCE INITIATED...", "color: #0f0; background: #000;");

    setTimeout(() => logger.log("Loading Kernel...", 'info'), 500);
    setTimeout(() => logger.log("Mounting Virtual File System...", 'info'), 1000);
    setTimeout(() => logger.log("Allocating Memory Blocks... [OK]", 'success'), 1500);
    setTimeout(() => {
        logger.log("Initializing Graphics Engine... (ASCII MODE)", 'warning');
        console.log(`%c${ASCII.LOGO}`, "color: #0f0; font-family: monospace; font-weight: bold;");
    }, 2200);

    setTimeout(() => {
        console.log("%cWelcome directly to the Matrix.", "color: #0f0; background: #000; font-size: 16px; padding: 5px;");
        console.log("%cType 'start' to begin your adventure.", "color: #fff; background: #333; padding: 5px; font-weight: bold; font-size: 14px;");

        // Initialize Game ONLY after boot
        window._game = new Game();

    }, 3000);
};
