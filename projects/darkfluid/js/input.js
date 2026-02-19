/**
 * DarkFluid - Cinematic Fluid Simulation
 * Input Module
 * 
 * Handles user interactions (Mouse, Touch) to inject
 * density and velocity into the simulation grid.
 * 
 * @module Input
 */

import { Config } from './config.js';

export class InputHandler {
    /**
     * @param {HTMLCanvasElement} canvas 
     * @param {import('./grid.js').FluidGrid} grid 
     */
    constructor(canvas, grid) {
        this.canvas = canvas;
        this.grid = grid;
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;

        // Normalize coordinates to grid space
        this.rect = this.canvas.getBoundingClientRect();

        this.initListeners();
    }

    initListeners() {
        this.canvas.addEventListener('contextmenu', e => e.preventDefault()); // Stop context menu globally on canvas
        this.canvas.addEventListener('mousedown', this.onDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMove.bind(this));
        window.addEventListener('mouseup', this.onUp.bind(this));

        // Touch support
        this.canvas.addEventListener('touchstart', (e) => {
            this.button = 0;
            this.onDown(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault(); // Prevent scrolling
            this.onMove(e.touches[0]);
        });
        window.addEventListener('touchend', this.onUp.bind(this));

        // Resize listener to update rect
        window.addEventListener('resize', () => {
            this.rect = this.canvas.getBoundingClientRect();
        });
    }

    /**
     * Get grid coordinates from screen coordinates
     * @param {number} clientX 
     * @param {number} clientY 
     */
    getGridCoords(clientX, clientY) {
        const x = clientX - this.rect.left;
        const y = clientY - this.rect.top;

        // Map to grid range [0, GRID_SIZE]
        const gx = (x / this.rect.width) * this.grid.size;
        const gy = (y / this.rect.height) * this.grid.size;

        return { x: gx, y: gy };
    }

    onDown(e) {
        this.isDragging = true;
        const coords = this.getGridCoords(e.clientX, e.clientY);
        this.lastX = coords.x;
        this.lastY = coords.y;
        this.inject(coords.x, coords.y, 0, 0); // Inject initial blob even without movement
    }

    onUp() {
        this.isDragging = false;
    }

    onMove(e) {
        if (!this.isDragging) return;

        const coords = this.getGridCoords(e.clientX, e.clientY);

        const dx = coords.x - this.lastX;
        const dy = coords.y - this.lastY;

        this.inject(coords.x, coords.y, dx, dy);

        this.lastX = coords.x;
        this.lastY = coords.y;
    }

    /**
     * Injects density and velocity into the grid at the specified position.
     * Uses a simple splash/brush radius.
     */
    inject(x, y, dx, dy) {
        const radius = Config.INPUT.CURSOR_RADIUS;
        const force = Config.INPUT.FORCE_MULTIPLIER;
        const densityAmount = Config.INPUT.DENSITY_INJECTION;

        const rSq = radius * radius;

        const startX = Math.floor(Math.max(0, x - radius));
        const endX = Math.floor(Math.min(this.grid.size - 1, x + radius));
        const startY = Math.floor(Math.max(0, y - radius));
        const endY = Math.floor(Math.min(this.grid.size - 1, y + radius));

        for (let j = startY; j <= endY; j++) {
            for (let i = startX; i <= endX; i++) {
                const dX = i - x;
                const dY = j - y;
                const distSq = dX * dX + dY * dY;

                if (distSq <= rSq) {
                    // Falloff based on distance
                    const influence = 1 - (distSq / rSq);

                    // Add Density
                    this.grid.addDensity(i, j, densityAmount * influence);

                    // Add Velocity
                    this.grid.addVelocity(i, j, dx * force * influence, dy * force * influence);
                }
            }
        }
    }
}
