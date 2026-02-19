import { logger } from '../utils/logger.js';
import { ITEMS } from '../data/items.js';

export class InventorySystem {
    constructor(game) {
        this.game = game;
    }

    useItem(itemName) {
        const player = this.game.player;
        const item = player.findItem(itemName);

        if (!item) {
            logger.log(`You don't have a ${itemName}.`, 'error');
            return;
        }

        if (item.type !== 'consumable') {
            logger.log(`You can't use the ${item.name} like that.`, 'warning');
            return;
        }

        // Apply Effects
        if (item.effect) {
            if (item.effect.type === 'heal') {
                player.heal(item.effect.value);
            } else if (item.effect.type === 'damage') {
                if (this.game.combat.inCombat) {
                    this.game.combat.enemy.hp -= item.effect.value;
                    logger.log(`You used ${item.name} on the enemy for ${item.effect.value} damage!`, 'combat');
                } else {
                    logger.log(`You cast ${item.name} at the darkness. Nothing happens.`, 'story');
                }
            }
        }

        // Consume
        player.removeItem(itemName);
        logger.log(`Used ${item.name}.`, 'info');
    }
}
