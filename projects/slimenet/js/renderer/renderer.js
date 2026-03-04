/**
 * SlimeNet - Renderer
 * 
 * Handles drawing the Grid State to the HTML5 Canvas.
 * Uses ImageData for direct pixel manipulation (fastest CPU method).
 */

class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', { alpha: false }); // Optimization: No alpha channel on canvas itself

        this.width = 0;
        this.height = 0;
        this.imageData = null;

        // Handle resizing
        window.addEventListener('resize', () => this.resize());
        this.resize();

        Logger.info('Renderer', 'Renderer initialized');
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Re-create ImageData buffer
        this.imageData = this.ctx.createImageData(this.width, this.height);

        // Notify system if needed (checked by Main loop)
        this.needsReset = true;
    }

    /**
     * Renders the current state of the grid.
     * @param {Grid} grid 
     * @param {AgentSystem} agents 
     */
    render(grid, agents) {
        const w = this.width;
        const h = this.height;
        const imgData = this.imageData;
        const pixels = imgData.data;
        const gridData = grid.data;
        const palette = ColorPalettes[Config.render.colorMode] || ColorPalettes.bio;

        // 1. Draw Pheromone Trails (The Grid)
        // We iterate pixel by pixel and map grid value to color

        // Optimization: Use a typed array view for 32-bit writes if possible, 
        // but customizing colors per pixel needs byte access.

        // If grid resolution matches canvas resolution:
        const len = w * h;
        for (let i = 0; i < len; i++) {
            const pIdx = i * 4;

            // Optimization: skip if all empty
            if (grid.speciesMaps[0][i] < 0.1 && grid.speciesMaps[1][i] < 0.1 && grid.obstacles[i] === 0) {
                pixels[pIdx] = 0; pixels[pIdx + 1] = 0; pixels[pIdx + 2] = 0; pixels[pIdx + 3] = 255;
            } else {
                palette(grid, i, pixels, pIdx);
            }
        }

        this.ctx.putImageData(imgData, 0, 0);

        // 2. Draw Agents (Optional Debug View)
        if (Config.render.showAgents) {
            this.ctx.fillStyle = Config.render.agentColor;
            // Batch drawing is hard with fillRect, but agents are single pixels
            // Direct pixel manipulation above is faster if we want to draw them into the trail map
            // But if we want them 'on top', we use canvas API:

            for (let i = 0; i < agents.count; i++) {
                this.ctx.fillRect(agents.x[i], agents.y[i], 1, 1);
            }
        }
    }
}

window.Renderer = Renderer;
