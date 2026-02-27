// engine.js
import { Time } from './time.js';
import { globalEvents } from './eventBus.js';

export class Engine {
    constructor() {
        this.time = new Time();
        this.isRunning = false;
        this.isPaused = false;
        this.reqId = null;

        // Components that need updating
        this.systems = [];
        this.renderSystems = [];

        // Debug
        this.frameCount = 0;
        this.fps = 0;
        this.lastFpsTime = performance.now();

        globalEvents.on('toggle_pause', () => {
            this.isPaused = !this.isPaused;
        });

        globalEvents.on('step_frame', () => {
            if (this.isPaused) {
                this.stepFixed();
                this.render();
            }
        });
    }

    addSystem(system) {
        this.systems.push(system);
    }

    addRenderSystem(system) {
        this.renderSystems.push(system);
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.time.lastTime = performance.now(); // reset time on start
        this.loop();
    }

    stop() {
        this.isRunning = false;
        if (this.reqId) {
            cancelAnimationFrame(this.reqId);
        }
    }

    loop() {
        if (!this.isRunning) return;

        this.time.update();

        // FPS Calc
        this.frameCount++;
        if (performance.now() - this.lastFpsTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsTime = performance.now();
            globalEvents.emit('fps_update', this.fps);
        }

        if (!this.isPaused) {
            // Fixed timestep physics update
            while (this.time.consumeFixedTime()) {
                this.stepFixed();
            }
        }

        // Variable timestep render update
        this.render();

        this.reqId = requestAnimationFrame(() => this.loop());
    }

    stepFixed() {
        const dt = this.time.fixedDeltaTime;
        for (const sys of this.systems) {
            if (sys.updateFixed) {
                sys.updateFixed(dt);
            }
        }
    }

    render() {
        for (const renderSys of this.renderSystems) {
            if (renderSys.render) {
                // Pass alpha for interpolation if needed: this.time.accumulator / this.time.fixedDeltaTime
                renderSys.render(this.time.accumulator / this.time.fixedDeltaTime);
            }
        }
    }
}
