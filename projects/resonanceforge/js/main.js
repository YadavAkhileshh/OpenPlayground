import { AudioEngine } from './audio.js';
import { PhysicsWorld } from './physics.js';
import { Renderer } from './renderer.js';
import { GameManager } from './game.js';

class ResonanceForge {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Resize canvas to fill window
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Initialize Systems
        this.audio = new AudioEngine();
        this.physics = new PhysicsWorld();
        this.renderer = new Renderer(this.ctx);
        this.game = new GameManager(this);

        this.lastTime = 0;
        this.initUI();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    initUI() {
        const startBtn = document.getElementById('start-btn');
        startBtn.addEventListener('click', async () => {
            // AudioContext must be resumed/created after user gesture
            await this.audio.init();

            document.getElementById('start-screen').classList.remove('active');
            document.getElementById('hud').style.display = 'block';

            this.game.start();
            this.lastTime = performance.now(); // Reset time before loop starts
            requestAnimationFrame((t) => this.loop(t));
        });
    }

    loop(timestamp) {
        let deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        // Safety: Cap deltaTime to prevent physics Explosion on lag spike/tab switch
        if (deltaTime > 0.1) deltaTime = 0.1;

        // 1. Analyze Audio -> Get Forces
        const soundForces = this.audio.analyze();

        // 2. Update Game Logic
        this.game.update(deltaTime);

        // 3. Update Physics (Apply Forces)
        this.physics.applyGlobalForces(soundForces);
        this.physics.update(deltaTime);

        // 4. Render
        this.renderer.clear();
        this.renderer.drawBodies(this.physics.bodies);
        this.renderer.visualizeSound(soundForces);

        requestAnimationFrame((t) => this.loop(t));
    }
}

// Start immediately
new ResonanceForge();
