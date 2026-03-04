/**
 * CableRenderer Class.
 * Renders bezier curve patch cables using an HTML5 Canvas overlay.
 * Updates at 60fps to visualize connections and drag interactions.
 */
export class CableRenderer {
    constructor(canvasId, patchManager) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.patchManager = patchManager;

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.loop();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    loop() {
        requestAnimationFrame(() => this.loop());
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw existing cables
        const cables = this.patchManager.getCables();
        cables.forEach(c => this.drawCable(c.x1, c.y1, c.x2, c.y2, c.color));

        // Draw temp cable
        const temp = this.patchManager.getTempCable();
        if (temp) {
            this.drawCable(temp.startX, temp.startY, temp.currentX, temp.currentY, temp.color, true);
        }
    }

    drawCable(x1, y1, x2, y2, color, isDragging = false) {
        this.ctx.beginPath();

        // Bezier Curve Logic
        // We want cables to drape down.
        // Control points should be lower than source/dest based on distance.

        const dist = Math.hypot(x2 - x1, y2 - y1);
        const drape = Math.min(200, dist * 0.5); // Drape amount

        this.ctx.moveTo(x1, y1);
        this.ctx.bezierCurveTo(
            x1, y1 + drape, // CP1
            x2, y2 + drape, // CP2
            x2, y2          // End
        );

        this.ctx.lineWidth = 4;
        this.ctx.fillStyle = "rgba(0,0,0,0)";
        this.ctx.strokeStyle = color;
        // Shadow
        this.ctx.shadowBlur = 5;
        this.ctx.shadowColor = "rgba(0,0,0,0.5)";

        this.ctx.stroke();

        // Highlight ends
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x1, y1, 4, 0, Math.PI * 2);
        this.ctx.arc(x2, y2, 4, 0, Math.PI * 2);
        this.ctx.fill();

        if (isDragging) {
            // Glowing tip for dragging
            this.ctx.beginPath();
            this.ctx.arc(x2, y2, 8, 0, Math.PI * 2);
            this.ctx.fillStyle = "rgba(255,255,255,0.5)";
            this.ctx.fill();
        }
    }
}
