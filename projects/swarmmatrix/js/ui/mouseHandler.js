/**
 * js/ui/mouseHandler.js
 * Intercepts mouse events on the overlay canvas and routes to tools.
 */

import { state } from '../core/state.js';

export class MouseHandler {
    constructor(toolManager, camera) {
        this.toolManager = toolManager;
        this.camera = camera;

        this.canvas = document.getElementById('ui-overlay-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;

        this.bindEvents();
    }

    bindEvents() {
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));

        // Bind to window to handle drags outside canvas
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));

        // Touch support
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.fireDown(touch.clientX, touch.clientY);
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            if (this.isDragging) {
                e.preventDefault();
                const touch = e.touches[0];
                this.fireMove(touch.clientX, touch.clientY);
            }
        }, { passive: false });

        window.addEventListener('touchend', this.onMouseUp.bind(this));
    }

    onMouseDown(e) {
        // Only trigger if clicking on the canvas directly, not on UI panels overhead
        if (e.target !== this.canvas) return;

        this.fireDown(e.clientX, e.clientY);
    }

    fireDown(clientX, clientY) {
        this.isDragging = true;
        const rect = this.canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        this.lastX = x;
        this.lastY = y;

        const worldPos = this.camera.screenToWorld(x, y);
        this.toolManager.applyTool(worldPos.x, worldPos.y);
    }

    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Draw brush preview indicator if relevant tool active
        const tool = state.get('activeTool');
        if (tool === 'pheromone_brush' || tool === 'erase') {
            // Draw via renderer next frame ideally, but we can quick over-draw here if needed
            // Actually, best to do it in a dedicated UI render pass, handled elsewhere
        }

        if (this.isDragging) {
            const worldPos = this.camera.screenToWorld(x, y);
            this.toolManager.applyToolDrag(worldPos.x, worldPos.y);

            this.lastX = x;
            this.lastY = y;
        }
    }

    onMouseUp(e) {
        this.isDragging = false;
    }
}
