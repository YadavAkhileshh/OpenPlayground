import { Loop } from './Loop.js';
import { Renderer } from '../graphics/Renderer.js';
import { InputHandler } from '../input/InputHandler.js';
import { PhysicsEngine } from '../physics/PhysicsEngine.js';
import { UIManager } from '../ui/UIManager.js';
import { LevelManager } from '../levels/LevelManager.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Initialize core systems
        this.loop = new Loop(this.update.bind(this), this.render.bind(this));
        // Pass the game instance to InputHandler if access to camera or other systems is needed
        this.input = new InputHandler(this.canvas, this); 
        this.renderer = new Renderer(this.ctx, this.canvas.width, this.canvas.height);
        this.physics = new PhysicsEngine();
        this.ui = new UIManager();
        this.levelManager = new LevelManager(this);

        this.init();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.renderer) {
            this.renderer.resize(this.canvas.width, this.canvas.height);
        }
    }

    init() {
        // Setup UI event listeners
        document.getElementById('start-btn').addEventListener('click', () => {
            this.start();
        });
        
        document.getElementById('next-level-btn').addEventListener('click', () => {
            this.levelManager.nextLevel();
            this.ui.hideGameOver();
        });
    }

    start() {
        this.ui.hideStartScreen();
        this.levelManager.loadLevel(1);
        this.loop.start();
    }

    update(dt) {
        // Update physics
        this.physics.update(dt);
        
        // Update entities
        this.levelManager.activeLevel?.update(dt);

        // Process inputs
        const gestures = this.input.getGestures();
        if (gestures.length > 0) {
            this.handleGestures(gestures);
        }
    }

    render() {
        this.renderer.clear();
        
        // Render world
        this.levelManager.activeLevel?.render(this.renderer);
        
        // Render debug physics
        // this.physics.renderDebug(this.renderer);

        // Render input trails
        this.renderer.drawInputTrail(this.input.currentStroke);
    }

    handleGestures(gestures) {
        for (const gesture of gestures) {
            if (gesture.type === 'circle') {
                console.log('Circle detected!', gesture.center, gesture.radius);
                this.levelManager.activeLevel?.onCircleGesture(gesture);
            }
        }
        this.input.clearGestures();
    }
}

// Start the game instance
window.game = new Game();
