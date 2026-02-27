/**
 * Input Handler
 * Mouse and touch events.
 */
import { Vector } from '../math/vector.js';

export class Input {
    /**
     * @param {HTMLElement} element 
     * @param {Scene} scene 
     */
    constructor(element, scene) {
        this.element = element;
        this.scene = scene;

        this.mouse = new Vector(0, 0);
        this.selected = null;
        this.isDragging = false;
        this.lastMouse = new Vector(0, 0);

        // Bindings
        element.addEventListener('mousedown', this.onDown.bind(this));
        element.addEventListener('mousemove', this.onMove.bind(this));
        element.addEventListener('mouseup', this.onUp.bind(this));
        element.addEventListener('contextmenu', e => e.preventDefault()); // Right click logic
    }

    getMousePos(e) {
        const rect = this.element.getBoundingClientRect();
        return new Vector(e.clientX - rect.left, e.clientY - rect.top);
    }

    onDown(e) {
        this.mouse = this.getMousePos(e);
        this.lastMouse = this.mouse.copy();

        // Check intersection with entities
        // Reverse order to pick top-most
        for (let i = this.scene.entities.length - 1; i >= 0; i--) {
            const entity = this.scene.entities[i];
            if ((entity.draggable || entity.rotatable) && entity.containsPoint(this.mouse)) {
                this.selected = entity;
                this.isDragging = true;

                // Right click or Shift+Click to rotate?
                // Or handle rotation handle?
                // For simplicity: Left click drag = move.
                // Shift + Left click drag = rotate.
                this.mode = e.shiftKey || e.button === 2 ? 'rotate' : 'move';
                return;
            }
        }

        this.selected = null;
    }

    onMove(e) {
        this.mouse = this.getMousePos(e);

        if (this.selected && this.isDragging) {
            if (this.mode === 'move' && this.selected.draggable) {
                const delta = this.mouse.sub(this.lastMouse);
                this.selected.position = this.selected.position.add(delta);
            } else if (this.mode === 'rotate' && this.selected.rotatable) {
                // Rotate based on relative position to center
                const v1 = this.lastMouse.sub(this.selected.position);
                const v2 = this.mouse.sub(this.selected.position);
                const a1 = Math.atan2(v1.y, v1.x);
                const a2 = Math.atan2(v2.y, v2.x);
                this.selected.angle += (a2 - a1);
            }
        }

        this.lastMouse = this.mouse.copy();
    }

    onUp(e) {
        this.isDragging = false;
        // Keep selection? Or clear?
        // this.selected = null; 
    }
}
