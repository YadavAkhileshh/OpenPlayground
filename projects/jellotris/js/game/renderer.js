/**
 * Renderer
 * Renders the game state to the canvas.
 */
class Renderer {
    constructor(canvas, game) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.game = game;
        this.width = canvas.width;
        this.height = canvas.height;
        this.scale = 1;
    }

    resize() {
        // Adjust canvas to match parent, verify grid size
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Scale physics world if needed? 
        // For now assume fixed physics coordinates and map them.
        // Our physics world is 400x800.
        // We center it.
        this.scale = Math.min(this.width / 400, this.height / 800);
    }

    render() {
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.save();

        // Center the play area
        const offsetX = (this.width - 400 * this.scale) / 2;
        const offsetY = (this.height - 800 * this.scale) / 2;

        this.ctx.translate(offsetX, offsetY);
        this.ctx.scale(this.scale, this.scale);

        // Draw Boundary
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(0, 0, 400, 800);

        // Draw Grid (Static Blocks)
        this.drawGrid();

        // Draw Bodies
        for (let body of this.game.physics.bodies) {
            this.drawBody(body);
        }

        // Draw Effects (Particles mainly)
        if (this.game.effects) this.game.effects.render(this.ctx);

        this.ctx.restore();
    }

    drawGrid() {
        // We need to know which cells are filled with what color.
        // The grid stores values.
        const g = this.game.grid;
        for (let r = 0; r < g.rows; r++) {
            for (let c = 0; c < g.cols; c++) {
                const val = g.cells[r * g.cols + c];
                if (val) {
                    this.ctx.fillStyle = val; // val is color string
                    this.ctx.fillRect(c * g.cellSize, r * g.cellSize, g.cellSize, g.cellSize);

                    // Inner bevel
                    this.ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                    this.ctx.strokeRect(c * g.cellSize, r * g.cellSize, g.cellSize, g.cellSize);
                }
            }
        }
    }

    drawBody(body) {
        // Visualize the springs and particles
        // Better: Draw a shape.
        // For soft body tetris, drawing the springs directly looks "jelly-like" if styled right.

        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = body.color;
        this.ctx.fillStyle = body.color + '44'; // Semi-transparent fill

        // Draw mesh (Springs)
        this.ctx.beginPath();
        for (let s of body.springs) {
            this.ctx.moveTo(s.p1.pos.x, s.p1.pos.y);
            this.ctx.lineTo(s.p2.pos.x, s.p2.pos.y);
        }
        this.ctx.stroke();

        // Draw Particles (blobs)
        // for (let p of body.particles) {
        //     this.ctx.beginPath();
        //     this.ctx.arc(p.pos.x, p.pos.y, p.radius, 0, Math.PI * 2);
        //     this.ctx.fillStyle = body.color;
        //     this.ctx.fill();
        // }
    }
}
