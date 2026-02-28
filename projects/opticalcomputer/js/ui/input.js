import { Laser } from '../components/laser.js';
import { Mirror } from '../components/mirror.js';
import { Splitter } from '../components/splitter.js';
import { Sensor } from '../components/sensor.js';
import { Vec2 } from '../engine/math.js';

export class InputHandler {
    constructor(canvas, scene) {
        this.canvas = canvas;
        this.scene = scene;
        this.selectedComponent = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.onSelectionChange = null; // Callback

        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        // Global mouseup to catch drags that go outside canvas
        window.addEventListener('mouseup', this.onMouseUp.bind(this));
        window.addEventListener('keydown', this.onKeyDown.bind(this));
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    onMouseDown(e) {
        const pos = this.getMousePos(e);

        // Check for click on existing component (reverse order for z-index)
        let clicked = null;
        for (let i = this.scene.length - 1; i >= 0; i--) {
            if (this.scene[i].hitTest(pos.x, pos.y)) {
                clicked = this.scene[i];
                break;
            }
        }

        if (clicked) {
            this.select(clicked);
            this.isDragging = true;
            this.dragOffset = Vec2.sub(pos, clicked.position);
        } else {
            this.select(null);
        }
    }

    onMouseMove(e) {
        if (this.isDragging && this.selectedComponent) {
            const pos = this.getMousePos(e);

            // Snap to grid (optional, say 10px)
            let newX = pos.x - this.dragOffset.x;
            let newY = pos.y - this.dragOffset.y;

            // newX = Math.round(newX / 10) * 10;
            // newY = Math.round(newY / 10) * 10;

            this.selectedComponent.moveTo(newX, newY);
        }
    }

    onMouseUp(e) {
        this.isDragging = false;
    }

    onKeyDown(e) {
        if (!this.selectedComponent) return;

        // Rotate: R
        if (e.key.toLowerCase() === 'r') {
            this.selectedComponent.rotate(this.selectedComponent.rotation + Math.PI / 4);
        }

        // Delete: Delete or Backspace
        if (e.key === 'Delete' || e.key === 'Backspace') {
            const idx = this.scene.indexOf(this.selectedComponent);
            if (idx > -1) {
                this.scene.splice(idx, 1);
                this.select(null);
            }
        }
    }

    select(comp) {
        this.scene.forEach(c => c.selected = false);
        this.selectedComponent = comp;
        if (comp) comp.selected = true;

        if (this.onSelectionChange) {
            this.onSelectionChange(comp);
        }
    }

    addComponent(type) {
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        let comp;

        switch (type) {
            case 'laser': comp = new Laser(cx, cy); break;
            case 'mirror': comp = new Mirror(cx, cy); break;
            case 'splitter': comp = new Splitter(cx, cy); break;
            case 'sensor': comp = new Sensor(cx, cy); break;
        }

        if (comp) {
            this.scene.push(comp);
            this.select(comp);
        }
    }
}
