/**
 * TitleBarCinema - main.js
 * 
 * ============================================================================
 * ARCHITECTURAL OVERVIEW
 * ============================================================================
 * The main entry point for the TitleBarCinema application. This module 
 * acts as the "Director" of the movie, orchestrating the communication 
 * between all engine subsystems:
 * 
 * 1. Core Engine: Timer, Renderer, Logger.
 * 2. Physics & Logic: Entity, PhysicsEngine, CollisionManager.
 * 3. Gameplay Systems: WorldManager, LevelManager, ScoreSystem, InputHandler.
 * 
 * The orchestration follows a classic Game Loop pattern:
 * - Initialize all components.
 * - Set up event listeners (UI and Input).
 * - Standard Loop: Physics -> World -> Logic -> Collision -> Level -> Render.
 * 
 * ============================================================================
 * MODULE METADATA
 * ============================================================================
 * @project TitleBarCinema
 * @module Main
 * @version 1.0.0
 * @stability Production-Ready
 * @author Antigravity
 */

import { CONFIG, STATE, SELECTORS, MESSAGES, SPRITES } from './core/Constants.js';
import { GameTimer } from './core/Timer.js';
import { Renderer } from './core/Renderer.js';
import { Logger } from './core/Logger.js';
import { Entity } from './logic/Entity.js';
import { PhysicsEngine } from './logic/Physics.js';
import { FrameManager } from './logic/FrameManager.js';
import { CollisionManager } from './logic/CollisionManager.js';
import { WorldManager } from './logic/WorldManager.js';
import { ScoreSystem } from './logic/ScoreSystem.js';
import { LevelManager } from './logic/LevelManager.js';
import { InputHandler } from './logic/InputHandler.js';

/**
 * @class TitleBarCinema
 * @description The main controller class for the entire application.
 */
class TitleBarCinema {
    /**
     * @constructor
     * Instantiates all subsystems and prepares the initial state.
     */
    constructor() {
        /** @private @type {Logger} Master engine logger */
        this.logger = new Logger('MainEngine');

        // --------------------------------------------------------------------
        // Core Engine Components
        // --------------------------------------------------------------------
        /** @private @type {Renderer} Title bar renderer */
        this.renderer = new Renderer();

        /** @private @type {PhysicsEngine} Global physics manager */
        this.physics = new PhysicsEngine();

        /** @private @type {GameTimer} Heartbeat timer */
        this.timer = new GameTimer(() => this.tick(), CONFIG.TITLE_UPDATE_INTERVAL);

        // --------------------------------------------------------------------
        // Logic & Interaction Components
        // --------------------------------------------------------------------
        /** @private @type {FrameManager} State-based ASCII frame manager */
        this.frameManager = new FrameManager();

        /** @private @type {WorldManager} Procedural obstacle manager */
        this.worldManager = new WorldManager();

        /** @private @type {CollisionManager} Hit-detection system */
        this.collisionManager = new CollisionManager(this.physics);

        /** @private @type {ScoreSystem} Progression tracking system */
        this.scoreSystem = new ScoreSystem();

        /** @private @type {LevelManager} Difficulty scaling system */
        this.levelManager = new LevelManager(this.scoreSystem, this.worldManager);

        /** @private @type {InputHandler} User interaction handler */
        this.input = new InputHandler();

        // --------------------------------------------------------------------
        // Game State Variables
        // --------------------------------------------------------------------
        /** @private @type {Entity} The central player character */
        this.player = new Entity(CONFIG.PLAYER_START_X, 0, SPRITES.RUN[0]);

        /** @public @type {string} Current game state (IDLE, PLAYING, etc.) */
        this.gameState = STATE.IDLE;

        this.init();
    }

    /**
     * Initializes the engine and wires up events.
     * @returns {void}
     */
    init() {
        this.logger.info("Initializing TitleBarCinema Engine...");

        // 1. Setup Collision Callback
        this.collisionManager.setCollisionListener((obstacle) => {
            this.handleGameOver();
        });

        // 2. Setup Input Handlers
        this.input.setJumpListener(() => this.handleJump());
        this.input.setPauseListener(() => this.togglePause());

        // 3. Setup UI Interaction
        this.setupUI();

        // 4. Initial Render
        this.renderIdle();

        this.logger.success("Engine ready.");
    }

    /**
     * Bind DOM elements to engine actions.
     * @private
     */
    setupUI() {
        const btnPlay = document.querySelector(SELECTORS.BTN_PLAY);
        const btnPause = document.querySelector(SELECTORS.BTN_PAUSE);
        const btnReset = document.querySelector(SELECTORS.BTN_RESET);

        if (btnPlay) btnPlay.addEventListener('click', () => this.start());
        if (btnPause) btnPause.addEventListener('click', () => this.togglePause());
        if (btnReset) btnReset.addEventListener('click', () => this.reset());
    }

    /**
     * Starts or restarts the "movie".
     * Transitions from IDLE/GAMEOVER to PLAYING.
     * @returns {void}
     */
    start() {
        if (this.gameState === STATE.PLAYING) return;

        if (this.gameState === STATE.GAMEOVER) {
            this.reset();
        }

        this.gameState = STATE.PLAYING;
        this.timer.start();
        this.logger.info("Game Loop Started.");
    }

    /**
     * Toggles the pause state of the engine.
     * Suspends physics and logic updates but retains state.
     * @returns {void}
     */
    togglePause() {
        if (this.gameState === STATE.PLAYING) {
            this.gameState = STATE.PAUSED;
            this.timer.stop();
            this.renderer.render(MESSAGES.PAUSED);
            this.logger.info("Engine Paused.");
        } else if (this.gameState === STATE.PAUSED) {
            this.gameState = STATE.PLAYING;
            this.timer.start();
            this.logger.info("Engine Resumed.");
        }
    }

    /**
     * Processes the player jump command.
     * Only allows jumping if the player is currently on the ground.
     * @returns {void}
     */
    handleJump() {
        if (this.gameState === STATE.PLAYING && this.player.isGrounded) {
            this.player.velocityY = CONFIG.JUMP_FORCE;
            this.player.isGrounded = false;
            this.logger.info("Jump trigger!");
        } else if (this.gameState === STATE.IDLE || this.gameState === STATE.GAMEOVER) {
            this.start();
        }
    }

    /**
     * Main engine tick function.
     * Called by the Timer at a fixed interval (e.g., 150ms).
     * @returns {void}
     */
    tick() {
        if (this.gameState !== STATE.PLAYING) return;

        // 1. Kinetic Calculations
        this.physics.applyGravity(this.player);
        this.player.update();
        this.physics.resolveGround(this.player);

        // 2. Environment Update
        this.worldManager.update();

        // 3. Animation State Selection
        this.frameManager.update();
        this.player.sprite = this.frameManager.getPlayerSprite(this.player);

        // 4. Interaction Resolution
        this.collisionManager.checkPlayerCollisions(this.player, this.worldManager.obstacles);

        // 5. Progression Scaling
        this.scoreSystem.update(CONFIG.SCROLL_SPEED * 0.1);
        this.levelManager.update();

        // 6. Visual Production
        this.renderFrame();
    }

    /**
     * Orchestrates the final visual composition for the browser title.
     * @returns {void}
     */
    renderFrame() {
        this.renderer.clear();

        // Layer 1: Player Entity
        this.renderer.draw(Math.round(this.player.x), this.player.sprite);

        // Layer 2: World Obstacles
        this.worldManager.obstacles.forEach(obs => {
            this.renderer.draw(Math.round(obs.x), obs.sprite);
        });

        // Layer 3: UI Overlays (Stats)
        const stats = this.renderer.formatStats(this.scoreSystem.score, this.scoreSystem.distance);
        this.renderer.render(stats);
    }

    /**
     * Resets the UI and Renderer to the initial splash state.
     * @returns {void}
     */
    renderIdle() {
        this.renderer.render(MESSAGES.WELCOME);
    }

    /**
     * Triggers the game over sequence.
     * Stops the timer and records high scores.
     * @returns {void}
     */
    handleGameOver() {
        this.gameState = STATE.GAMEOVER;
        this.timer.stop();
        this.scoreSystem.checkHighScore();

        this.logger.warn("GAME OVER detected.");

        // Render final death frame immediately
        this.player.sprite = SPRITES.CRASH;
        this.renderFrame();

        // Visual delay before showing restart prompt
        setTimeout(() => {
            if (this.gameState === STATE.GAMEOVER) {
                this.renderer.render(MESSAGES.GAME_OVER);
            }
        }, 1000);
    }

    /**
     * Full system reset to factory defaults.
     * @returns {void}
     */
    reset() {
        this.logger.info("Resetting entire engine state...");

        this.timer.stop();
        this.player.reset(CONFIG.PLAYER_START_X, 0);
        this.worldManager.reset();
        this.scoreSystem.reset();
        this.levelManager.reset();
        this.frameManager.reset();

        this.gameState = STATE.IDLE;
        this.renderIdle();
    }
}

/**
 * Entry Point - Application Bootstrap
 */
window.addEventListener('DOMContentLoaded', () => {
    // Expose instance to window for debugging if needed
    window.gameEngine = new TitleBarCinema();
});
