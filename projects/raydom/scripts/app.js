/**
 * @fileoverview Main entry point for the RayDOM engine.
 * Orchestrates all subsystems: Rendering, Physics/Raycasting, Audio, Entities, and UI.
 * Implements the lifecycle of the application and the high-performance game loop.
 */

import { MAP } from './map.js';
import { Player } from './player.js';
import { Raycaster } from './raycaster.js';
import { Renderer, MiniMap } from './renderer.js';
import { Input } from './input.js';
import { AudioEngine } from './audio.js';
import { ParticleSystem } from './particles.js';
import { EntitySystem } from './entities.js';
import { LevelGenerator } from './generator.js';

/**
 * @class Engine
 * @description The core engine class that ties all modules together.
 */
class Engine {
    /**
     * @constructor
     * Initializes all subsystems and sets up the initial state.
     */
    constructor() {
        // Core configuration
        this.config = {
            stripWidth: 4, // Higher = better performance, lower = better quality
            numParticles: 100,
            levelSize: 24
        };

        // Subsystem instances
        this.input = new Input();
        this.audio = new AudioEngine();
        this.particles = new ParticleSystem(this.config.numParticles);
        this.generator = new LevelGenerator(this.config.levelSize, this.config.levelSize);
        this.entities = new EntitySystem();

        // State variables
        this.lastTime = 0;
        this.fps = 0;
        this.frameCount = 0;
        this.isPaused = false;

        // Element references
        this.fpsEl = document.getElementById('fps-counter');
        this.posXEl = document.getElementById('pos-x');
        this.posYEl = document.getElementById('pos-y');
        this.loader = document.getElementById('loader');
        this.cpuEl = document.getElementById('cpu-sim');

        this.init();
    }

    /**
     * Final initialization before starting the game loop.
     * Generates the level and sets up event listeners.
     */
    init() {
        // Generate procedural level
        const level = this.generator.generate();
        MAP.init(level.cols, level.rows, level.data);

        // Initialize world-dependent systems
        this.numRays = Math.floor(window.innerWidth / this.config.stripWidth);
        this.player = new Player(level.playerStart.x, level.playerStart.y, Math.PI / 4);
        this.raycaster = new Raycaster(this.player, this.numRays);
        this.renderer = new Renderer(this.numRays);
        this.miniMap = new MiniMap('mini-map', MAP, this.player);

        // Global resize listener
        window.addEventListener('resize', () => this.handleResize());

        // Mouse click to start audio context
        document.addEventListener('click', () => {
            this.audio.init();
        }, { once: true });

        // Start loading simulation
        this.simulateLoading();
    }

    /**
     * Handles window resize events by re-initializing the strip pool.
     */
    handleResize() {
        this.numRays = Math.floor(window.innerWidth / this.config.stripWidth);
        this.raycaster.numRays = this.numRays;
        this.renderer.numRays = this.numRays;
        this.renderer.initStrips();
    }

    /**
     * Visual boot-up sequence.
     */
    simulateLoading() {
        let progress = 0;
        const progressEl = document.getElementById('progress');
        const interval = setInterval(() => {
            progress += Math.random() * 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    this.loader.style.opacity = '0';
                    setTimeout(() => {
                        this.loader.style.display = 'none';
                        this.start();
                    }, 500);
                }, 500);
            }
            progressEl.style.width = `${progress}%`;
        }, 30);
    }

    /**
     * Starts the animation frame loop.
     */
    start() {
        requestAnimationFrame((time) => this.loop(time));
    }

    /**
     * The main engine loop. Executes once per frame.
     * @param {number} time - Current timestamp from requestAnimationFrame.
     */
    loop(time) {
        if (this.isPaused) {
            requestAnimationFrame((t) => this.loop(t));
            return;
        }

        const deltaTime = time - this.lastTime;
        this.lastTime = time;

        // 1. Update Subsystems
        this.player.update(this.input.keys, deltaTime);

        // Trigger footstep sounds if moving
        if (this.player.isMoving && !this.player.isJumping) {
            this.audio.playFootstep();
        }

        // 2. Physics & Raycasting
        const rays = this.raycaster.castRays();

        // 3. Entity & Particle Logic
        this.entities.update(this.player, rays, deltaTime);
        this.particles.update(deltaTime);
        this.particles.updateAmbient(window.innerWidth, window.innerHeight);

        // 4. Rendering
        this.renderer.render(rays, this.player);
        this.miniMap.draw();

        // 5. HUD & UI
        this.updateHUD(deltaTime);

        requestAnimationFrame((t) => this.loop(t));
    }

    /**
     * Updates the diagnostic HUD elements.
     * @param {number} deltaTime - Time elapsed since last frame.
     */
    updateHUD(deltaTime) {
        this.frameCount++;
        if (deltaTime > 0) {
            this.fps = Math.round(1000 / deltaTime);

            // Throttle HUD updates for performance and readability
            if (this.frameCount % 10 === 0) {
                if (this.fpsEl) this.fpsEl.textContent = `${this.fps} FPS`;
                if (this.posXEl) this.posXEl.textContent = Math.floor(this.player.x);
                if (this.posYEl) this.posYEl.textContent = Math.floor(this.player.y);

                if (this.cpuEl) {
                    const sim = 10 + Math.sin(this.lastTime * 0.001) * 5;
                    this.cpuEl.textContent = `LOAD: ${sim.toFixed(1)}%`;
                }
            }
        }
    }

    /**
     * Utility method to pause/resume the engine.
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        console.log(`Engine: ${this.isPaused ? 'Paused' : 'Resumed'}`);
    }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
    // Create the global engine instance
    window.RayDOM = new Engine();
});
