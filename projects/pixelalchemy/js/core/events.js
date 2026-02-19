/**
 * Input Handler
 * Manages mouse/touch interactions.
 */

import { Config } from '../core/config.js';

/**
 * Input Handler
 * 
 * Manages mouse and touch events for painting on the canvas.
 * Translates screen coordinates to grid coordinates and handles
 * continuous painting while dragging.
 */
export class InputHandler {
    constructor(canvas, grid) {
        this.canvas = canvas;
        this.grid = grid;
        this.isPainting = false;
        this.brushSize = 5;
        this.selectedMaterial = Config.MATERIALS.SAND;
        this.onPaint = null; // Callback

        this.mouseX = 0;
        this.mouseY = 0;

        this.setupEvents();
    }

    setupEvents() {
        this.canvas.addEventListener('mousedown', (e) => this.startPaint(e));
        document.addEventListener('mouseup', () => this.stopPaint());
        this.canvas.addEventListener('mousemove', (e) => this.movePaint(e));

        // Touch support
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault(); // prevent scroll
            this.startPaint(e.touches[0]);
        }, { passive: false });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.movePaint(e.touches[0]);
        }, { passive: false });
    }

    getPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        return {
            x: Math.floor((e.clientX - rect.left) * scaleX),
            y: Math.floor((e.clientY - rect.top) * scaleY)
        };
    }

    startPaint(e) {
        this.isPainting = true;
        this.paint(e);
    }

    stopPaint() {
        this.isPainting = false;
    }

    movePaint(e) {
        const pos = this.getPos(e);
        this.mouseX = pos.x;
        this.mouseY = pos.y;

        if (this.isPainting) {
            this.paint(e);
        }
    }

    paint(e) {
        if (!this.onPaint) return;
        const { x, y } = this.getPos(e);
        this.onPaint(x, y, this.brushSize, this.selectedMaterial);
    }
}
