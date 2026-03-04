/**
 * Brush tool for interacting with the simulation.
 * Allows the user to "paint" chemical B into the grid.
 * @module UI/Brush
 */

export class Brush {
    constructor(canvasManager, simulationEngine) {
        this.canvasManager = canvasManager;
        this.simulation = simulationEngine;
        this.isDrawing = false;
        this.radius = 10;

        this.bindEvents();
    }

    bindEvents() {
        const canvas = this.canvasManager.canvas;

        const startDrawing = (e) => {
            this.isDrawing = true;
            this.paint(e);
        };

        const stopDrawing = () => {
            this.isDrawing = false;
        };

        const draw = (e) => {
            if (this.isDrawing) {
                this.paint(e);
            }
        };

        canvas.addEventListener('mousedown', startDrawing);
        window.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mousemove', draw);

        // Touch support
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent scrolling
            startDrawing(e.touches[0]);
        }, { passive: false });

        window.addEventListener('touchend', stopDrawing);

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.isDrawing) {
                this.paint(e.touches[0]);
            }
        }, { passive: false });
    }

    paint(inputEvent) {
        const rect = this.canvasManager.canvas.getBoundingClientRect();

        // Calculate coordinates relative to the canvas element
        const xStr = inputEvent.clientX - rect.left;
        const yStr = inputEvent.clientY - rect.top;

        // Map to simulation grid coordinates
        // The canvas is displayed at 'rect.width' x 'rect.height'
        // The simulation is 'this.simulation.width' x 'this.simulation.height'

        const scaleX = this.simulation.width / rect.width;
        const scaleY = this.simulation.height / rect.height;

        const gridX = Math.floor(xStr * scaleX);
        const gridY = Math.floor(yStr * scaleY);

        this.simulation.seed(gridX, gridY, this.radius);
    }

    setRadius(r) {
        this.radius = r;
    }
}
