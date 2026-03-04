import { Vector2 } from '../math/Vector2.js';
import { Utils } from '../math/Utils.js';

/**
 * Handles mouse and keyboard input. Supports panning, zooming, and tracking 
 * world and screen coordinates of the cursor.
 */
export class Input {
    /**
     * @param {HTMLElement} element - Usually the canvas or document body.
     * @param {EventEmitter} events
     * @param {Camera} camera
     */
    constructor(element, events, camera) {
        this.element = element;
        this.events = events;
        this.camera = camera;

        this.mousePos = new Vector2();
        this.lastMousePos = new Vector2();

        // Is pointer down (left click usually)
        this.isPointerDown = false;

        // Is panning via middle mouse or right click / spacebar
        this.isPanning = false;

        this.keys = new Set();

        this.dragOffset = new Vector2();

        this._bindEvents();
    }

    _bindEvents() {
        // Pointer events
        this.element.addEventListener('pointerdown', this._onPointerDown.bind(this));
        // Use window for move/up to not lose tracking if dragging outside
        window.addEventListener('pointermove', this._onPointerMove.bind(this));
        window.addEventListener('pointerup', this._onPointerUp.bind(this));

        this.element.addEventListener('wheel', this._onWheel.bind(this), { passive: false });
        this.element.addEventListener('contextmenu', e => e.preventDefault());

        // Keyboard events
        window.addEventListener('keydown', this._onKeyDown.bind(this));
        window.addEventListener('keyup', this._onKeyUp.bind(this));
    }

    _onPointerDown(e) {
        // Only target canvas/element directly to prevent UI clicks from bleeding
        if (e.target.closest('#ui-layer') && e.target.closest('#ui-layer').contains(e.target)) {
            if (e.target.tagName !== 'CANVAS') {
                return; // Clicked on UI 
            }
        }

        const rect = this.element.getBoundingClientRect();
        this.mousePos.set(e.clientX - rect.left, e.clientY - rect.top);
        this.lastMousePos.copy(this.mousePos);

        // Middle drag or right drag for pan
        if (e.button === 1 || e.button === 2) {
            this.isPanning = true;
            this.element.style.cursor = 'grabbing';
            e.preventDefault();
        } else if (e.button === 0) {
            this.isPointerDown = true;
            this.events.emit('input:pointerDown', { pos: this.mousePos.clone(), originalEvent: e });
        }
    }

    _onPointerMove(e) {
        const rect = this.element.getBoundingClientRect();
        const curPos = new Vector2(e.clientX - rect.left, e.clientY - rect.top);

        const dx = curPos.x - this.lastMousePos.x;
        const dy = curPos.y - this.lastMousePos.y;

        if (this.isPanning) {
            // Apply pan to camera (accounting for zoom scale to feel 1:1)
            this.camera.position.x -= dx / this.camera.zoom;
            this.camera.position.y -= dy / this.camera.zoom;
            this.camera.updateMatrix();
        } else {
            this.mousePos.copy(curPos);
            if (this.isPointerDown) {
                this.events.emit('input:pointerDrag', {
                    pos: this.mousePos.clone(),
                    delta: new Vector2(dx, dy),
                    originalEvent: e
                });
            } else {
                this.events.emit('input:pointerMove', { pos: this.mousePos.clone(), originalEvent: e });
            }
        }

        this.lastMousePos.copy(curPos);
    }

    _onPointerUp(e) {
        if (e.button === 1 || e.button === 2) {
            this.isPanning = false;
            this.element.style.cursor = 'default';
        } else if (e.button === 0 && this.isPointerDown) {
            this.isPointerDown = false;
            this.events.emit('input:pointerUp', { pos: this.mousePos.clone(), originalEvent: e });
        }
    }

    _onWheel(e) {
        if (e.target.closest('#ui-layer')) {
            if (e.target.tagName !== 'CANVAS') {
                return; // Scroll over UI ignores canvas zoom
            }
        }
        e.preventDefault();

        const zoomSpeed = 0.1;
        const direction = Math.sign(e.deltaY);

        let newZoom = this.camera.zoom;
        if (direction > 0) {
            newZoom *= (1 - zoomSpeed); // Zoom out
        } else {
            newZoom *= (1 + zoomSpeed); // Zoom in
        }

        // Clamp zooming
        newZoom = Utils.clamp(newZoom, 0.2, 3.0);

        // Emulate zoom targeting mouse center
        this.camera.zoomToPoint(this.mousePos, newZoom);
    }

    _onKeyDown(e) {
        this.keys.add(e.key.toLowerCase());
        this.events.emit('input:keyDown', e.key.toLowerCase());
    }

    _onKeyUp(e) {
        this.keys.delete(e.key.toLowerCase());
        this.events.emit('input:keyUp', e.key.toLowerCase());
    }

    isKeyDown(key) {
        return this.keys.has(key.toLowerCase());
    }
}
