import EventManager from './EventManager.js';
import Input from './Input.js';
import World from '../ecs/World.js';
import MovementSystem from '../systems/MovementSystem.js';
import RenderSystem from '../systems/RenderSystem.js';
import PhysicsSystem from '../systems/PhysicsSystem.js';
import InputSystem from '../systems/InputSystem.js';
import LevelLoader from '../levels/LevelLoader.js';
import LevelManager from '../levels/LevelManager.js';

export default class Game {
    constructor() {
        this.lastTime = 0;
        this.accumulator = 0;
        this.step = 1 / 60;
        this.isRunning = false;

        this.events = new EventManager();
        this.input = new Input();

        // Initialize World
        this.world = new World(this);

        // Add Systems
        this.world.addSystem(new InputSystem(this.input));
        this.world.addSystem(new MovementSystem());
        this.world.addSystem(new PhysicsSystem());
        this.world.addSystem(new RenderSystem());

        // Level Management
        this.levelLoader = new LevelLoader(this.world);
        this.levelManager = new LevelManager(this);
        this.levelManager.loadInitialLevel();
    }

    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.loop.bind(this));
        console.log('Game Started');
    }

    stop() {
        this.isRunning = false;
    }

    loop(timestamp) {
        if (!this.isRunning) return;

        let deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        // Prevent spiral of death
        if (deltaTime > 0.25) deltaTime = 0.25;

        this.accumulator += deltaTime;

        while (this.accumulator >= this.step) {
            this.update(this.step);
            this.accumulator -= this.step;
        }

        this.render(this.accumulator / this.step);

        requestAnimationFrame(this.loop.bind(this));
    }

    update(dt) {
        this.world.update(dt);
    }

    render(alpha) {
        this.world.render(alpha);
    }
}
