/**
 * SingularityRay JS - Main Entry
 * Boots the engine, wires up dependencies, and starts the render loop.
 */

import { EngineConfig } from './core/engine_config.js';
import { CoreEventBus } from './core/event_bus.js';
import { StateManager } from './core/state_manager.js';
import { Timer } from './core/timer.js';
import { SceneSetup } from './core/scene_setup.js';

import { Vec3 } from './math/vec3.js';
import { BlackHole } from './physics/blackhole.js';
import { AccretionDisk } from './physics/accretion_disk.js';

import { Camera } from './render/camera.js';
import { MaterialSystem } from './render/materials.js';
import { TextureGenerator } from './render/texture_gen.js';
import { Raymarcher } from './render/raymarcher.js';
import { PostProcessor } from './render/post_processing.js';
import { FrameBuffer } from './render/frame_buffer.js';
import { Renderer } from './render/renderer.js';

import { UIManager } from './ui/ui_manager.js';
import { InputHandler } from './ui/input_handler.js';
import { FPSMonitor } from './ui/fps_monitor.js';
import { SlidersController } from './ui/sliders_controller.js';
import { DebugController } from './ui/debug_overlay.js';

class SingularityEngine {
    constructor() {
        console.log("Initializing SingularityRay CPU Engine...");

        // 1. Core Services
        this.eventBus = new CoreEventBus();
        this.state = new StateManager(this.eventBus);
        this.timer = new Timer();

        // 2. Physics & Data
        this.blackHole = new BlackHole(new Vec3(0, 0, 0), 1.0);
        this.accretionDisk = new AccretionDisk(new Vec3(0, 0, 0), 3.0, 8.0);
        this.scene = new SceneSetup(this.blackHole, this.accretionDisk);

        // 3. Render Pipeline
        const canvas = document.getElementById('singularity-canvas');
        this.frameBuffer = new FrameBuffer(canvas);
        this.camera = new Camera();
        this.materials = new MaterialSystem(this.accretionDisk);
        this.envMap = new TextureGenerator();

        this.raymarcher = new Raymarcher(
            (p, m) => this.scene.map(p, m),
            this.blackHole,
            this.accretionDisk,
            this.materials,
            this.envMap
        );
        this.postProcessor = new PostProcessor();
        this.renderer = new Renderer(this.frameBuffer, this.camera, this.raymarcher, this.postProcessor);

        // 4. UI Systems
        this.uiManager = new UIManager();
        this.inputHandler = new InputHandler();
        this.fpsMonitor = new FPSMonitor();

        // Note: UI controllers now share the CoreEventBus to strictly maintain exactly 45 files
        this.slidersController = new SlidersController(this.eventBus);
        this.debugController = new DebugController(this.eventBus);

        // State Flags
        this.isRunning = false;

        this._bindEvents();
        this._handleResize();

        // Remove loading overlay after brief delay for effect
        setTimeout(() => {
            const overlay = document.getElementById('loading-overlay');
            if (overlay) overlay.classList.add('fade-out');

            this.uiManager.showStatus('Engine initialized. Raymarching online.', 'success');
            this.start();
        }, EngineConfig.startupMessageDelay);
    }

    _bindEvents() {
        // Window Resize
        window.addEventListener('resize', () => this._handleResize());

        // Input Handling
        this.inputHandler.onDragMove = (dx, dy) => {
            this.camera.orbit(dx, dy);
            this.camera.updateViewMatrix();
            this.renderer.triggerFastRender();
        };

        this.inputHandler.onZoom = (delta) => {
            this.camera.zoom(delta);
            this.camera.updateViewMatrix();
            this.renderer.triggerFastRender();
        };

        this.inputHandler.onInteractionEnd = () => {
            this.renderer.triggerFullRender();
        };

        // UI Commands
        this.uiManager.onResetCamera = () => {
            this.camera.reset();
            this.camera.updateViewMatrix();
            this.renderer.triggerFullRender();
        };

        this.eventBus.on('state.pauseChanged', (isPaused) => {
            if (isPaused) {
                this.timer.pause();
                this.isRunning = false;
            } else {
                this.timer.resume();
                this.isRunning = true;
                this.loop();
            }
        });

        // State changes
        this.eventBus.on('state.physicsChanged', (state) => {
            this.blackHole.setMass(state.blackHoleMass);
            this.accretionDisk.setIntensity(state.accretionDiskIntensity);
            this.renderer.triggerFastRender(); // Feedback
            setTimeout(() => this.renderer.triggerFullRender(), 100);
        });

        this.eventBus.on('state.renderingChanged', (state) => {
            this.raymarcher.setSteps(state.raySteps);
            this.raymarcher.setDebug(state.showDebugRays);
            this.scene.setShowBounds(state.showSdfBounds);
            this.renderer.progressive = state.progressiveRender;
            this.renderer.triggerFullRender();
        });
    }

    _handleResize() {
        // Enforce max CPU rendering resolution to maintain interactive framerates
        let w = window.innerWidth;
        let h = window.innerHeight;

        if (w > EngineConfig.canvasMaxWidth) w = EngineConfig.canvasMaxWidth;
        if (h > EngineConfig.canvasMaxHeight) h = EngineConfig.canvasMaxHeight;

        // Apply scalar
        w = Math.floor(w * EngineConfig.internalResolutionScale);
        h = Math.floor(h * EngineConfig.internalResolutionScale);

        this.frameBuffer.resize(w, h);
        this.camera.setAspect(w, h);

        this.uiManager.updateResolutionDisplay(w, h);
        this.renderer.triggerFullRender();
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.timer.lastTime = performance.now();

            // Read initial state from DOM
            const debugState = this.debugController.getInitialState();
            this.raymarcher.setDebug(debugState.debugRays);
            this.scene.setShowBounds(debugState.sdfBounds);
            this.renderer.progressive = debugState.progressive;

            // Trigger first full render
            this.renderer.currentScale = 1;
            requestAnimationFrame(() => this.loop());
        }
    }

    loop() {
        if (!this.isRunning) return;

        this.timer.tick();
        this.inputHandler.update();

        // Re-render
        this.renderer.render();

        // Telemetry Update
        this.fpsMonitor.tick();

        requestAnimationFrame(() => this.loop());
    }
}

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
    // Inject the main engine instance into window for debugging scope
    window.engine = new SingularityEngine();
});
