/**
 * Renderer
 * Renders the heightmap to the canvas using gradient-based shading to simulate 3D depth.
 */
export class Renderer {
    constructor(canvas, state) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.state = state;

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.clientWidth;
        this.canvas.height = parent.clientHeight;
    }

    render(physics) {
        const { ctx, canvas, state } = this;
        const theme = state.themes[state.currentTheme];

        // 1. Clear with base sand color
        ctx.fillStyle = theme.sand;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Draw Heightmap
        const cellW = canvas.width / physics.width;
        const cellH = canvas.height / physics.height;

        // Sampling step - skip indices for performance if needed
        const step = 2;

        for (let y = 0; y < physics.height; y += step) {
            for (let x = 0; x < physics.width; x += step) {
                const idx = y * physics.width + x;
                const h = physics.heightmap[idx];

                if (Math.abs(h) < 0.01) continue;

                // Simple directional lighting (shadows and highlights)
                // Calculate gradient/normal approx
                const nextX = physics.heightmap[y * physics.width + (x + 1)] || h;
                const nextY = physics.heightmap[(y + 1) * physics.width + x] || h;

                const slopeX = nextX - h;
                const slopeY = nextY - h;

                // Lighting value based on slope
                const light = 128 + (slopeX + slopeY) * 500;

                // Set color based on elevation and light
                const alpha = Math.abs(h) * 0.8;
                ctx.fillStyle = `rgba(${light}, ${light}, ${light - 20}, ${alpha})`;

                // Draw grain/furrow
                ctx.fillRect(x * cellW, y * cellH, cellW * step, cellH * step);
            }
        }

        // 3. Draw Stones
        physics.stones.forEach(stone => {
            this.drawStone(stone, theme);
        });

        // 4. Draw Interaction cursor (Brush)
        if (state.activeTool === 'rake') {
            this.drawBrush(state.mouseX, state.mouseY, state.brushSize, theme.accent);
        }
    }

    drawStone(stone, theme) {
        const { ctx, canvas } = this;
        const x = stone.x * canvas.width;
        const y = stone.y * canvas.height;
        const r = stone.radius * canvas.width;

        // Stone Body
        const grad = ctx.createRadialGradient(x - r / 3, y - r / 3, 0, x, y, r);
        grad.addColorStop(0, '#94a3b8');
        grad.addColorStop(1, '#475569');

        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Sand "ripple" around stone
        ctx.strokeStyle = theme.stroke;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, r + 5, 0, Math.PI * 2);
        ctx.stroke();
    }

    drawBrush(x, y, size, color) {
        const { ctx } = this;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}
