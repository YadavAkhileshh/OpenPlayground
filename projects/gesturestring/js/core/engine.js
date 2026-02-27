/**
 * Engine Class
 * Manages the main game loop, time steps, and system updates.
 * Integrates Physics, Rendering, Input, Entities, UI, and Audio.
 */
import { Renderer } from '../render/renderer.js';
import { Solver } from '../physics/solver.js';
import { Collision } from '../physics/collision.js';
import { Cursor } from '../input/cursor.js';
import { Camera } from '../render/camera.js';
import { Scene } from '../scene/scene.js';
import { Vector3 } from '../math/vector3.js';
import { Matrix4 } from '../math/matrix.js';
import { Ribbon } from '../entities/ribbon.js';
import { Starfield } from '../entities/starfield.js';
import { HUD } from '../ui/hud.js';
import { Vignette } from '../render/vignette.js';
import { AudioEngine } from '../audio/audio.js'; // Import Audio
import { randomRange } from '../math/utils.js';

export class Engine {
    /**
     * Creates the game engine instance.
     */
    constructor() {
        // Core Systems
        this.renderer = new Renderer('canvas');
        this.solver = new Solver();
        this.cursor = new Cursor(document.body);
        this.audio = new AudioEngine();

        // Scene Architecture
        this.camera = new Camera(60, window.innerWidth / window.innerHeight, 1, 5000);
        this.scene = new Scene();
        this.starfield = new Starfield(800);
        this.hud = new HUD();
        this.vignette = new Vignette(this.renderer);

        // Matrices
        this.viewProjMatrix = new Matrix4();

        // Entities
        this.ribbons = [];
        this.currentRibbon = null;

        // State
        this.isRunning = false;
        this.lastTime = 0;
        this.frameCount = 0;
        this.lastFpsTime = 0;

        // Gravity Well Parameters
        this.gravityWell = new Vector3(0, 0, 0);
        this.gravityStrength = 500;
        this.eventHorizonRadius = 50;

        this.initEvents();
    }

    /**
     * Initializes event listeners.
     */
    initEvents() {
        window.addEventListener('resize', () => {
            this.renderer.resize();
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        });

        window.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.clearRibbons();
        });

        // Audio start on interaction
        window.addEventListener('mousedown', () => {
            this.audio.start();
            this.audio.resume();
        }, { once: true });
    }

    /**
     * Starts the game loop.
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    /**
     * Stops the game loop.
     */
    stop() {
        this.isRunning = false;
    }

    /**
     * Clears all ribbons from the scene.
     */
    clearRibbons() {
        this.ribbons = [];
        this.solver.clear();
        this.currentRibbon = null;
    }

    /**
     * Main Game Loop.
     * @param {number} timestamp 
     */
    loop(timestamp) {
        if (!this.isRunning) return;

        const dt = 1 / 60;

        // FPS Counter
        this.frameCount++;
        if (timestamp - this.lastFpsTime >= 1000) {
            this.hud.updateStats(this.frameCount, this.ribbons.length, this.solver.particles.length);
            this.frameCount = 0;
            this.lastFpsTime = timestamp;
        }

        this.update(dt, timestamp);
        this.render();

        requestAnimationFrame((t) => this.loop(t));
    }

    /**
     * Updates game logic.
     * @param {number} dt 
     * @param {number} timestamp 
     */
    update(dt, timestamp) {
        // Camera Orbit / Sway
        const swayX = Math.sin(timestamp * 0.0002) * 200;
        const swayY = Math.cos(timestamp * 0.0003) * 100;
        const swayZ = Math.sin(timestamp * 0.0001) * 300 + 1000;
        this.camera.position.set(swayX, swayY, swayZ);

        // Input Handling
        this.handleInput(timestamp);

        // Apply Gravity Well logic before solver update
        for (const p of this.solver.particles) {
            if (p.isLocked) continue;

            const dir = Vector3.subVectors(this.gravityWell, p.position);
            const distSq = dir.lengthSq();
            const dist = Math.sqrt(distSq);

            // F = G * m1 * m2 / r^2
            // Simplified: F = strength / dist
            if (dist > 10) {
                dir.normalize();
                const force = this.gravityStrength / (dist * 0.1);
                p.applyForce(dir.multiplyScalar(force));
            }

            // Collision with Event Horizon
            Collision.resolveParticleSphere(p, this.gravityWell, this.eventHorizonRadius);
        }

        // Physics Step
        this.solver.update(dt);

        // Cleanup dead ribbons
        this.cleanupRibbons(dt);

        // Audio Update
        const intensity = Math.min(1, this.solver.particles.length / 500);
        this.audio.update(intensity);
    }

    handleInput(timestamp) {
        if (this.cursor.isDown) {
            if (!this.currentRibbon) {
                // Color variation based on time
                const hue = (timestamp * 0.1) % 360;
                this.currentRibbon = new Ribbon(this.solver, { h: hue, s: 85, l: 60 });
                this.ribbons.push(this.currentRibbon);
            }

            const mousePos = this.cursor.position;
            // Map depth based on mouse Y? or oscillation?
            // Let's map Y to Depth to allow 3D drawing control
            // Screen Top = Far, Screen Bottom = Near
            // range: -500 to 500

            // Normalized Y (-1 to 1)
            const ny = (mousePos.y / (window.innerHeight / 2));
            const targetZ = ny * 400;

            // Correct logic to get X,Y at targetZ
            const dist = this.camera.position.z - targetZ; // approx
            const fovFactor = Math.tan((this.camera.fov * Math.PI / 180) / 2);

            const heightAtZ = 2 * fovFactor * dist;
            const widthAtZ = heightAtZ * this.camera.aspect;

            const nx = (mousePos.x / (window.innerWidth / 2));
            // No need to calc wx, wy explicitly if using nx, ny ratios

            const z = Math.sin(timestamp * 0.003) * 300;
            const dist2 = this.camera.position.z - z;
            const h2 = 2 * fovFactor * dist2;
            const w2 = h2 * this.camera.aspect;

            const x3d = nx * w2 / 2 + this.camera.position.x; // Parallax correction
            const y3d = -ny * h2 / 2 + this.camera.position.y;

            const newPos = new Vector3(x3d, y3d, z);

            let shouldAdd = true;
            if (this.currentRibbon.particles.length > 0) {
                const lastP = this.currentRibbon.particles[this.currentRibbon.particles.length - 1];
                if (lastP.position.distanceTo(newPos) < 15) {
                    shouldAdd = false;
                }
            }

            if (shouldAdd) {
                this.currentRibbon.addPoint(newPos);
            }
        } else {
            if (this.currentRibbon) {
                this.currentRibbon.finish();
                this.currentRibbon = null;
            }
        }
    }

    cleanupRibbons(dt) {
        for (let i = this.ribbons.length - 1; i >= 0; i--) {
            const r = this.ribbons[i];
            const alive = r.update(dt);
            if (!alive) {
                for (const p of r.particles) this.solver.removeParticle(p);
                for (const s of r.springs) this.solver.removeSpring(s);
                this.ribbons.splice(i, 1);
            }
        }
    }

    render() {
        this.renderer.clear();

        // Update View Matrix
        this.camera.viewMatrix.identity();

        // Apply Translation
        this.camera.viewMatrix.set(
            1, 0, 0, -this.camera.position.x,
            0, 1, 0, -this.camera.position.y,
            0, 0, 1, -this.camera.position.z,
            0, 0, 0, 1
        );

        // Combine Proj * View
        this.viewProjMatrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.viewMatrix);

        // Draw Stars
        this.starfield.draw(this.renderer, this.camera, this.viewProjMatrix);

        // Draw Ribbons
        for (const r of this.ribbons) {
            r.draw(this.renderer, this.camera, this.viewProjMatrix);
        }

        // Draw Gravity Well (Event Horizon)
        this.drawGravityWell();

        // Post Process
        this.vignette.draw();
    }

    drawGravityWell() {
        // Draw a black hole at 0,0,0
        // Project center
        const center = new Vector3(0, 0, 0);
        const proj = this.camera.project(center, this.viewProjMatrix, window.innerWidth, window.innerHeight);

        if (proj.visible) {
            const ctx = this.renderer.ctx;
            const r = this.eventHorizonRadius * proj.scale;

            // Accretion Disk Glow
            const gradient = ctx.createRadialGradient(proj.x, proj.y, r * 0.8, proj.x, proj.y, r * 3);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
            gradient.addColorStop(0.2, 'rgba(100, 0, 100, 0.8)');
            gradient.addColorStop(0.5, 'rgba(0, 100, 200, 0.3)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, r * 3, 0, Math.PI * 2);
            ctx.fill();

            // Black Hole
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, r, 0, Math.PI * 2);
            ctx.fill();

            // White outline
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
}
