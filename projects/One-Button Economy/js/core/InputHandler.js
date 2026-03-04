/**
 * InputHandler.js
 * 
 * Handles all user input (Keyboard, Mouse, Touch).
 * Implements the core "One-Button" logic using timing to distinguish actions.
 */

import { INPUT_CONFIG, EVENTS } from './Constants.js';
import { GameEvents } from './EventManager.js';

export class InputHandler {
    constructor() {
        this.isPressed = false;
        this.pressStartTime = 0;
        this.clickCount = 0;
        this.clickTimer = null;

        this.boundHandleStart = this.handleInputStart.bind(this);
        this.boundHandleEnd = this.handleInputEnd.bind(this);
        this.boundHandleKey = this.handleKey.bind(this);

        this.initialized = false;
    }

    /**
     * Initializes event listeners.
     */
    init() {
        if (this.initialized) return;

        // Mouse / Touch
        document.addEventListener('mousedown', this.boundHandleStart);
        document.addEventListener('mouseup', this.boundHandleEnd);
        document.addEventListener('mousemove', this.boundMouseMove);

        document.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent scrolling/zooming
            this.handleInputStart();
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleInputEnd();
        });

        // Keyboard (Spacebar)
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.repeat) {
                this.handleInputStart();
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                this.handleInputEnd();
            }
        });

        this.initialized = true;
        console.log('InputHandler initialized');
    }

    /**
     * Cleans up event listeners.
     */
    destroy() {
        document.removeEventListener('mousedown', this.boundHandleStart);
        document.removeEventListener('mouseup', this.boundHandleEnd);
        // ... remove others ...
        this.initialized = false;
    }

    handleInputStart() {
        if (this.isPressed) return;

        this.isPressed = true;
        this.pressStartTime = Date.now();

        // Visual feedback immediate response
        // In a real engine, we might emit an event here for "charging" UI
        // GameEvents.emit(EVENTS.INPUT_DOWN);
    }

    handleInputEnd() {
        if (!this.isPressed) return;

        this.isPressed = false;
        const pressDuration = Date.now() - this.pressStartTime;

        if (pressDuration > INPUT_CONFIG.SHORT_PRESS_MAX) {
            // Long Press (Attack)
            this.triggerAction(EVENTS.INPUT_ATTACK);
            this.resetClickCount();
        } else {
            // Potential Short Press or start of Double Press
            this.clickCount++;

            if (this.clickCount === 1) {
                // Wait to see if a second click comes
                this.clickTimer = setTimeout(() => {
                    this.triggerAction(EVENTS.INPUT_MOVE);
                    this.resetClickCount();
                }, INPUT_CONFIG.DOUBLE_PRESS_WINDOW);
            } else {
                // Double Click (Dash)
                clearTimeout(this.clickTimer);
                this.triggerAction(EVENTS.INPUT_DASH);
                this.resetClickCount();
            }
        }
    }

    handleMouseMove(e) {
        this.updateMousePos(e.clientX, e.clientY);
    }

    updateMousePos(clientX, clientY) {
        // We'll calculate relative to game canvas if possible, or just raw window
        // Ideally we want coords relative to the canvas
        const canvas = document.getElementById('game-area');
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            this.mousePos.x = clientX - rect.left;
            this.mousePos.y = clientY - rect.top;
        } else {
            this.mousePos.x = clientX;
            this.mousePos.y = clientY;
        }
    }

    handleKey(e) {
        // Generic key handler
    }

    triggerAction(eventType) {
        console.log(`Input Action: ${eventType}`, this.mousePos);
        GameEvents.emit(eventType, {
            timestamp: Date.now(),
            mouse: { ...this.mousePos } // Pass copy of mouse pos
        });
    }

    resetClickCount() {
        this.clickCount = 0;
        this.clickTimer = null;
    }
}
