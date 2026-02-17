import { logger } from '../utils/logger.js';

export class Player {
    constructor() {
        this.name = 'Hero';
        this.hp = 100;
        this.maxHp = 100;
        this.xp = 0;
        this.level = 1;
        this.gold = 0;

        // Position
        this.x = 2;
        this.y = 2;
        this.locationName = 'The Void';

        this.inventory = [];
        this.equipment = {
            weapon: null,
            armor: null
        };
    }

    heal(amount) {
        this.hp = Math.min(this.hp + amount, this.maxHp);
        logger.log(`You regained ${amount} HP. Current HP: ${this.hp}/${this.maxHp}`, 'success');
    }

    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
        logger.log(`You took ${amount} damage! Current HP: ${this.hp}/${this.maxHp}`, 'error');
        if (this.hp === 0) {
            logger.log("You have died...", 'error');
            // Allow Game class to handle death logic via state check
        }
    }

    gainXp(amount) {
        this.xp += amount;
        logger.log(`Gained ${amount} XP.`, 'success');
        if (this.xp >= this.level * 100) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.maxHp += 20;
        this.hp = this.maxHp;
        logger.header(`LEVEL UP! You are now level ${this.level}!`);
    }

    addItem(item) {
        this.inventory.push(item);
        logger.log(`Added ${item.name} to inventory.`, 'item');
    }

    removeItem(itemName) {
        const index = this.inventory.findIndex(i => i.name.toLowerCase() === itemName.toLowerCase() || i.id === itemName);
        if (index > -1) {
            const item = this.inventory[index];
            this.inventory.splice(index, 1);
            return item;
        }
        return null;
    }

    findItem(itemName) {
        return this.inventory.find(i => i.name.toLowerCase() === itemName.toLowerCase() || i.id === itemName);
    }

    showInventory() {
        if (this.inventory.length === 0) {
            logger.log("Your inventory is empty.", 'info');
            return;
        }

        logger.header("INVENTORY");
        this.inventory.forEach(item => {
            logger.log(`- ${item.name}: ${item.desc}`, 'item');
        });
        logger.br();
        logger.log("To use an item, use the global 'use' object. E.g. `use.potion`", 'info');
    }
}
