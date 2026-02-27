/**
 * Game.js
 * Main entry point. Initializes systems and starts the loop.
 */

import { Settings, GameStates, Events } from './Settings.js';
import { Loop } from './Loop.js';
import { InputHandler } from './InputHandler.js';
import { eventManager } from './EventManager.js'; // Singleton
import { AssetLoader } from './AssetLoader.js';

// placeholders for now
import { UIManager } from '../ui/UIManager.js';
import { PhysicsSystem } from '../systems/PhysicsSystem.js';
import { WorldGenerator } from '../systems/WorldGenerator.js';
import { Renderer } from '../visuals/Renderer.js';
import { Camera } from '../systems/Camera.js';
import { Player } from '../entities/Player.js';
import { ScoreManager } from '../logic/ScoreManager.js';
import { EffectsSystem } from '../visuals/EffectsSystem.js';

import { Background } from '../visuals/Background.js';
import { SoundManager } from '../audio/SoundManager.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.state = GameStates.LOADING;

        this.input = new InputHandler();
        this.loader = new AssetLoader();
        this.ui = new UIManager();

        this.camera = new Camera();
        this.renderer = new Renderer(this.ctx, this.camera);

        this.world = new WorldGenerator();
        this.physics = new PhysicsSystem();
        this.effects = new EffectsSystem();
        this.scoreManager = new ScoreManager();
        this.background = new Background();
        this.soundManager = new SoundManager();

        this.player = new Player(Settings.PLAYER_START_X, 0);

        this.loop = new Loop(this.update.bind(this), this.render.bind(this));
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        eventManager.emit(Events.WINDOW_RESIZE, { width: this.canvas.width, height: this.canvas.height });
    }

    async init() {
        // Load assets
        await this.loader.loadAll();

        // Hide loading screen, show menu
        this.state = GameStates.MENU;
        this.ui.showStartScreen();
        this.setupEventListeners();

        // Start loop
        this.loop.start();

        console.log('Ink Runner initialized');
    }

    setupEventListeners() {
        eventManager.on(Events.GAME_START, () => {
            console.log('Game Started');
            this.state = GameStates.PLAYING;
            this.resetGame();
        });

        eventManager.on(Events.GAME_OVER, (data) => {
            this.state = GameStates.GAME_OVER;
            // Stop physics, maybe slowmo
        });

        // Link player events to effects
        eventManager.on(Events.PLAYER_JUMP, () => {
            this.effects.spawnParticles(this.player.x + this.player.width / 2, this.player.y + this.player.height, 5, '#2c3e50');
        });

        eventManager.on(Events.PLAYER_LAND, () => {
            this.effects.spawnParticles(this.player.x + this.player.width / 2, this.player.y + this.player.height, 10, '#2c3e50');
        });
    }

    resetGame() {
        this.player = new Player(Settings.PLAYER_START_X, 200);
        this.world = new WorldGenerator();
        this.camera.x = 0;
        this.camera.y = 0;
        this.scoreManager.reset();
        eventManager.emit(Events.GAME_RESET);
    }

    update(dt) {
        if (this.state !== GameStates.PLAYING) return;

        this.activeEntities = [this.player, ...this.world.strokes];

        this.player.update(dt);
        this.physics.update(dt, [this.player]); // Apply gravity/velocity
        this.physics.checkGroundCollision(this.player, this.world.strokes);

        this.world.update(dt, this.player.x);
        this.effects.update(dt);

        this.camera.follow(this.player);
        this.scoreManager.update(dt, this.player.vx);
    }

    render(dt) {
        // Clear screen
        this.ctx.fillStyle = Settings.BACKGROUND_COLOR;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render Background
        if (this.background) {
            this.background.draw(this.ctx, this.camera.x);
        }

        if (this.state === GameStates.MENU || this.state === GameStates.GAME_OVER) {
            // Maybe render a background idle anim?
        }

        // Render systems
        this.renderer.render(this.world, this.player, this.effects.particles);
    }
}

// Start the game
const game = new Game();
game.init();
