/**
 * Input Handler
 * Manages mouse and touch interactions, mapping them to the Physics Engine.
 */
export class InputHandler {
    constructor(canvas, state, physics) {
        this.canvas = canvas;
        this.state = state;
        this.physics = physics;

        this.setupListeners();
    }

    setupListeners() {
        const c = this.canvas;

        c.addEventListener('mousedown', (e) => {
            this.state.isMouseDown = true;
            this.handleInteraction(e);
        });

        window.addEventListener('mouseup', () => {
            this.state.isMouseDown = false;
        });

        c.addEventListener('mousemove', (e) => {
            const rect = c.getBoundingClientRect();
            this.state.mouseX = e.clientX - rect.left;
            this.state.mouseY = e.clientY - rect.top;

            if (this.state.isMouseDown) {
                this.handleInteraction(e);
            }
        });

        // Prevent context menu to allow Right Click for stones
        c.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.placeStone(e);
        });
    }

    handleInteraction(e) {
        const relX = this.state.mouseX / this.canvas.width;
        const relY = this.state.mouseY / this.canvas.height;
        const relR = this.state.brushSize / this.canvas.width;

        if (this.state.activeTool === 'rake') {
            this.physics.applyRake(relX, relY, relR, 0.05);
        } else if (this.state.activeTool === 'water') {
            this.physics.applyWater(relX, relY, relR);
        } else if (this.state.activeTool === 'level') {
            this.physics.init();
        }
    }

    placeStone(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.canvas.width;
        const y = (e.clientY - rect.top) / this.canvas.height;
        const radius = (Math.random() * 0.03) + 0.02; // Random stone size

        this.physics.addStone(x, y, radius);
    }
}
