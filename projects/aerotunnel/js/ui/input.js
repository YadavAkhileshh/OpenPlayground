/**
 * @file input.js
 * @description Handles mouse/touch input for drawing obstacles.
 */

export class InputHandler {
    /**
     * @param {HTMLElement} targetElement - DOM element to attach listeners to (canvas)
     * @param {LBMSolver} solver - Physics solver instance
     * @param {FlowRenderer} renderer - Renderer instance (for scaling)
     */
    constructor(targetElement, solver) {
        this.el = targetElement;
        this.solver = solver;

        this.isDrawing = false;
        this.drawMode = 1; // 1 = Add, 0 = Remove
        this.brushRadius = 3; // Grid units

        this.mouse = { x: 0, y: 0 };

        this.setupListeners();
    }

    setupListeners() {
        this.el.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.el.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));

        // Prevent context menu on right click
        this.el.addEventListener('contextmenu', e => e.preventDefault());
    }

    getGridPos(e) {
        const rect = this.el.getBoundingClientRect();
        // Calculate scale since canvas is scaled by CSS
        const scaleX = this.solver.width / rect.width;
        const scaleY = this.solver.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        return { x, y };
    }

    /**
     * Set callback for probe mode click
     * @param {Function} cb
     */
    setProbeCallback(cb) {
        this.onProbe = cb;
    }

    /**
     * Set callback for smoke injection
     * @param {Function} cb 
     */
    setSmokeCallback(cb) {
        this.onSmoke = cb;
    }

    onMouseDown(e) {
        // Check mode
        if (this.drawMode === 2) {
            // Probe Mode
            const pos = this.getGridPos(e);
            if (this.onProbe) this.onProbe(pos.x, pos.y);
            return;
        }

        this.isDrawing = true;

        // Left click = Add Obstacle (1)
        // Right click = Smoke Source? 
        // Previously Right click was Erase (0).
        // Let's change: Draw Obstacle (Left), Erase (Shift+Left), Smoke (Right)

        if (e.button === 2) {
            // Smoke Mode
            this.drawMode = 3;
        } else {
            this.drawMode = (e.shiftKey) ? 0 : 1;
        }

        const pos = this.getGridPos(e);

        if (this.drawMode <= 1) {
            this.solver.setObstacle(pos.x, pos.y, this.brushRadius, this.drawMode === 1);
        } else if (this.drawMode === 3 && this.onSmoke) {
            this.onSmoke(pos.x, pos.y, true);
        }
    }

    onMouseMove(e) {
        if (!this.isDrawing) return;
        if (this.drawMode === 2) return; // No drag for probe

        const pos = this.getGridPos(e);

        if (this.drawMode <= 1) {
            this.solver.setObstacle(pos.x, pos.y, this.brushRadius, this.drawMode === 1);
        } else if (this.drawMode === 3 && this.onSmoke) {
            this.onSmoke(pos.x, pos.y, true);
        }
    }

    onMouseUp(e) {
        this.isDrawing = false;
    }
}
