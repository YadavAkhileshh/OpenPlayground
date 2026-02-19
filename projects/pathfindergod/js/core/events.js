/**
 * Handles mouse and touch inputs for grid interaction.
 */
export class InputHandler {
    constructor(canvas, grid, renderer) {
        this.canvas = canvas;
        this.grid = grid;
        this.renderer = renderer;
        this.isMouseDown = false;
        this.isDraggingStart = false;
        this.isDraggingEnd = false;
        this.isDrawingWall = false; // true = draw wall, false = erase wall

        this.initEvents();
    }

    initEvents() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());

        // Touch events for mobile support (bonus)
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', () => this.handleMouseUp());
    }

    getNodeFromEvent(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = (e.clientX || e.touches[0].clientX) - rect.left;
        const mouseY = (e.clientY || e.touches[0].clientY) - rect.top;

        // Account for offsets in renderer
        const x = mouseX - this.renderer.offsetX;
        const y = mouseY - this.renderer.offsetY;

        if (x < 0 || y < 0) return null;

        const col = Math.floor(x / this.renderer.cellSize);
        const row = Math.floor(y / this.renderer.cellSize);

        return this.grid.getNode(row, col);
    }

    handleMouseDown(e) {
        e.preventDefault(); // Prevent text selection
        this.isMouseDown = true;
        const node = this.getNodeFromEvent(e);
        if (!node) return;

        if (node.isStart) {
            this.isDraggingStart = true;
            this.renderer.audio.playStart();
        } else if (node.isEnd) {
            this.isDraggingEnd = true;
            this.renderer.audio.playStart();
        } else {
            // Determine if we are drawing or erasing based on the first node clicked
            // this.isDrawingWall = !node.isWall; // Removed
            // this.toggleWall(node); // Removed
            this.drawOnNode(node);
        }
    }

    handleMouseMove(e) {
        if (!this.isMouseDown) return;
        const node = this.getNodeFromEvent(e);
        if (!node) return;

        if (this.isDraggingStart) {
            if (!node.isEnd && !node.isWall) {
                // Update start node position
                this.grid.setStartNode(node.row, node.col);
                this.renderer.drawGrid(); // Redraw entire grid to clear old start position cleanly
                // Optimization: In a real app we'd only redraw the two changed nodes, but for drag ease, redraw grid is safest
            }
        } else if (this.isDraggingEnd) {
            if (!node.isStart && !node.isWall) {
                this.grid.setEndNode(node.row, node.col);
                this.renderer.drawGrid();
            }
        } else {
            // this.toggleWall(node); // Removed
            this.drawOnNode(node);
        }
    }

    handleMouseUp() {
        this.isMouseDown = false;
        this.isDraggingStart = false;
        this.isDraggingEnd = false;
    }

    handleTouchStart(e) {
        this.handleMouseDown(e);
    }

    handleTouchMove(e) {
        // Prevent scrolling while drawing
        e.preventDefault();
        this.handleMouseMove(e);
    }

    // toggleWall(node) { // Removed
    //     if (node.isStart || node.isEnd) return;

    //     // Only update if state is different to avoid unnecessary redraws
    //     if (node.isWall !== this.isDrawingWall) {
    //         node.isWall = this.isDrawingWall;
    //         this.renderer.drawNode(node);
    //     }
    // }

    drawOnNode(node) {
        if (node.isStart || node.isEnd) return;

        const brush = document.getElementById('brush-select').value;

        if (brush === 'wall') {
            // const isDrawing = !node.isWall; // Simplified toggle logic for drag
            // A better drag draw would need to track "mode" (adding or removing) on mouse down
            // For now, let's just set to Wall if it's not, or empty if it is
            // Correction: On mouseDown we should determine if we are ADDING or REMOVING
            // But for simple "paint", let's just paint the brush type.

            // To make it behave like a paint tool:
            node.isWall = true;
            node.weight = 1;
            this.renderer.audio.playWall();
        } else if (brush === 'weight') {
            node.isWall = false;
            node.weight = 5;
            this.renderer.audio.playWeight();
        } else if (brush === 'water') {
            node.isWall = false;
            node.weight = 10;
            this.renderer.audio.playWeight();
        } else {
            // Eraser logic could go here if selected, or right click
        }

        // Handling right click to erase would be good too
        this.renderer.drawNode(node);
    }
}
