/**
 * Handles all canvas rendering for the simulation.
 */
export class Renderer {
    /**
     * @param {string} canvasId - ID of the main simulation canvas
     */
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) throw new Error(`Canvas #${canvasId} not found`);

        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.cameraX = 0;

        // Visual config
        this.gridSize = 100;
        this.bgColor = '#0d0d0d';
        this.gridColor = 'rgba(255,255,255,0.04)';
        this.groundColor = '#00ffcc';

        window.addEventListener('resize', () => this.resize());
        this.resize();
    }

    /** Resize canvas to fill the window. */
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    /** Clear the canvas with the background color. */
    clear() {
        this.ctx.fillStyle = this.bgColor;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    /**
     * Smoothly pan the camera toward a target X position.
     * @param {number} targetX
     */
    setCamera(targetX) {
        const desired = targetX - this.width / 3;
        this.cameraX = this.cameraX * 0.92 + desired * 0.08;
    }

    /**
     * Draw the background grid and terrain ground line.
     * @param {Function} groundFunc - f(x) → groundY
     */
    drawWorld(groundFunc) {
        this.ctx.save();
        this.ctx.translate(-this.cameraX, 0);

        this._drawGrid();
        this._drawGround(groundFunc);

        this.ctx.restore();
    }

    /** @private */
    _drawGrid() {
        this.ctx.strokeStyle = this.gridColor;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();

        const startX = Math.floor(this.cameraX / this.gridSize) * this.gridSize;
        const endX = this.cameraX + this.width + this.gridSize;
        for (let x = startX; x < endX; x += this.gridSize) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
        }
        for (let y = 0; y < this.height; y += this.gridSize) {
            this.ctx.moveTo(this.cameraX, y);
            this.ctx.lineTo(this.cameraX + this.width, y);
        }
        this.ctx.stroke();
    }

    /** @private */
    _drawGround(groundFunc) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.groundColor;
        this.ctx.lineWidth = 2;
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = this.groundColor;

        const startX = Math.floor(this.cameraX / 50) * 50 - 100;
        const endX = this.cameraX + this.width + 100;
        let first = true;

        for (let x = startX; x < endX; x += 10) {
            const y = groundFunc(x);
            if (first) { this.ctx.moveTo(x, y); first = false; }
            else { this.ctx.lineTo(x, y); }
        }
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }

    /**
     * Draw all creatures (with frustum culling).
     * @param {Creature[]} creatures
     */
    drawCreatures(creatures) {
        this.ctx.save();
        this.ctx.translate(-this.cameraX, 0);

        for (const c of creatures) {
            const cx = c.particles[1].pos.x;
            if (cx > this.cameraX - 300 && cx < this.cameraX + this.width + 300) {
                c.draw(this.ctx);
            }
        }

        this.ctx.restore();
    }

    /**
     * Draw a neural network visualization.
     *
     * @param {NeuralNetwork} brain
     * @param {CanvasRenderingContext2D} ctx  - Target context (can be overlay or separate canvas)
     * @param {number} x   - Top-left X of the drawing area
     * @param {number} y   - Top-left Y of the drawing area
     * @param {number} w   - Width of the drawing area
     * @param {number} h   - Height of the drawing area
     */
    drawBrain(brain, ctx, x, y, w, h) {
        const layers = 3;                      // input | hidden | output
        const layerGap = w / (layers - 1);       // gap between layer columns
        const nodeRadius = 5;

        const maxNodes = Math.max(brain.inputNodes, brain.hiddenNodes, brain.outputNodes);

        /**
         * Map a layer + node index to pixel coordinates.
         * @param {number} layer  0=input, 1=hidden, 2=output
         * @param {number} idx    node index within layer
         * @param {number} total  total nodes in that layer
         */
        const pos = (layer, idx, total) => ({
            x: x + layer * layerGap,
            y: y + (h / 2) + (idx - (total - 1) / 2) * Math.min(h / maxNodes, 14)
        });

        ctx.lineWidth = 1;

        // ── Connections: Input → Hidden ──────────────────────────
        for (let i = 0; i < brain.inputNodes; i++) {
            for (let j = 0; j < brain.hiddenNodes; j++) {
                const w_ = brain.weightsIH[i * brain.hiddenNodes + j];
                if (Math.abs(w_) < 0.15) continue; // skip weak links
                const p1 = pos(0, i, brain.inputNodes);
                const p2 = pos(1, j, brain.hiddenNodes);
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                const a = Math.min(1, Math.abs(w_));
                ctx.strokeStyle = w_ > 0
                    ? `rgba(0, 255, 140, ${a})`
                    : `rgba(255, 60, 60, ${a})`;
                ctx.stroke();
            }
        }

        // ── Connections: Hidden → Output ─────────────────────────
        for (let j = 0; j < brain.hiddenNodes; j++) {
            for (let k = 0; k < brain.outputNodes; k++) {
                const w_ = brain.weightsHO[j * brain.outputNodes + k];
                if (Math.abs(w_) < 0.15) continue;
                const p1 = pos(1, j, brain.hiddenNodes);
                const p2 = pos(2, k, brain.outputNodes);
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                const a = Math.min(1, Math.abs(w_));
                ctx.strokeStyle = w_ > 0
                    ? `rgba(0, 255, 140, ${a})`
                    : `rgba(255, 60, 60, ${a})`;
                ctx.stroke();
            }
        }

        // ── Nodes ────────────────────────────────────────────────
        const drawLayer = (count, layer, color) => {
            for (let i = 0; i < count; i++) {
                const p = pos(layer, i, count);
                ctx.beginPath();
                ctx.arc(p.x, p.y, nodeRadius, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.strokeStyle = 'rgba(255,255,255,0.5)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        };

        drawLayer(brain.inputNodes, 0, '#4fc3f7'); // blue  = inputs
        drawLayer(brain.hiddenNodes, 1, '#ffffff'); // white = hidden
        drawLayer(brain.outputNodes, 2, '#a5d6a7'); // green = outputs

        // ── Labels ───────────────────────────────────────────────
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('IN', pos(0, -0.5, 1).x, y + 8);
        ctx.fillText('HID', pos(1, -0.5, 1).x, y + 8);
        ctx.fillText('OUT', pos(2, -0.5, 1).x, y + 8);
        ctx.textAlign = 'left';
    }
}
