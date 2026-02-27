import { logger } from '../utils/logger.js';
import { BESTIARY } from '../data/bestiary.js';

export class CombatSystem {
    constructor(game) {
        this.game = game;
        this.inCombat = false;
        this.enemy = null;
    }

    start(enemyId) {
        const enemyData = Object.values(BESTIARY).find(e => e.id === enemyId);
        if (!enemyData) {
            logger.log(`Error: Enemy ${enemyId} not found.`, 'error');
            return;
        }

        // Clone enemy data so we don't modify the database
        this.enemy = { ...enemyData };
        this.inCombat = true;

        logger.clear();
        logger.log(`You encountered a ${this.enemy.name}!`, 'combat');
        logger.log(this.enemy.art, 'map'); // Use map style for ASCII art preservation
        logger.log(`Type 'attack' to fight or 'flee' to run.`, 'info');
    }

    attack() {
        if (!this.inCombat) {
            logger.log("You are wandering peacefully.", 'story');
            return;
        }

        // Player turn
        const pDmg = Math.floor(Math.random() * 5) + 1 + (this.game.player.level); // Simple damage formula
        this.enemy.hp -= pDmg;
        logger.log(`You hit the ${this.enemy.name} for ${pDmg} damage!`, 'success');

        if (this.enemy.hp <= 0) {
            this.win();
            return;
        }

        // Enemy turn
        const eDmg = Math.max(0, this.enemy.damage - (this.game.player.defense || 0));
        this.game.player.takeDamage(eDmg);
        logger.log(`The ${this.enemy.name} hits you for ${eDmg} damage!`, 'combat');

        this.render();
    }

    flee() {
        if (!this.inCombat) {
            logger.log("Nothing to flee from.", 'info');
            return;
        }
        if (Math.random() > 0.5) {
            logger.log("You escaped!", 'success');
            this.inCombat = false;
            this.enemy = null;
            this.game.render();
        } else {
            logger.log("Failed to escape!", 'error');
            // Enemy gets a free hit
            const eDmg = this.enemy.damage;
            this.game.player.takeDamage(eDmg);
        }
    }

    win() {
        logger.log(`You defeated the ${this.enemy.name}!`, 'success');
        this.game.player.gainXp(this.enemy.xp);
        this.inCombat = false;
        this.enemy = null;

        // Return to map view
        setTimeout(() => this.game.render(), 1000);
    }

    render() {
        if (!this.inCombat) return;

        // Custom combat render
        logger.br();
        logger.log(`--- COMBAT: ${this.enemy.name} ---`, 'combat');
        logger.log(`Enemy HP: ${this.enemy.hp}`, 'combat');
        logger.log(`Player HP: ${this.game.player.hp}`, 'ui');
        logger.log(`Options: [attack], [flee]`, 'info');
    }
}
