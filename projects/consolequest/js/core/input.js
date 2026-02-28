import { logger } from '../utils/logger.js';

export class InputSystem {
    constructor(game) {
        this.game = game;
        this.commands = new Map();
    }

    /**
     * Registers a command that can be triggered by typing its name in the console.
     * @param {string} name - The command name (e.g., 'north').
     * @param {Function} callback - The function to execute.
     * @param {string} description - Help text for the command.
     */
    register(name, callback, description) {
        if (this.commands.has(name)) {
            logger.log(`Warning: Command '${name}' is being overwritten.`, 'warning');
        }

        this.commands.set(name, description);

        Object.defineProperty(window, name, {
            get: () => {
                callback();
                return '>';
            },
            configurable: true
        });
    }

    /**
     * Registers a module object with sub-commands (getters).
     * Example: registerModule('use', { potion: () => ... }) allows 'use.potion'
     */
    registerModule(name, gettersMap, description) {
        this.commands.set(name, description || 'Sub-system');

        const moduleObj = {};

        for (const [key, callback] of Object.entries(gettersMap)) {
            Object.defineProperty(moduleObj, key, {
                get: () => {
                    callback();
                    return '>';
                },
                enumerable: true
            });
        }

        Object.defineProperty(window, name, {
            get: () => moduleObj,
            configurable: true
        });
    }

    getHelp() {
        const helpList = [];
        this.commands.forEach((desc, name) => {
            helpList.push(`${name.padEnd(10)} : ${desc}`);
        });
        return helpList;
    }
}
