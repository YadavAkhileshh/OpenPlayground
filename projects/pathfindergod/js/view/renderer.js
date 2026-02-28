/**
 * Handles all canvas header rendering.
 */
export class Renderer {
    constructor(canvas, grid, audio) { // Receive audio engine
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false }); // Optimize for no transparency
        this.grid = grid;
        this.audio = audio; // Store audio engine
        this.cellSize = 0;
        this.cols = grid.cols;
        this.rows = grid.rows;

        this.particles = []; // Particle system

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        // Calculate cell size based on container
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;

        // We want square cells, so take the smaller dimension
        const cellWidth = this.canvas.width / this.cols;
        const cellHeight = this.canvas.height / this.rows;
        this.cellSize = Math.min(cellWidth, cellHeight);

        // Center the grid
        this.offsetX = (this.canvas.width - (this.cols * this.cellSize)) / 2;
        this.offsetY = (this.canvas.height - (this.rows * this.cellSize)) / 2;

        this.drawGrid();
    }

    drawGrid() {
        this.ctx.fillStyle = '#0a0b10'; // Background
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.drawNode(this.grid.nodes[r][c]);
            }
        }
    }

    drawNode(node) {
        const x = Math.floor(this.offsetX + node.col * this.cellSize);
        const y = Math.floor(this.offsetY + node.row * this.cellSize);
        const size = Math.ceil(this.cellSize); // Avoid gaps

        let color = '#14161f'; // Default

        // Weight visualization
        if (node.weight === 5) color = '#3f2e18'; // Mud (Dark Brown)
        if (node.weight === 10) color = '#1e3a8a'; // Water (Deep Blue)

        if (node.isWall) color = '#334155';

        // Dynamic states
        if (!node.isStart && !node.isEnd) {
            if (node.isPath) color = '#facc15';
            else if (node.isVisited) {
                // Blend visited color with weight for better visual
                color = node.weight > 1 ? '#4f46e5' : '#60a5fa';
            }
        }

        if (node.isStart) color = '#22c55e';
        if (node.isEnd) color = '#ef4444';

        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, size, size);

        // Optional: Draw border for grid effect (can be expensive for 100x100)
        // this.ctx.strokeStyle = '#1e293b';
        // this.ctx.strokeRect(x, y, size, size);
    }

    // Efficiently update only changed nodes
    updateNodes(nodes) {
        // Batch drawing could be added here if needed
        for (const node of nodes) {
            this.drawNode(node);
        }
    }

    animatePath(visitedNodes, pathNodes, speed = 10, onComplete) {
        // Animation logic
        let i = 0;

        const animateVisited = () => {
            if (i >= visitedNodes.length) {
                if (pathNodes && pathNodes.length > 0) {
                    this.animateShortestPath(pathNodes, onComplete);
                } else {
                    if (onComplete) onComplete();
                }
                return;
            }

            // Draw a batch of nodes per frame based on speed
            const batchSize = speed;
            for (let j = 0; j < batchSize; j++) {
                if (i + j < visitedNodes.length) {
                    const node = visitedNodes[i + j];
                    // Don't overwrite start/end colors
                    if (!node.isStart && !node.isEnd) {
                        node.isVisited = true;
                        this.drawNode(node);
                    }
                }
            }
            i += batchSize;
            requestAnimationFrame(animateVisited);
        };

        animateVisited();
    }

    animateShortestPath(nodes, onComplete) {
        let i = 0;
        const animate = () => {
            if (i >= nodes.length) {
                if (onComplete) onComplete();
                return;
            }

            const node = nodes[i];
            if (!node.isStart && !node.isEnd) {
                node.isPath = true; // Mark as path for render color
                this.drawNode(node);
            }
            i++;
            requestAnimationFrame(animate);
        };
        animate();
    }
}
