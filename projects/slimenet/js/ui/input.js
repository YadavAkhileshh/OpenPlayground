/**
 * SlimeNet - Input Manager
 * 
 * Handles mouse and keyboard interaction.
 * UPDATED: Brush Types and Size.
 */

class InputManager {
    constructor(canvasId, grid) {
        this.canvas = document.getElementById(canvasId);
        this.grid = grid;
        this.isMouseDown = false;

        // Settings
        this.brushType = 'food'; // 'food', 'obstacle', 'eraser'
        this.brushSize = 20;

        this.setupEvents();
    }

    setupEvents() {
        this.canvas.addEventListener('mousedown', (e) => {
            this.handleDraw(e);
            // Also enable drag
            const onMove = (evt) => this.handleDraw(evt);
            const onUp = () => {
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);
            };
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
        });

        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
    }

    handleDraw(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor(e.clientX - rect.left);
        const y = Math.floor(e.clientY - rect.top);

        // Feature 8: Dynamic Brush Size
        if (this.brushType === 'food') {
            // Use the new FoodSystem for persistent, shrinking food
            if (window.app && window.app.food) {
                window.app.food.add(x, y, this.brushSize, Config.grid.foodStrength);
            } else {
                this.grid.addFood(x, y, this.brushSize, Config.grid.foodStrength);
            }
        } else if (this.brushType === 'obstacle') {
            // Feature 2: Obstacles
            this.grid.addObstacle(x, y, this.brushSize);
        } else if (this.brushType === 'eraser') {
            this.grid.removeObstacle(x, y, this.brushSize);
        }
    }
}

window.InputManager = InputManager;
