import { logger } from '../utils/logger.js';

export class Renderer {
    constructor() {
        this.frameCounter = 0;
    }

    clear() {
        // We use console.clear() to refresh, but sometimes we might want to keep history.
        // For a game loop feel, clear is best.
        console.clear();
    }

    renderHeader(player) {
        const stats = `HP: ${player.hp}/${player.maxHp} | LP: ${player.level} | XP: ${player.xp} | Gold: ${player.gold}`;
        const loc = `Location: ${player.locationName || 'Unknown'}`;

        logger.log('╔══════════════════════════════════════════════════════════════╗', 'title');
        logger.log(`║ ${stats.padEnd(60)} ║`, 'ui');
        logger.log(`║ ${loc.padEnd(60)} ║`, 'ui');
        logger.log('╚══════════════════════════════════════════════════════════════╝', 'title');
    }

    renderMap(map, playerX, playerY) {
        if (!map) return;

        // Setup map viewport size
        const viewWidth = 15;
        const viewHeight = 7;

        let output = [];

        /* 
           Render a view window centered on player
           We assume map is a 2D array of characters.
        */

        const startX = Math.max(0, playerX - Math.floor(viewWidth / 2));
        const startY = Math.max(0, playerY - Math.floor(viewHeight / 2));
        const endX = Math.min(map[0].length, startX + viewWidth);
        const endY = Math.min(map.length, startY + viewHeight);

        logger.br();

        for (let y = startY; y < endY; y++) {
            let line = "";
            for (let x = startX; x < endX; x++) {
                if (x === playerX && y === playerY) {
                    line += "@ "; // Player symbol
                } else {
                    line += (map[y][x] || " ") + " ";
                }
            }
            // Log each line directly to avoid massive string concat issues in some consoles
            console.log(`%c${line}`, "font-family: monospace; line-height: 14px; font-size: 14px; color: #fff; background: #222;");
        }

        logger.br();
    }

    renderMessageLog(messages) {
        // Render last N messages
        const maxMessages = 5;
        const relevantMessages = messages.slice(-maxMessages);

        logger.br();
        logger.log("--- LOG ---", 'story');
        relevantMessages.forEach(msg => {
            logger.log(`> ${msg.text}`, msg.type || 'default');
        });
    }

    draw(gameState) {
        this.clear();
        this.renderHeader(gameState.player);
        this.renderMap(gameState.map, gameState.player.x, gameState.player.y);
        this.renderMessageLog(gameState.messageLog);
        this.frameCounter++;
    }
}
