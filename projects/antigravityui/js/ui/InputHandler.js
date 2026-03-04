// js/ui/InputHandler.js
import { Vector2D } from '../core/Vector2D.js';

export class InputHandler {
    constructor(engine) {
        this.engine = engine;
        this.pointerPos = new Vector2D(window.innerWidth / 2, window.innerHeight / 2);
        this.isActive = false;
        this.repulsionStrength = 1.0;

        this.initEvents();
    }

    initEvents() {
        window.addEventListener('mousemove', (e) => {
            this.pointerPos.set(e.clientX, e.clientY);
            this.isActive = true;
        });

        window.addEventListener('mouseleave', () => {
            this.isActive = false;
        });

        window.addEventListener('touchstart', (e) => {
            this.pointerPos.set(e.touches[0].clientX, e.touches[0].clientY);
            this.isActive = true;
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            this.pointerPos.set(e.touches[0].clientX, e.touches[0].clientY);
            this.isActive = true;
        }, { passive: false });

        window.addEventListener('touchend', () => {
            this.isActive = false;
        });
    }

    setStrength(val) {
        this.repulsionStrength = val;
    }

    update() {
        if (this.isActive) {
            this.engine.setPointerInfo(this.pointerPos, this.repulsionStrength);
        } else {
            this.engine.setPointerInfo(null, this.repulsionStrength);
        }
    }
}
