import { Vector2 } from '../physics/Vector2.js';
import { GestureRecognizer } from './GestureRecognizer.js';

export class InputHandler {
    constructor(element, game) {
        this.element = element;
        this.game = game;
        this.currentStroke = [];
        this.isDrawing = false;
        this.gestures = [];

        this.recognizer = new GestureRecognizer();

        this.setupListeners();
    }

    setupListeners() {
        // Mouse Events
        this.element.addEventListener('mousedown', this.handleStart.bind(this));
        window.addEventListener('mousemove', this.handleMove.bind(this));
        window.addEventListener('mouseup', this.handleEnd.bind(this));

        // Touch Events
        this.element.addEventListener('touchstart', this.handleStart.bind(this), { passive: false });
        window.addEventListener('touchmove', this.handleMove.bind(this), { passive: false });
        window.addEventListener('touchend', this.handleEnd.bind(this));

        // Keyboard Events
        this.keys = {};
        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
    }

    getPos(e) {
        const rect = this.element.getBoundingClientRect();
        let clientX, clientY;

        if (e.changedTouches) {
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        return new Vector2(clientX - rect.left, clientY - rect.top);
    }

    handleStart(e) {
        // e.preventDefault(); // Prevent scrolling on touch
        this.isDrawing = true;
        this.currentStroke = [];
        const pos = this.getPos(e);
        this.currentStroke.push(pos);
    }

    handleMove(e) {
        if (!this.isDrawing) return;
        // e.preventDefault();

        const pos = this.getPos(e);

        // Simple distance filter to reduce points
        const lastPoint = this.currentStroke[this.currentStroke.length - 1];
        if (pos.distanceSq(lastPoint) > 10) { // Reduced from 25 to 10 for better precision
            this.currentStroke.push(pos);
        }
    }

    handleEnd(e) {
        if (!this.isDrawing) return;
        this.isDrawing = false;

        // Process stroke for gestures
        const gesture = this.recognizer.recognize(this.currentStroke);
        if (gesture) {
            this.gestures.push(gesture);
        }

        // Clear visualization after a short delay or immediately depending on design
        // For now, we clear it next frame implicitly in Game.render via drawing logic, 
        // but we'll reset the data array here.
        // Actually, we want to show the trail fading, but for MVP we just clear.
        this.currentStroke = [];
    }

    getGestures() {
        return this.gestures;
    }

    clearGestures() {
        this.gestures = [];
    }
}
