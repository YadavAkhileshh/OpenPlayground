/**
 * GameManager.js
 * 
 * The central brain of the game.
 * Initializes systems, maintains game state, and orchestrates the loop.
 */

import { GameLoop } from '../core/GameLoop.js';
import { GameEvents } from '../core/EventManager.js';
import { InputHandler } from '../core/InputHandler.js';
import { Utils } from '../core/Utils.js';
import { EVENTS, GAME_CONFIG } from '../core/Constants.js';

import { PhysicsSystem } from '../systems/PhysicsSystem.js';
import { RenderSystem } from '../systems/RenderSystem.js';
import { ParticleSystem } from '../systems/ParticleSystem.js';
import { AudioSystem } from '../systems/AudioSystem.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';

import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';

import { LevelManager } from './LevelManager.js';
import { UIManager } from '../ui/UIManager.js';

export class GameManager {
    constructor() {
        this.entities = [];
        this.score = 0;
        this.state = 'MENU'; // MENU, PLAYING, GAMEOVER

        // Systems
        this.physicsSystem = new PhysicsSystem();
        this.renderSystem = new RenderSystem('game-canvas');
        this.particleSystem = new ParticleSystem();
        this.audioSystem = new AudioSystem();
        this.collisionSystem = new CollisionSystem();

        // Managers
        this.levelManager = new LevelManager();
        this.uiManager = new UIManager();
        this.inputHandler = new InputHandler();

        // Loop
        this.gameLoop = new GameLoop(
            this.update.bind(this),
            this.render.bind(this)
        );

        this.setupEventListeners();
    }

    init() {
        this.inputHandler.init();

        // Hook into start button if present (handled by main.js or separate logic usually,
        // but let's assume global event)
        // For simplicity, ANY input starts game if in MENU
        const startGameListener = () => {
            if (this.state === 'MENU' || this.state === 'GAMEOVER') {
                this.startGame();
            }
        };

        GameEvents.on(EVENTS.INPUT_MOVE, startGameListener);
        GameEvents.on(EVENTS.INPUT_ATTACK, startGameListener);
        GameEvents.on(EVENTS.INPUT_DASH, startGameListener);

        this.gameLoop.start();
        GameEvents.emit(EVENTS.MESSAGE_LOGGED, "Welcome! Short Press to Start.");
    }

    setupEventListeners() {
        GameEvents.on(EVENTS.ENTITY_BUILT, (data) => this.spawnEntity(data));
        GameEvents.on(EVENTS.ENTITY_DESTROYED, (entity) => this.removeEntity(entity));
        GameEvents.on(EVENTS.PLAYER_ATTACKED, (data) => this.handlePlayerAttack(data));
        GameEvents.on(EVENTS.GAME_RESET, () => this.resetGame());
    }

    startGame() {
        if (this.state === 'PLAYING') return;

        this.resetGame();
        this.state = 'PLAYING';
        GameEvents.emit(EVENTS.GAME_START);

        // Spawn Player
        const player = new Player(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2);
        this.entities.push(player);

        this.levelManager.startLevel(0);
    }

    resetGame() {
        this.entities = [];
        this.score = 0;
        // Particle system reset?
    }

    gameOver() {
        this.state = 'GAMEOVER';
        GameEvents.emit(EVENTS.GAME_OVER, this.score);
        this.inputHandler.resetClickCount();
    }

    spawnEntity(data) {
        if (data.type === 'ENEMY') {
            const enemy = new Enemy(data.x, data.y, data.subType);
            this.entities.push(enemy);
        }
    }

    removeEntity(entity) {
        entity.markedForDeletion = true;

        // Particle Explosion
        this.particleSystem.emit(entity.x, entity.y, 10, { color: entity.components.render.color });

        if (entity.type === 'PLAYER') {
            this.gameOver();
        } else if (entity.type === 'ENEMY') {
            this.score += 100;
            GameEvents.emit(EVENTS.SCORE_UPDATED, this.score);
        }
    }

    handlePlayerAttack(data) {
        // Visual effect
        this.particleSystem.emit(data.x, data.y, 20, {
            color: '#e53e3e',
            speed: 5,
            life: 30
        });

        // Logic handled in CollisionSystem mostly, but could do distance checks here too if needed
    }

    update(dt) {
        if (this.state !== 'PLAYING') return;

        // Managers
        this.levelManager.update(dt);

        // Systems
        this.physicsSystem.update(this.entities, dt);
        this.collisionSystem.update(this.entities);
        // this.audioSystem.update(dt); // Not needed for web audio usually
        this.particleSystem.update();

        // Entities Control (AI / Player Input processing updates)
        const player = this.entities.find(e => e.type === 'PLAYER');
        this.entities.forEach(entity => {
            if (entity.update) {
                // Pass player to enemies for AI targeting
                entity.update(dt, player);
            }
        });

        // Cleanup
        this.entities = this.entities.filter(e => !e.markedForDeletion);

        // UI Updates
        if (player && player.components.health) {
            GameEvents.emit('UPDATE_UI', {
                health: player.components.health.current,
                level: this.levelManager.currentLevelIndex + 1
            });
        }

        // Check Level Win Condition (if no enemies and queue empty)
        // Simplified: if queue empty and no enemies, next level
        if (this.levelManager.spawnQueue.length === 0 && !this.entities.some(e => e.type === 'ENEMY')) {
            // Delay slightly
            if (!this.levelTransitionTimer) this.levelTransitionTimer = 0;
            this.levelTransitionTimer += dt;
            if (this.levelTransitionTimer > 2) {
                this.levelManager.startLevel(this.levelManager.currentLevelIndex + 1);
                this.levelTransitionTimer = 0;
            }
        }
    }

    render(alpha) {
        // Always render, even if menu (background?)
        this.renderSystem.render(this.entities, this.particleSystem, { dt: 0.016 }); // alpha passed if needed
    }
}
