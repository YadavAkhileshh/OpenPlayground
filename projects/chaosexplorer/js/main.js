/**
 * main.js
 * Application Entry Point
 * Orchestrates the visualization loop, UI updates, and simulation state.
 */

import { Renderer } from './graphics/Renderer.js';
import { Camera } from './graphics/Camera.js';
import { Controls } from './ui/Controls.js';
import { AttractorFactory } from './math/Attractors.js';
import { Integrator } from './math/Integrator.js';
import { Recorder } from './ui/Recorder.js';
import { ThemeManager } from './ui/ThemeManager.js';
import { Modal } from './ui/Modal.js';
import { ParticleSystem } from './graphics/Particles.js';

class ChaosExplorer {
    constructor() {
        this.canvas = document.getElementById('chaos-canvas');
        this.renderer = new Renderer(this.canvas);
        this.camera = new Camera();
        this.recorder = new Recorder(this.canvas);
        this.themeManager = new ThemeManager();
        this.modal = new Modal();
        this.particles = new ParticleSystem(300);
        this.controls = new Controls(this);

        // Simulation State
        this.timeStep = 0.01;
        this.currentAttractor = null;
        this.points = []; // Buffer of points to render
        this.maxPoints = 2000; // Limit trail length
        this.speed = 1.0;
        this.isRunning = true;
        this.integrator = new Integrator();

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Start with Lorenz
        this.setAttractor('lorenz');

        // Start Loop
        this.loop();
    }

    setAttractor(type) {
        this.currentAttractor = AttractorFactory.create(type);
        this.points = []; // Reset trails
        this.controls.generateSliders(this.currentAttractor);
        // Initialize with a random point or specific start
        this.currentPos = this.currentAttractor.startPoint.clone();

        // Reset particles
        this.particles.init();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.renderer.resize(this.canvas.width, this.canvas.height);
    }

    update() {
        if (!this.isRunning || !this.currentAttractor) return;

        // Perform multiple steps per frame for smooth lines
        const stepsPerFrame = 5 * this.speed;

        for (let i = 0; i < stepsPerFrame; i++) {
            // Calculate next point using RK4
            let nextPos = this.integrator.step(
                this.currentAttractor,
                this.currentPos,
                this.timeStep
            );

            this.points.push(nextPos);
            this.currentPos = nextPos;

            // Manage buffer size
            if (this.points.length > this.maxPoints) {
                this.points.shift();
            }
        }

        // Update Particles
        this.particles.update(this.currentAttractor, this.timeStep * this.speed);
    }

    loop() {
        this.update();

        this.renderer.clear();
        if (this.currentAttractor) {
            // Render basic trails
            this.renderer.render(this.points, this.camera, this.currentAttractor.scale);

            // Render particles
            this.particles.render(this.renderer, this.camera, this.currentAttractor.scale);
        }

        requestAnimationFrame(() => this.loop());

        // Update Stats
        this.updateStats();
    }

    updateStats() {
        const stats = document.getElementById('stats-display');
        /* FPS calculation would go here */
        const ptCount = document.getElementById('point-count');
        if (ptCount) ptCount.innerText = `Points: ${this.points.length} | Particles: ${this.particles.count}`;
    }
}

// Boot
window.addEventListener('DOMContentLoaded', () => {
    window.app = new ChaosExplorer();
});
