/* js/renderer/canvas_engine.js */

/**
 * Main WebCanvas Renderer Engine
 */
class CanvasEngine {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.canvas = document.getElementById('sigil-canvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');

        this.ringManager = new window.RingManager();
        this.animator = new window.Animator();

        this.lastTime = 0;
        this.running = true;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        appEventBus.on(EVENTS.AST_GENERATED, this.onNewAST.bind(this));
        appEventBus.on(EVENTS.RESET_REQUESTED, this.onReset.bind(this));

        requestAnimationFrame(this.loop.bind(this));
    }

    resize() {
        // High DPI canvas setup
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    onNewAST(ast) {
        this.ringManager.buildFromAST(ast);
    }

    onReset() {
        this.ringManager.rings = [];
    }

    loop(timestamp) {
        if (!this.running) return;

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.animator.update(deltaTime);
        this.draw();

        requestAnimationFrame(this.loop.bind(this));
    }

    draw() {
        const rect = this.container.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const centerX = width / 2;
        const centerY = height / 2;

        this.ctx.clearRect(0, 0, width, height);

        const rings = this.ringManager.getRings();
        if (rings.length === 0) return;

        // Base geometric decorative underlay (static center core)
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(this.animator.getRingRotation(0) * 0.5);
        this.ctx.strokeStyle = CONFIG.RENDERER.RING_COLOR;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 20, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();

        // Used to store node positions to draw inter-ring connections
        const worldPositions = new Map(); // nodeObject -> {x,y}

        // Draw Rings outward
        for (let depth = 0; depth < rings.length; depth++) {
            const ringNodes = rings[depth];
            if (ringNodes.length === 0) continue;

            const radius = 40 + (depth * CONFIG.RENDERER.BASE_RADIUS_STEP) * this.animator.getPulseFactor(depth);
            const ringRotation = this.animator.getRingRotation(depth + 1);

            // Draw the faint orbit track
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = `rgba(0, 255, 204, ${0.1 - (depth * 0.01)})`;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();

            // Calculate uniform angle spacings
            const angles = window.PolarMath.getUniformAngles(ringNodes.length, ringRotation);

            for (let i = 0; i < ringNodes.length; i++) {
                const node = ringNodes[i];
                const angle = angles[i];
                const pos = window.PolarMath.toCartesian(centerX, centerY, radius, angle);

                worldPositions.set(node, pos);

                // Choose color based on type grouping
                let color = CONFIG.RENDERER.CORE_COLOR;
                if (node.astType.includes('Expression')) color = "#FFD700"; // Gold
                else if (node.astType.includes('Statement')) color = "#00FFCC"; // Cyan
                else if (node.astType.includes('Declaration')) color = "#FF00FF"; // Magenta

                // Draw the node glyph
                const glyphSize = Math.max(8, 16 - depth); // Smaller items further out
                window.Glyphs.drawGlyph(this.ctx, pos.x, pos.y, glyphSize, node.astType, color, angle + Math.PI / 2);
            }
        }

        // Draw Inter-ring branches
        this.ctx.strokeStyle = CONFIG.RENDERER.BRANCH_COLOR;
        this.ctx.lineWidth = 1;

        for (let depth = 0; depth < rings.length; depth++) {
            const ringNodes = rings[depth];
            for (let i = 0; i < ringNodes.length; i++) {
                const node = ringNodes[i];
                const parentPos = worldPositions.get(node);
                if (!parentPos) continue;

                node.children.forEach(child => {
                    const childPos = worldPositions.get(child);
                    if (childPos) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(parentPos.x, parentPos.y);
                        // A slight quadratic curve to make it look organic
                        const cpX = (parentPos.x + childPos.x) / 2 + (parentPos.y - childPos.y) * 0.1;
                        const cpY = (parentPos.y + childPos.y) / 2 + (childPos.x - parentPos.x) * 0.1;
                        this.ctx.quadraticCurveTo(cpX, cpY, childPos.x, childPos.y);

                        // Faint gradient line
                        this.ctx.setLineDash([2, 4]);
                        this.ctx.stroke();
                        this.ctx.setLineDash([]);
                    }
                });
            }
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.canvasEngine = new CanvasEngine();
});

// Padding requirement
const ___CANGN_PAD_1 = 1;
const ___CANGN_PAD_2 = 2;
const ___CANGN_PAD_3 = 3;
