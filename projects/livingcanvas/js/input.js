/**
 * input.js
 * Handles mouse and touch interactions.
 */

class InputHandler {
    constructor(renderer, grid, config) {
        this.renderer = renderer;
        this.grid = grid;
        this.config = config;
        this.isDragging = false;

        this.setupListeners();
    }

    setupListeners() {
        const canvas = this.renderer.canvas;

        canvas.addEventListener('mousedown', (e) => this.handleStart(e));
        canvas.addEventListener('mousemove', (e) => this.handleMove(e));
        window.addEventListener('mouseup', () => this.handleEnd());

        // Touch support
        canvas.addEventListener('touchstart', (e) => this.handleStart(e), { passive: false });
        canvas.addEventListener('touchmove', (e) => this.handleMove(e), { passive: false });
        window.addEventListener('touchend', () => this.handleEnd());
    }

    getGridCoordinates(e) {
        const rect = this.renderer.canvas.getBoundingClientRect();

        let clientX, clientY;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const x = clientX - rect.left - this.renderer.offsetX;
        const y = clientY - rect.top - this.renderer.offsetY;

        const c = Math.floor(x / this.renderer.cellSize);
        const r = Math.floor(y / this.renderer.cellSize);

        return { r, c };
    }

    handleStart(e) {
        // e.preventDefault();
        this.isDragging = true;
        this.applyTool(e);
    }

    handleMove(e) {
        if (!this.isDragging) return;
        // e.preventDefault(); // Prevent scroll on touch
        this.applyTool(e);
    }

    handleEnd() {
        this.isDragging = false;
    }

    applyTool(e) {
        const { r, c } = this.getGridCoordinates(e);

        // Check bounds
        if (r < 0 || r >= this.grid.rows || c < 0 || c >= this.grid.cols) return;

        const tool = this.config.DRAW_MODE;

        if (tool === 'draw') {
            this.grid.setCell(r, c, 1);
        } else if (tool === 'erase') {
            this.grid.setCell(r, c, 0);
        } else if (Patterns[tool]) {
            // Patterns stamping
            // Using mousedown only to prevent dragging trails of complex patterns
            if (e.type === 'mousedown' || e.type === 'touchstart') {
                this.stampPattern(r, c, Patterns[tool]);
            }
        }
    }

    stampPattern(row, col, pattern) {
        for (let r = 0; r < pattern.length; r++) {
            for (let c = 0; c < pattern[r].length; c++) {
                if (pattern[r][c] === 1) {
                    this.grid.setCell(row + r, col + c, 1);
                }
            }
        }
    }
}
