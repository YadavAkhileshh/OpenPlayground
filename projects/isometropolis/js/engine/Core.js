import { EventEmitter } from './EventEmitter.js';
import { Time } from './Time.js';
import { Loop } from './Loop.js';
import { Input } from './Input.js';

/**
 * Singleton-like Core container that wires up the raw engine parts.
 */
export class Core {
    /**
     * @param {HTMLCanvasElement} canvas
     * @param {Camera} camera - injected so Input can pan it
     */
    constructor(canvas, camera) {
        this.events = new EventEmitter();
        this.time = new Time();
        this.loop = new Loop(this.time, this.events);
        this.input = new Input(document.getElementById('app'), this.events, camera);
        this.camera = camera;
        this.canvas = canvas;

        this.init();
    }

    init() {
        // Handle window resizing
        window.addEventListener('resize', this.onResize.bind(this));
        this.onResize();

        // Keyboard pan functionality (WASD / Arrows)
        this.events.on('loop:preUpdate', () => {
            const panSpeed = 600 * this.time.unscaledDeltaTime / this.camera.zoom;
            let dx = 0; let dy = 0;
            if (this.input.isKeyDown('w') || this.input.isKeyDown('arrowup')) dy -= panSpeed;
            if (this.input.isKeyDown('s') || this.input.isKeyDown('arrowdown')) dy += panSpeed;
            if (this.input.isKeyDown('a') || this.input.isKeyDown('arrowleft')) dx -= panSpeed;
            if (this.input.isKeyDown('d') || this.input.isKeyDown('arrowright')) dx += panSpeed;

            if (dx !== 0 || dy !== 0) {
                this.camera.position.x += dx;
                this.camera.position.y += dy;
                this.camera.updateMatrix();
            }
        });
    }

    /**
     * Triggers canvas resize based on body size.
     */
    onResize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = document.body.getBoundingClientRect();

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        // Handle overlay canvas as well
        const overlay = document.getElementById('overlay-canvas');
        if (overlay) {
            overlay.width = rect.width * dpr;
            overlay.height = rect.height * dpr;
        }

        // Inform camera of new viewport dimensions
        this.camera.setViewport(rect.width, rect.height, dpr);
        this.events.emit('core:resize', { width: rect.width, height: rect.height, dpr });
    }

    /**
     * Starts the engine
     */
    start() {
        this.loop.start();
    }
}
