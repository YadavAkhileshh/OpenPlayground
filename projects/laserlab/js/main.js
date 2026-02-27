/**
 * Main Entry Point
 */
import { Scene } from './engine/scene.js';
import { Raycaster } from './engine/raycaster.js';
import { GameLoop } from './engine/loop.js';
import { Renderer } from './ui/renderer.js';
import { Input } from './ui/input.js';
import { HUD } from './ui/hud.js';
import { Levels } from './data/levels.js';

// Components
import { Laser } from './components/laser.js';
import { Mirror } from './components/mirror.js';
import { Lens } from './components/lens.js';
import { Prism } from './components/prism.js';
import { Wall } from './components/wall.js';
import { Target } from './components/target.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('lab-canvas');
        this.resize();

        this.scene = new Scene();
        this.renderer = new Renderer(this.canvas);
        this.raycaster = new Raycaster(this.scene);
        this.hud = new HUD();
        this.input = new Input(this.canvas, this.scene);

        this.currentLevel = 0;
        this.loadLevel(this.currentLevel);

        this.loop = new GameLoop(
            this.update.bind(this),
            this.render.bind(this)
        );

        window.addEventListener('resize', () => this.resize());

        // UI Bindings
        document.getElementById('reset-level').addEventListener('click', () => this.loadLevel(this.currentLevel));
        document.getElementById('prev-level').addEventListener('click', () => this.changeLevel(-1));
        document.getElementById('next-level').addEventListener('click', () => this.changeLevel(1));

        this.loop.start();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.renderer) this.renderer.resize(this.canvas.width, this.canvas.height);
    }

    changeLevel(dir) {
        this.currentLevel = (this.currentLevel + dir + Levels.length) % Levels.length;
        this.loadLevel(this.currentLevel);
    }

    loadLevel(index) {
        this.scene.clear();
        const data = Levels[index];
        console.log(`Loading Level: ${data.name}`);

        // Create a temporary scene mock to intercept .add calls from level data
        const tempScene = {
            add: (config) => {
                const entity = this.createEntity(config);
                if (entity) this.scene.add(entity);
            }
        };

        data.setup(tempScene);
        this.hud.update(index, 0, this.scene.targets.length);
    }

    createEntity(config) {
        let entity = null;
        switch (config.type) {
            case 'laser': entity = new Laser(config.x, config.y, config.angle, config.color); break;
            case 'mirror': entity = new Mirror(config.x, config.y, config.width, config.height, config.angle); break;
            case 'wall': entity = new Wall(config.x, config.y, config.width, config.height, config.angle); break;
            case 'target': entity = new Target(config.x, config.y, config.radius); break;
            case 'lens': entity = new Lens(config.x, config.y, config.width, config.height, config.refractiveIndex); break;
            case 'prism': entity = new Prism(config.x, config.y, config.size, config.angle); break;
            default: console.warn(`Unknown type: ${config.type}`); return null;
        }

        if (entity) {
            if (config.draggable !== undefined) entity.draggable = config.draggable;
            if (config.rotatable !== undefined) entity.rotatable = config.rotatable;
        }
        return entity;
    }

    update(dt) {
        this.scene.update(dt);

        // Raycast
        const rays = this.raycaster.traceAll();
        this.rays = rays;

        // Check win condition
        let hitCount = 0;
        for (const t of this.scene.targets) {
            if (t.isHit) hitCount++;
        }
        this.hud.update(this.currentLevel, hitCount, this.scene.targets.length);
    }

    render() {
        this.renderer.render(this.scene, this.rays || []);
    }
}

// Start
window.onload = () => {
    const app = new Game();
};
