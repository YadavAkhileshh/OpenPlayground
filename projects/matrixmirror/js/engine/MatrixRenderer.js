/**
 * @file MatrixRenderer.js
 * @description Renders the ASCII grid to the main canvas.
 * Supports efficient text drawing and fade effects.
 */

export class MatrixRenderer {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.config = config || { density: 12 };

        this.cols = 0;
        this.rows = 0;

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.clientWidth;
        this.canvas.height = parent.clientHeight;

        // Calculate grid dimensions
        // Ensure density is at least 6 to avoid crash
        const density = Math.max(6, this.config.density);

        this.cols = Math.ceil(this.canvas.width / density);
        this.rows = Math.ceil(this.canvas.height / density);

        // Pre-configure context
        this.ctx.font = \`\${density}px monospace\`;
        this.ctx.textBaseline = 'top';
        this.ctx.textAlign = 'left';
    }

    clear(fadeAmount = 0.3) {
        // Fade effect: draw a semi-transparent black rectangle
        // The lower the alpha, the longer the trails
        this.ctx.fillStyle = \`rgba(0, 0, 0, \${fadeAmount})\`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Render the grid.
     * @param {Array} grid - 2D array of cells.
     */
    render(grid) {
        if (!grid || grid.length === 0) return;

        const density = this.config.density;
        this.ctx.font = \`\${density}px monospace\`;

        for (let y = 0; y < grid.length; y++) {
            const row = grid[y];
            for (let x = 0; x < row.length; x++) {
                const cell = row[x];
                
                // Skip dark cells for performance and to allow trails to show
                if (cell.brightness < 0.05) continue;

                this.ctx.fillStyle = cell.color;
                this.ctx.fillText(cell.char, x * density, y * density);
            }
        }
    }
}
