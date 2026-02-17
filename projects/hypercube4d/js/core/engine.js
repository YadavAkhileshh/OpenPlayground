/**
 * @file engine.js
 * @description The main application loop. Orchestrates the Math, Camera, Renderer, and Input modules.
 */

import { HShape } from './hshape.js';
import { Camera } from './camera.js';
import { Renderer } from './renderer.js';
import { Input } from './input.js';
import { Matrix4 } from '../math/matrix4.js';
import { settings } from './settings.js';
import { Visuals } from './visuals.js';
import { sysConsole } from './console.js';

export class Engine {
    constructor(canvas) {
        this.canvas = canvas;
        this.shape = new HShape();
        this.camera = new Camera();
        this.renderer = new Renderer(canvas);
        this.input = new Input(canvas);
        this.visuals = new Visuals(canvas);

        // Animation State
        this.angleXY = 0;
        this.angleXZ = 0;
        this.angleXW = 0;
        this.angleYZ = 0;
        this.angleYW = 0;
        this.angleZW = 0;

        // Sync initial settings
        this.syncSettings();

        // Listen for setting changes
        settings.subscribe((key, value) => this.onSettingChange(key, value));

        // UI Binding
        this.bindUI();

        // Stats
        this.fps = 0;
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.lastFpsTime = this.lastTime;
    }

    start() {
        this.loop();
    }

    syncSettings() {
        this.camera.scale = settings.get('cameraScale');
        this.camera.wDistance = settings.get('cameraWDistance');
        // rotation speed is accessed directly in update
    }

    onSettingChange(key, value) {
        if (key === 'cameraScale') this.camera.scale = value;
        if (key === 'cameraWDistance') this.camera.wDistance = value;
    }

    bindUI() {
        // Sliders
        const scaleSlider = document.getElementById('scale-slider');
        const wDistSlider = document.getElementById('w-dist-slider');
        const speedSlider = document.getElementById('speed-slider');

        scaleSlider.value = settings.get('cameraScale');
        wDistSlider.value = settings.get('cameraWDistance');
        speedSlider.value = settings.get('baseRotationSpeed') * 200; // Map back to slider range

        scaleSlider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            settings.set('cameraScale', val);
            document.getElementById('scale-value').innerText = val.toFixed(2);
        });

        wDistSlider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            settings.set('cameraWDistance', val);
            document.getElementById('w-dist-value').innerText = val.toFixed(2);
        });

        speedSlider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            settings.set('baseRotationSpeed', val * 0.01);
            document.getElementById('speed-value').innerText = e.target.value;
        });

        // Buttons
        document.getElementById('toggle-trails').addEventListener('click', (e) => {
            const isActive = e.target.classList.toggle('active');
            settings.set('showTrails', isActive);
            if (isActive) sysConsole.log("VISUAL TRAILS ENABLED");
            else sysConsole.log("VISUAL TRAILS DISABLED");
        });

        document.getElementById('auto-rotate').addEventListener('click', (e) => {
            const current = settings.get('autoRotate');
            settings.set('autoRotate', !current);
            e.target.classList.toggle('active');
            e.target.innerText = !current ? "AUTO-GYRO" : "MANUAL";

            if (!current) sysConsole.log("GYROSCOPIC STABILIZATION: AUTO");
            else sysConsole.log("GYROSCOPIC STABILIZATION: MANUAL");
        });

        document.getElementById('double-rotate').addEventListener('click', (e) => {
            const current = settings.get('doubleRotation');
            settings.set('doubleRotation', !current);
            e.target.classList.toggle('active');

            if (!current) sysConsole.warn("COMPLEX ROTATION MODE ENGAGED");
            else sysConsole.log("RETURNING TO STANDARD ROTATION");
        });

        // Shape Selection
        ['tesseract', '16-cell', '24-cell', '5-cell'].forEach(type => {
            const btn = document.getElementById(`shape-${type}`);
            if (!btn) return;

            btn.addEventListener('click', (e) => {
                // Update active class
                document.querySelectorAll('.button-group .btn-sci').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                // Update Shape
                this.shape = new HShape(type);

                // Update UI Feedback
                document.getElementById('vertex-count').innerText = this.shape.vertices.length;
                document.getElementById('edge-count').innerText = this.shape.edges.length;

                sysConsole.system(`GEOMETRY LOADED: ${type.toUpperCase()}`);
                sysConsole.log(`VERTICES: ${this.shape.vertices.length} // EDGES: ${this.shape.edges.length}`);
            });
        });

        document.getElementById('reset-view').addEventListener('click', () => {
            this.angleXY = 0; this.angleXZ = 0; this.angleXW = 0;
            this.angleYZ = 0; this.angleYW = 0; this.angleZW = 0;
            sysConsole.log("VIEW ORIENTATION RESET");
        });
    }

    update(dt) {
        // 1. Handle Input
        const inputDeltas = this.input.getDeltas();
        if (this.input.isDragging) {
            // Map mouse X/Y to different 4D rotation planes
            // Drag X -> Rotate XW plane
            // Drag Y -> Rotate YW plane
            this.angleXW += inputDeltas.x;
            this.angleYW += inputDeltas.y;
        }

        // 2. Auto Rotation
        if (settings.get('autoRotate')) {
            const speed = settings.get('baseRotationSpeed');
            this.angleXW += speed;
            this.angleYZ += speed * 0.5;
            this.angleZW += speed * 0.25;

            // Double Rotation Mode (Simultaneous orthogonal rotations)
            if (settings.get('doubleRotation')) {
                // We rotate XW and YZ planes simultaneously with distinct speeds
                // The above alrady does XW and YZ, but let's make it more pronounced or specific
                // Or simply ensure we are doing it if the user wants "complex" rotation.
                // Actually, the default auto-rotation already does multiple planes. 
                // Let's make "Double Rotation" lock specific orthogonal planes for a specific visual effect.
                // Clifford displacement style.
                this.angleXW += speed * 0.8;
                this.angleYZ += speed * 0.8;
            }
        }

        // 3. Construct Transformation Matrix
        // We combine rotations. Order matters, but for continuous updates this is a simplification.
        // Ideally we'd accumulate into a single quaternion or matrix, but Euler angles are easier to debug here.

        let transform = new Matrix4(); // Identity

        // Combine rotations
        transform = transform.multiply(Matrix4.rotationXW(this.angleXW));
        transform = transform.multiply(Matrix4.rotationYW(this.angleYW));
        transform = transform.multiply(Matrix4.rotationZW(this.angleZW));
        transform = transform.multiply(Matrix4.rotationXY(this.angleXY)); // Add others if needed
        transform = transform.multiply(Matrix4.rotationYZ(this.angleYZ));

        // 4. Project Vertices
        const projectedPoints = this.shape.vertices.map(v => {
            // Apply Rotation
            const rotatedV = transform.multiplyVector(v);

            // Project 4D -> 3D
            const v3 = this.camera.project4D(rotatedV);

            // Project 3D -> 2D
            const p2d = this.camera.project3D(v3, this.renderer.width, this.renderer.height);

            // Pass original 4D W/Z depth info for depth cuing
            // v3.z is the 3D depth, rotatedV.w is the 4D depth
            p2d.depth = v3.z;
            p2d.wDepth = rotatedV.w;
            return p2d;
        });

        return projectedPoints;
    }

    loop() {
        try {
            const now = performance.now();
            const dt = now - this.lastTime;
            this.lastTime = now;

            // Calculate FPS
            this.frameCount++;
            if (now - this.lastFpsTime >= 1000) {
                this.fps = this.frameCount;
                this.frameCount = 0;
                this.lastFpsTime = now;
                const fpsEl = document.getElementById('fps-counter');
                if (fpsEl) fpsEl.innerText = this.fps;
            }

            const projectedPoints = this.update(dt);

            // Render
            const trailsEnabled = settings.get('showTrails');

            // Clear / Fade
            this.renderer.clear(trailsEnabled);

            // Background Visuals
            this.visuals.renderBackground();

            // Draw Object
            this.renderer.draw(projectedPoints, this.shape.edges);

            // Post Process
            this.visuals.applyPostProcess();

            requestAnimationFrame(() => this.loop());
        } catch (e) {
            console.error("CRITICAL ENGINE ERROR:", e);
            if (sysConsole) sysConsole.warn("CRITICAL ERROR: " + e.message);
            // Stop loop on error to prevent spam
        }
    }
}
