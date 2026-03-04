/* js/main.js */
import { CONSTANTS } from './utils/constants.js';
import { InputHandler } from './core/input.js';
import { Player } from './entities/player.js';
import { WorldGenerator } from './world/generator.js';
import { CollisionSystem } from './systems/collision.js';
import { StyleEater } from './systems/style-eater.js';
import { Camera } from './core/camera.js';
import { AudioSystem } from './core/audio.js';
import { ParticleSystem } from './effects/particles.js';
import { ScreenShake } from './effects/shaker.js';
import { GlitchEffect } from './effects/glitch.js';
import { HUD } from './ui/hud.js';
import { Enemy } from './entities/enemy.js';
import { AISystem } from './systems/ai.js';
import { Profiler } from './utils/profiler.js';
import { EvolutionSystem } from './logic/evolution.js';
import { ScoringSystem } from './logic/scoring.js';

class Game {
    constructor() {
        // Core Systems
        this.input = new InputHandler();
        this.audio = new AudioSystem();
        this.particles = new ParticleSystem();
        this.shaker = new ScreenShake('#shake-layer');
        this.glitch = new GlitchEffect();

        this.hud = new HUD();
        this.profiler = new Profiler();
        this.collision = new CollisionSystem();
        this.scoring = new ScoringSystem();

        // World & Entities
        this.world = new WorldGenerator('#world');
        this.player = new Player('#player', this.input, this.hud);

        // Logic Systems
        this.styleEater = new StyleEater();
        this.camera = new Camera('#world', this.player);
        this.ai = new AISystem(this.player);
        this.evolution = new EvolutionSystem(this.player, this.particles);

        // Inject dependencies
        this.styleEater.setAudio(this.audio);
        this.styleEater.setParticles(this.particles);

        this.lastTime = 0;
        this.accumulator = 0;
        this.step = 1 / 60; // 60 FPS fixed time step

        this.init();
    }

    async init() {
        console.log("CannibalDOM Initializing...");

        // Generate the world content
        await this.world.generate(CONSTANTS.STRUCTURE_COUNT);

        // Build Collision Quadtree for static objects
        this.collision.buildTree(CONSTANTS.WORLD_WIDTH, CONSTANTS.WORLD_HEIGHT, this.world.getEdibles());

        // Center player
        this.player.setPosition(CONSTANTS.WORLD_WIDTH / 2, CONSTANTS.WORLD_HEIGHT / 2);

        // Spawn Enemies
        for (let i = 0; i < CONSTANTS.ENEMY_COUNT; i++) {
            const ex = Math.random() * CONSTANTS.WORLD_WIDTH;
            const ey = Math.random() * CONSTANTS.WORLD_HEIGHT;
            this.ai.add(new Enemy(ex, ey));
        }

        // Start Loop
        requestAnimationFrame((time) => this.loop(time));
    }

    loop(time) {
        const deltaTime = (time - this.lastTime) / 1000;
        this.lastTime = time;

        if (deltaTime > 0.1) {
            requestAnimationFrame((t) => this.loop(t));
            return;
        }

        // Update Entities & Systems
        this.player.update(deltaTime);
        this.particles.update();
        this.shaker.update(deltaTime);
        this.glitch.update(deltaTime);
        this.ai.update(deltaTime);
        this.evolution.update();

        // Update Camera
        this.camera.update();

        // Update Profiler
        this.profiler.update(this.world.getEdibles().length + this.ai.getEnemies().length);

        // Collision & Eating Logic
        const eaten = this.collision.check(this.player, this.world.getEdibles());
        if (eaten) {
            this.styleEater.consume(this.player, eaten);
            this.world.remove(eaten);
            this.scoring.add(10);

            // Screen shake on big eats?
            if (eaten.rect.width > 50) {
                this.shaker.shake(2, 0.1);
            }
        }

        // Enemy Collision Check
        const enemies = this.ai.getEnemies();
        enemies.forEach(enemy => {
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const bindDist = (this.player.size / 2 + enemy.size / 2);

            if (dist < bindDist) {
                // Collision!
                this.particles.emit(this.player.x + this.player.size / 2, this.player.y + this.player.size / 2, '#ff0000', 5);
                this.player.grow(-0.2); // Shrink 
                this.shaker.shake(15, 0.3); // Heavy Shake
                this.glitch.trigger(0.2); // GLITCH!

                // Push back
                const angle = Math.atan2(dy, dx);
                this.player.x += Math.cos(angle) * 20;
                this.player.y += Math.sin(angle) * 20;
            }
        });

        requestAnimationFrame((t) => this.loop(t));
    }
}

// Start Game
window.game = new Game();
