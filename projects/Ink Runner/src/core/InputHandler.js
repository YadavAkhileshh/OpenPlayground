/**
 * InputHandler.js
 * Manages keyboard and mouse/touch inputs.
 */

import { eventManager } from './EventManager.js';
import { Events } from './Settings.js';

export class InputHandler {
    constructor() {
        this.keys = new Set();
        this.touchActive = false;

        this.setupListeners();
    }

    setupListeners() {
        // Keyboard
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault(); // Prevent scrolling
                if (!this.keys.has(e.code)) {
                    this.keys.add(e.code);
                    this.emitJump();
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        });

        // Touch / Mouse
        window.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent default touch actions
            this.touchActive = true;
            this.emitJump();
        }, { passive: false });

        window.addEventListener('touchend', () => {
            this.touchActive = false;
        });

        window.addEventListener('mousedown', () => {
            this.touchActive = true;
            this.emitJump();
        });

        window.addEventListener('mouseup', () => {
            this.touchActive = false;
        });
    }

    emitJump() {
        // We just emit a "jump requested" type intent
        // The Player entity will decide if it CAN jump (based on ground state)
        eventManager.emit(Events.PLAYER_JUMP, {});
    }

    isPressed() {
        return this.keys.size > 0 || this.touchActive;
    }
}
