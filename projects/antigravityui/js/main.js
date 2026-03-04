// js/main.js
import { Engine } from './physics/Engine.js';
import { ElementSync } from './ui/ElementSync.js';
import { InputHandler } from './ui/InputHandler.js';
import { ScrollHandler } from './ui/ScrollHandler.js';
import { DOMManager } from './ui/DOMManager.js';
import { ParticleSystem } from './ui/ParticleSystem.js';
import { TIME } from './config/constants.js';
import { Logger } from './core/Logger.js';

class AntiGravityApp {
    constructor() {
        this.engine = new Engine();
        this.elementSync = new ElementSync(this.engine);
        this.inputHandler = new InputHandler(this.engine);
        this.scrollHandler = new ScrollHandler(this.engine);
        this.particles = new ParticleSystem();
        this.domManager = null;

        this.lastTime = performance.now();
        this.fpsFrameTimer = 0;
        this.frameCount = 0;
        this.fps = 60;

        this.isRunning = false;
        this.init();
    }

    init() {
        Logger.enableDebug();
        Logger.log("Initializing AntiGravityUI...");

        // Setup DOM manager after engine is ready
        this.domManager = new DOMManager(this.engine, this.elementSync, this.inputHandler);

        // Add fun click explosion
        document.addEventListener('click', (e) => {
            // Ignore if clicking a button
            if (e.target.tagName !== 'BUTTON' && !e.target.closest('.slider-track')) {
                this.particles.emit(e.clientX, e.clientY, 15);
            }
        });

        // Resize handler
        window.addEventListener('resize', this.onResize.bind(this));
        this.onResize();

        // Parse DOM and create bodies
        // Wrap in timeout to ensure CSS is applied and rects are correct
        setTimeout(() => {
            this.elementSync.initFromDOM();
            Logger.log(`Synced ${this.engine.bodies.length} bodies.`);
            this.start();
        }, 100);
    }

    onResize() {
        this.engine.setBounds(window.innerWidth, window.innerHeight);
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.loop.bind(this));
    }

    loop(currentTime) {
        if (!this.isRunning) return;

        let deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Cap delta to prevent massive jumps when tab is in background
        if (deltaTime > TIME.MAX_DELTA) {
            deltaTime = TIME.MAX_DELTA;
        }

        // FPS Calculation
        this.frameCount++;
        this.fpsFrameTimer += deltaTime;
        if (this.fpsFrameTimer >= 1000) {
            this.fps = (this.frameCount * 1000) / this.fpsFrameTimer;
            this.frameCount = 0;
            this.fpsFrameTimer = 0;
        }

        // --- TICK ---
        this.inputHandler.update();

        // Engine update (fixed step logic is better, but dt scaling works for now)
        // Convert to coefficient for simplicity if dt based
        this.engine.update(1.0); // using 1.0 step for simple Euler integration logic in Engine

        // Update particles
        this.particles.update();

        // Sync Visuals
        this.elementSync.updateDOM();

        // Update Stats UI
        this.domManager.updateStats(this.fps);

        // Loop
        requestAnimationFrame(this.loop.bind(this));
    }
}

// Boot
window.onload = () => {
    window.AntiGravity = new AntiGravityApp();
};
