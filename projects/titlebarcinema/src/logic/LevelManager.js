/**
 * TitleBarCinema - LevelManager.js
 * 
 * This module governs the progression system of the game. It 
 * monitors the player's score and dynamically adjusts game 
 * parameters such as scroll speed, obstacle density, and 
 * visual themes to increase difficulty over time.
 *
 * @project TitleBarCinema
 * @version 1.0.0
 * @author Antigravity
 */

import { WORLD, SPRITES, CONFIG } from '../core/Constants.js';
import { Logger } from '../core/Logger.js';

export class LevelManager {
    /**
     * @param {ScoreSystem} scoreSystem - Reference to the score system.
     * @param {WorldManager} worldManager - Reference to the world manager.
     */
    constructor(scoreSystem, worldManager) {
        this.scoreSystem = scoreSystem;
        this.worldManager = worldManager;
        this.logger = new Logger('LevelManager');

        this.currentLevel = 1;
        this.difficultyMultiplier = 1.0;
        this.baseSpeed = CONFIG.SCROLL_SPEED;
        this.baseSpawnRate = CONFIG.OBSTACLE_SPAWN_RATE;

        // Define level thresholds and their effects
        this.levels = [
            { threshold: 0, ground: "_", sky: " ", multiplier: 1.0 },
            { threshold: 500, ground: "=", sky: ".", multiplier: 1.2 },
            { threshold: 1500, ground: "#", sky: "*", multiplier: 1.5 },
            { threshold: 3000, ground: "~", sky: " ", multiplier: 1.8 },
            { threshold: 5000, ground: "-", sky: "!", multiplier: 2.2 }
        ];
    }

    /**
     * Updates the level logic based on the current score.
     */
    update() {
        const score = this.scoreSystem.score;
        let targetLevel = 1;

        // Find the appropriate level for the current score
        for (let i = this.levels.length - 1; i >= 0; i--) {
            if (score >= this.levels[i].threshold) {
                targetLevel = i + 1;
                break;
            }
        }

        // Check if a level up has occurred
        if (targetLevel > this.currentLevel) {
            this.handleLevelUp(targetLevel);
        }
    }

    /**
     * Transition the game state to a new level.
     * @param {number} newLevel - The level index to transition to.
     */
    handleLevelUp(newLevel) {
        this.currentLevel = newLevel;
        const levelData = this.levels[newLevel - 1];

        this.difficultyMultiplier = levelData.multiplier;

        // Update global configurations dynamically
        CONFIG.SCROLL_SPEED = this.baseSpeed * this.difficultyMultiplier;
        CONFIG.OBSTACLE_SPAWN_RATE = this.baseSpawnRate * (this.difficultyMultiplier * 0.8);

        // Update environmental ASCII
        WORLD.GROUND = levelData.ground;
        WORLD.SKY = levelData.sky;

        this.logger.success(`Level Up! Now at Level ${this.currentLevel}. Ground: ${WORLD.GROUND}, Speed: ${CONFIG.SCROLL_SPEED.toFixed(2)}`);
    }

    /**
     * Resets the level manager to its initial state.
     */
    reset() {
        this.currentLevel = 1;
        this.difficultyMultiplier = 1.0;
        CONFIG.SCROLL_SPEED = this.baseSpeed;
        CONFIG.OBSTACLE_SPAWN_RATE = this.baseSpawnRate;
        WORLD.GROUND = "_";
        WORLD.SKY = " ";
        this.logger.info("Level Manager Reset.");
    }

    /**
     * Returns the name of the current environment.
     * @returns {string}
     */
    getEnvironmentName() {
        const names = ["Desert", "Plains", "Mountain", "Ocean", "Void"];
        return names[(this.currentLevel - 1) % names.length];
    }
}
