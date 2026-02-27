/**
 * LevelManager.js
 * 
 * Handles level progression and enemy spawning.
 */

import { LEVELS } from '../data/Levels.js';
import { GameEvents } from '../core/EventManager.js';
import { EVENTS, GAME_CONFIG } from '../core/Constants.js';
import { Utils } from '../core/Utils.js';

export class LevelManager {
    constructor() {
        this.currentLevelIndex = 0;
        this.currentLevelData = null;
        this.waveTimer = 0;
        this.spawnQueue = [];
        this.isLevelActive = false;
    }

    startLevel(index) {
        if (index >= LEVELS.length) {
            // Victory or Loop
            GameEvents.emit(EVENTS.MESSAGE_LOGGED, "All levels completed! Looping...");
            this.currentLevelIndex = 0;
        } else {
            this.currentLevelIndex = index;
        }

        this.currentLevelData = LEVELS[this.currentLevelIndex];
        this.spawnQueue = this.parseEnemies(this.currentLevelData.enemies);
        this.isLevelActive = true;
        this.waveTimer = 0;

        GameEvents.emit(EVENTS.MESSAGE_LOGGED, `Level ${this.currentLevelData.id}: ${this.currentLevelData.name}`);
        GameEvents.emit(EVENTS.MESSAGE_LOGGED, this.currentLevelData.startMessage);
    }

    parseEnemies(enemyConfig) {
        // Flatten the config into a time-ordered queue
        const queue = [];
        let baseTime = 0;

        enemyConfig.forEach(group => {
            baseTime += group.delay;
            for (let i = 0; i < group.count; i++) {
                queue.push({
                    type: group.type,
                    time: baseTime + (i * 1000) // Stagger spawn slightly
                });
            }
        });

        return queue.sort((a, b) => a.time - b.time);
    }

    update(dt) {
        if (!this.isLevelActive) return;

        this.waveTimer += dt * 1000;

        // Check for spawns
        while (this.spawnQueue.length > 0 && this.spawnQueue[0].time <= this.waveTimer) {
            const spawnParams = this.spawnQueue.shift();
            this.spawnEnemy(spawnParams.type);
        }

        // Check level completion (no enemies left in queue AND no enemies alive)
        // This check usually needs access to the entity list, so we might need GameManager to trigger 'LevelComplete'
        // Or we emit a 'QueueEmpty' event.
        if (this.spawnQueue.length === 0) {
            // We let GameManager decide when the level is actually over (when all enemies are dead)
        }
    }

    spawnEnemy(type) {
        // Pick a random spot on the edge of the screen
        let x, y;
        const side = Utils.randomInt(0, 3);
        const padding = 50;

        switch (side) {
            case 0: // Top
                x = Utils.randomInt(0, GAME_CONFIG.WIDTH);
                y = -padding;
                break;
            case 1: // Right
                x = GAME_CONFIG.WIDTH + padding;
                y = Utils.randomInt(0, GAME_CONFIG.HEIGHT);
                break;
            case 2: // Bottom
                x = Utils.randomInt(0, GAME_CONFIG.WIDTH);
                y = GAME_CONFIG.HEIGHT + padding;
                break;
            case 3: // Left
                x = -padding;
                y = Utils.randomInt(0, GAME_CONFIG.HEIGHT);
                break;
        }

        GameEvents.emit(EVENTS.ENTITY_BUILT, {
            type: 'ENEMY',
            subType: type,
            x,
            y
        });
    }
}
