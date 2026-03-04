/**
 * renderer.js
 * Handles Canvas rendering validation and execution.
 */

class Renderer {
    constructor(canvasId, grid, config) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', { alpha: false }); // Optimize for no transparency
        this.grid = grid;
        this.config = config;

        // Initial defaults (overwritten by Themes)
        this.aliveColor = config.COLOR_ALIVE || '#00ffcc';
        this.deadColor = config.COLOR_DEAD || '#0a0a0e';
        this.trailColor = 'rgba(10, 10, 14, 0.4)';

        // Resize observer to handle responsiveness
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.clientWidth;
        this.canvas.height = parent.clientHeight;

        // Calculate cell size to fit the grid
        const cellW = this.canvas.width / this.grid.cols;
        const cellH = this.canvas.height / this.grid.rows;

        // Use the smaller dimension to keep squares
        this.cellSize = Math.min(cellW, cellH);

        // Center the grid?
        this.offsetX = (this.canvas.width - (this.grid.cols * this.cellSize)) / 2;
        this.offsetY = (this.canvas.height - (this.grid.rows * this.cellSize)) / 2;
    }

    draw() {
        // Fade effect / Trail
        this.ctx.fillStyle = this.trailColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Standard Glow
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = this.aliveColor;

        for (let r = 0; r < this.grid.rows; r++) {
            for (let c = 0; c < this.grid.cols; c++) {
                if (this.grid.cells[r][c] === 1) {
                    const x = this.offsetX + c * this.cellSize;
                    const y = this.offsetY + r * this.cellSize;
                    const size = Math.max(1, this.cellSize - 1);

                    // Age visualization: Older cells slightly different color?
                    // Or keep it simple with uniform color for now but capable of expansion.
                    // If we want to vary color by age:
                    // const age = this.grid.ages[r][c];
                    // this.ctx.fillStyle = (age > 10) ? '#ffffff' : this.aliveColor; 

                    this.ctx.fillStyle = this.aliveColor;

                    this.ctx.fillRect(
                        Math.floor(x),
                        Math.floor(y),
                        Math.ceil(size),
                        Math.ceil(size)
                    );
                }
            }
        }

        this.ctx.shadowBlur = 0;
    }
}
