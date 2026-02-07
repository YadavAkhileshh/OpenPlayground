/**
 * TitleBarCinema - WorldManager.js
 * 
 * ============================================================================
 * ARCHITECTURAL OVERVIEW
 * ============================================================================
 * The WorldManager module is the lifecycle controller for all non-player 
 * entities. It handles the procedural generation, movement, and cleanup 
 * of obstacles (barriers, birds, rocks).
 * 
 * It manages a conceptual "infinite conveyor belt" that moves from 
 * right to left, matching the player's apparent forward velocity.
 * 
 * Major responsibilities:
 * 1. Procedural Spawning: Using probability to create obstacles at intervals.
 * 2. Lifecycle Management: Deleting entities once they pass the viewport.
 * 3. Environment Consistency: Ensuring obstacles match the current level.
 * 
 * ============================================================================
 * MODULE METADATA
 * ============================================================================
 * @project TitleBarCinema
 * @module Logic.WorldManager
 * @version 1.0.0
 * @author Antigravity
 */

import { Entity } from './Entity.js';
import { CONFIG, SPRITES } from '../core/Constants.js';

/**
 * @class WorldManager
 * @description Manages obstacles and environment generation.
 */
export class WorldManager {
    /**
     * @constructor
     * Initializes the obstacle pool and spawning timers.
     */
    constructor() {
        /** 
         * @public @type {Array<Entity>} 
         * Active obstacles currently being simulated and rendered.
         */
        this.obstacles = [];

        /** @private @type {number} Timestamp of the last successful spawn */
        this.lastSpawnTime = 0;

        /** 
         * @private @type {number} 
         * Minimum ticks required between obstacle spawns to avoid clutter.
         */
        this.minSpawnInterval = 10;

        /** @private @type {number} Viewport width inherited from config */
        this.viewportWidth = CONFIG.WORLD_LENGTH;
    }

    /**
     * Primary update loop for the world ecosystem.
     * Moves all active entities and attempts to generate new ones.
     * @returns {void}
     */
    update() {
        // 1. Kinetic Update for Obstacles
        this.obstacles.forEach(obstacle => {
            // Obstacles move left relative to the player
            obstacle.x -= CONFIG.SCROLL_SPEED;
            obstacle.update();
        });

        // 2. Cleanup Stage
        // We remove obstacles that have passed the left-bound of the "title"
        const removalBuffer = 5;
        this.obstacles = this.obstacles.filter(obstacle => {
            return obstacle.x > -removalBuffer;
        });

        // 3. Generation Stage
        this.trySpawnObstacle();
    }

    /**
     * Evaluates whether a new obstacle should be injected into the stream.
     * Considers both temporal constraints and randomized probability.
     * @private
     * @returns {void}
     */
    trySpawnObstacle() {
        // Check if enough time has passed based on the interval
        const timeSinceLast = performance.now() - this.lastSpawnTime;
        const intervalMs = this.minSpawnInterval * CONFIG.TITLE_UPDATE_INTERVAL;

        const canSpawn = timeSinceLast > intervalMs;
        const shouldSpawn = Math.random() < CONFIG.OBSTACLE_SPAWN_RATE;

        if (canSpawn && shouldSpawn) {
            this.spawnObstacle();
            this.lastSpawnTime = performance.now();
        }
    }

    /**
     * Instantiates a new Entity and adds it at the far right of the viewport.
     * Selects obstacle type randomly from the available sprite pool.
     * @returns {void}
     */
    spawnObstacle() {
        const typeSelection = Math.random();
        let sprite;
        let y = 0;

        // Variety Logic
        if (typeSelection > 0.8) {
            sprite = SPRITES.BIRD;
            y = -1; // Aerial obstacle (requires jumping or ducking space)
        } else if (typeSelection > 0.4) {
            sprite = SPRITES.BARRIER;
            y = 0; // Ground barrier
        } else {
            sprite = SPRITES.ROCK;
            y = 0; // Ground rock
        }

        // Place at the right edge of the title bar
        const obstacle = new Entity(this.viewportWidth - 1, y, sprite);
        this.obstacles.push(obstacle);
    }

    /**
     * Purges all active entities from the world.
     * Use during game reset or level transitions.
     * @returns {void}
     */
    reset() {
        this.obstacles = [];
        this.lastSpawnTime = 0;
    }

    /**
     * Changes the viewport width dynamically.
     * @param {number} width - New width in characters.
     */
    setViewportWidth(width) {
        this.viewportWidth = width;
    }
}
