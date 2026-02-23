// input.js
import { Vec2 } from '../math/vec2.js';
import { globalEvents } from './eventBus.js';

export class Input {
    constructor(canvasElement, camera) {
        this.canvas = canvasElement;
        this.camera = camera;

        this.mousePosScreen = new Vec2();
        this.mousePosWorld = new Vec2();

        this.isMouseDown = false;
        this.isRightMouseDown = false;

        this.sliceStart = new Vec2();
        this.sliceEnd = new Vec2();
        this.isSlicing = false;

        this.keys = new Set();

        this.setupListeners();
    }

    setupListeners() {
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        window.addEventListener('mouseup', (e) => this.onMouseUp(e));

        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());

        window.addEventListener('keydown', (e) => {
            this.keys.add(e.code);
            if (e.code === 'Space') {
                globalEvents.emit('toggle_slowmo_key', true);
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
            if (e.code === 'Space') {
                globalEvents.emit('toggle_slowmo_key', false);
            }
        });
    }

    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePosScreen.set(e.clientX - rect.left, e.clientY - rect.top);
        this.mousePosWorld = this.camera.screenToWorld(this.mousePosScreen);

        if (this.isSlicing) {
            this.sliceEnd.copy(this.mousePosWorld);
            globalEvents.emit('slice_update', { start: this.sliceStart, end: this.sliceEnd });
        }
    }

    onMouseDown(e) {
        // Left click
        if (e.button === 0) {
            this.isMouseDown = true;
            this.isSlicing = true;
            this.sliceStart.copy(this.mousePosWorld);
            this.sliceEnd.copy(this.mousePosWorld);
            globalEvents.emit('slice_start', { start: this.sliceStart });
        }
        // Right click
        else if (e.button === 2) {
            this.isRightMouseDown = true;
            globalEvents.emit('mouse_right_down', { pos: this.mousePosWorld });
        }
    }

    onMouseUp(e) {
        if (e.button === 0 && this.isMouseDown) {
            this.isMouseDown = false;
            if (this.isSlicing) {
                this.isSlicing = false;
                globalEvents.emit('slice_end', { start: this.sliceStart, end: this.mousePosWorld });
            }
        }
        else if (e.button === 2) {
            this.isRightMouseDown = false;
        }
    }

    isKeyDown(code) {
        return this.keys.has(code);
    }
}
