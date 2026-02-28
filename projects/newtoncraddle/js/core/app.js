import { PhysicsEngine } from '../physics/engine.js';
import { Pendulum } from '../physics/pendulum.js';
import { Renderer } from '../ui/renderer.js';
import { InteractionHandler } from '../ui/interaction.js';
import { AudioSystem } from '../ui/audio.js';
import { ParticleSystem } from '../effects/particles.js';
import { DebugUI } from '../ui/debug-ui.js';
import { stateManager } from './state.js';
import { CONFIG } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

/**
 * @fileoverview Main Application class for Newton's Cradle.
 * Orchestrates the relationship between physics, rendering, and interaction.
 * 
 * DESIGN PATTERN: Orchestrator
 * This class ties together the decoupled components (Physics, Audio, UI).
 * It manages the high-level lifecycle and the shared animation loop.
 * 
 * HISTORICAL NOTE:
 * The Newton's Cradle was popularized by Simon Prebble in 1967.
 * This digital version aims for the same tactile satisfaction that
 * the original toys provided.
 */
export class App {
    /**
     * @param {HTMLElement} container - The main container for the cradle.
     */
    constructor(container) {
        this.container = container;
        this.balls = [];
        this.lastTime = 0;
        this.isRunning = false;

        // Core Systems Initialization
        this.audio = new AudioSystem();
        this.particles = new ParticleSystem(this.container);
        this.state = stateManager;
        this.debug = new DebugUI(this.container);

        this.init();
    }

    /**
     * Initialize all components and start the simulation loop.
     * Sets up dependencies and event listeners.
     */
    init() {
        logger.info("Initializing Newton's Cradle Application...");

        // 1. Create the physical entities
        this.createBalls();

        // 2. Initialize Physics Engine with collision event bubbling
        this.physics = new PhysicsEngine(this.balls, {
            onCollision: this.handleCollision.bind(this)
        });

        // 3. Initialize Visual Renderer
        this.renderer = new Renderer(this.container, this.balls);

        // 4. Initialize User Interaction (Mouse/Touch/Pen)
        this.interaction = new InteractionHandler(this.container, this.balls);

        // 5. Setup Window Events for responsiveness
        window.addEventListener('resize', this.onResize.bind(this));
        this.onResize();

        // 6. Bootstrap the Animation Loop
        this.isRunning = true;
        requestAnimationFrame(this.loop.bind(this));

        // Final layout sync after DOM settling
        requestAnimationFrame(() => this.onResize());

        logger.info("Application started successfully.");
    }

    /**
     * Instantiate the pendulum balls based on configuration.
     * Balls are centered horizontally and aligned at the top bar.
     * 
     * The spacing is critical: if balls overlap initially, the collision
     * engine might trigger an 'explosive' energy transfer.
     */
    createBalls() {
        const rect = this.container.getBoundingClientRect();
        const width = rect.width || 800; // Fallback to 800 if not yet sized
        const centerX = width / 2;
        const totalWidth = (CONFIG.BALL_COUNT - 1) * (CONFIG.BALL_RADIUS * 2);
        const startX = centerX - totalWidth / 2;

        for (let i = 0; i < CONFIG.BALL_COUNT; i++) {
            const anchorX = startX + i * (CONFIG.BALL_RADIUS * 2);
            const anchorY = CONFIG.ANCHOR_BASE_Y;

            const ball = new Pendulum(anchorX, anchorY, i);
            this.balls.push(ball);
        }

        logger.debug(`${CONFIG.BALL_COUNT} balls created at centerX: ${centerX}`);
    }

    /**
     * The core animation loop.
     * Drives physics integration and visual updates.
     * 
     * @param {number} timestamp - Current high-precision timestamp.
     */
    loop(timestamp) {
        if (!this.isRunning) return;

        // Calculate delta time in seconds (standard dt)
        if (!this.lastTime) this.lastTime = timestamp;
        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        // Performance Safety: Caps max delta time (prevents huge jumps after idle)
        const dt = Math.min(deltaTime, 0.1);

        // Update Physics (Integrator + Collision Resolution)
        this.physics.update(dt);

        // Update Visual Effects (Particles, Fade-outs)
        this.particles.update(dt);

        // Update State Telemetry (Energy, Momentum metrics)
        this.state.update(this.balls);

        // Update Debug Overlays
        this.debug.update();

        // Main Rendering Pass
        this.renderer.render();

        // Schedule next frame
        requestAnimationFrame(this.loop.bind(this));
    }

    /**
     * Global callback triggered when two balls collide.
     * Synchronizes tactile feedback across sensory channels.
     * 
     * @param {Pendulum} ballA - Leftmost colliding ball.
     * @param {Pendulum} ballB - Rightmost colliding ball.
     * @param {number} intensity - Relative angular velocity at impact.
     */
    handleCollision(ballA, ballB, intensity) {
        // Trigger Audio Burst
        this.audio.playClack(intensity);

        // Emit Particles at the contact point
        const midX = (ballA.ballX + ballB.ballX) / 2;
        const midY = (ballA.ballY + ballB.ballY) / 2;
        this.particles.emit(midX, midY, intensity);

        // Record for telemetry and state tracking
        this.state.recordCollision();
    }

    /**
     * Handle window resizing events to maintain visual alignment.
     */
    onResize() {
        const rect = this.container.getBoundingClientRect();
        if (rect.width === 0) return;

        this.renderer.resize();
        this.particles.resize();

        // Recalculate ball anchors to keep them centered after resize
        const centerX = rect.width / 2;
        const totalWidth = (CONFIG.BALL_COUNT - 1) * (CONFIG.BALL_RADIUS * 2);
        const startX = centerX - totalWidth / 2;

        this.balls.forEach((ball, i) => {
            ball.anchorX = startX + i * (CONFIG.BALL_RADIUS * 2);
            if (!ball.isDragged) {
                ball.updateCoordinates();
            }
        });

        logger.debug(`Component dimensions updated for resize. New centerX: ${centerX}`);
    }

    /**
     * Gracefully terminate the simulation process.
     */
    stop() {
        this.isRunning = false;
        logger.info("Application loop terminated.");
    }
}
