import { InputSystem } from './input.js';
import { Renderer } from './renderer.js';
import { Player } from '../entities/player.js';
import { WorldMap } from '../world/map.js';
import { logger } from '../utils/logger.js';
import { CombatSystem } from '../systems/combat.js';
import { InventorySystem } from '../systems/inventory.js';
import { DialogueSystem } from '../data/dialogue.js';

export class Game {
    constructor() {
        this.input = new InputSystem(this);
        this.renderer = new Renderer();
        this.player = new Player();
        this.world = new WorldMap();
        this.combat = new CombatSystem(this);
        this.inventorySystem = new InventorySystem(this);

        this.isRunning = false;

        this.findStartLocation();
        this.initCommands();
    }

    findStartLocation() {
        for (let y = 0; y < this.world.height; y++) {
            for (let x = 0; x < this.world.width; x++) {
                if (this.world.tiles[y][x] === '@') {
                    this.player.x = x;
                    this.player.y = y;
                    this.world.tiles[y][x] = '.';
                    return;
                }
            }
        }
        // Fallback
        this.player.x = 2;
        this.player.y = 2;
    }

    initCommands() {
        // Movement
        this.input.register('north', () => this.move(0, -1), 'Move North');
        this.input.register('south', () => this.move(0, 1), 'Move South');
        this.input.register('east', () => this.move(1, 0), 'Move East');
        this.input.register('west', () => this.move(-1, 0), 'Move West');
        this.input.register('n', () => this.move(0, -1), 'Move North (Alias)');
        this.input.register('s', () => this.move(0, 1), 'Move South (Alias)');
        this.input.register('e', () => this.move(1, 0), 'Move East (Alias)');
        this.input.register('w', () => this.move(-1, 0), 'Move West (Alias)');

        // Actions
        this.input.register('start', () => this.start(), 'Start Game');
        this.input.register('look', () => this.look(), 'Look around');
        this.input.register('map', () => this.render(), 'Show Map');
        this.input.register('help', () => this.help(), 'List Commands');

        this.input.register('attack', () => this.combat.attack(), 'Attack enemy');
        this.input.register('flee', () => this.combat.flee(), 'Flee combat');

        this.input.register('inventory', () => this.player.showInventory(), 'Show Inventory');
        this.input.register('i', () => this.player.showInventory(), 'Inventory (alias)');

        // Advanced: Use module
        this.input.registerModule('use', {
            potion: () => this.inventorySystem.useItem('potion_small'),
            scroll: () => this.inventorySystem.useItem('scroll_fireball'),
        }, 'Use item (use.potion)');

        // Debug
        this.input.register('give_potion', () => this.player.addItem({ id: 'potion_small', name: 'Small Potion', type: 'consumable', effect: { type: 'heal', value: 50 }, desc: 'Heals 50HP' }), 'Debug: Give Potion');
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        logger.clear();
        logger.log("Welcome to ConsoleQuest!", 'success');
        logger.log("You find yourself in a dark dungeon. Escape if you can.", 'story');
        this.player.addItem({ id: 'potion_small', name: 'Small Potion', type: 'consumable', effect: { type: 'heal', value: 20 }, desc: 'Restores 20 HP' });
        this.render();
    }

    move(dx, dy) {
        if (!this.isRunning) { logger.log("Type 'start' to play."); return; }
        if (this.combat.inCombat) { logger.log("You are in combat! You cannot move.", 'combat'); return; }

        const newX = this.player.x + dx;
        const newY = this.player.y + dy;

        if (this.world.isBlocked(newX, newY)) {
            logger.log("Blocked.", 'warning');
        } else {
            this.player.x = newX;
            this.player.y = newY;
            const tile = this.world.getTile(newX, newY);

            // Interaction Check
            // If NPC, don't move into them, just talk? Or move onto them and talk?
            // Let's say we move ONTO them to talk, but stay in place if it's a "block".
            // Actually, usually you bump into them.

            if (tile === 'O') {
                logger.log("Old Man: " + DialogueSystem.speak('old_man'), 'story');
                return; // Don't move
            }
            if (tile === 'M') {
                logger.log("Merchant: " + DialogueSystem.speak('merchant'), 'story');
                return; // Don't move
            }

            // Move
            this.player.x = newX;
            this.player.y = newY; // Commit move

            // Post-move interactions (pickups, combat)
            if (tile === 'T') {
                logger.log("You found a Treasure Chest!", 'success');
                this.player.gold += 50;
                this.player.addItem({ id: 'scroll_fireball', name: 'Scroll of Fireball', type: 'consumable', effect: { type: 'damage', value: 50 }, desc: 'Burn enemies.' });
                this.world.setTile(newX, newY, '.');
            } else if (tile === 'g') {
                this.combat.start('goblin');
                this.world.setTile(newX, newY, '.');
            } else if (tile === 'S') {
                this.combat.start('skeleton');
                this.world.setTile(newX, newY, '.');
            }
        }
        this.render();
    }

    getDirectionName(dx, dy) {
        if (dy < 0) return "North";
        if (dy > 0) return "South";
        if (dx > 0) return "East";
        if (dx < 0) return "West";
        return "somewhere";
    }

    look() {
        this.render();
        logger.log("You look around. It's dark and full of ASCII.", 'story');
    }

    help() {
        setTimeout(() => {
            logger.header("COMMANDS");
            console.table(this.input.commands);
        }, 10);
    }

    render() {
        if (this.combat.inCombat) {
            this.combat.render();
        } else {
            requestAnimationFrame(() => {
                this.renderer.draw({
                    player: this.player,
                    map: this.world.tiles,
                    messageLog: []
                });
            });
        }
    }
}
