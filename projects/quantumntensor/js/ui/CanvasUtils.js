/**
 * js/ui/CanvasUtils.js
 * Extracted pure rendering math and context wrapper functions
 * to keep chart/sphere logic clean.
 */

class CanvasUtils {
    /**
     * Set up context for high DPI displays
     * @param {HTMLCanvasElement} canvas 
     */
    static setupHighDPI(canvas) {
        let dpr = window.devicePixelRatio || 1;
        let rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        let ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        return ctx;
    }

    /**
     * Draws a line
     */
    static drawLine(ctx, x1, y1, x2, y2, color, width = 1, dashed = false) {
        ctx.beginPath();
        if (dashed) {
            ctx.setLineDash([4, 4]);
        } else {
            ctx.setLineDash([]);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    /**
     * Draws a circle / sphere frame
     */
    static drawCircle(ctx, x, y, r, color, fill = false, width = 1) {
        ctx.beginPath();
        ctx.strokeStyle = fill ? 'transparent' : color;
        ctx.fillStyle = fill ? color : 'transparent';
        ctx.lineWidth = width;
        ctx.arc(x, y, r, 0, window.MathConstants.TWO_PI);
        if (fill) ctx.fill();
        if (!fill) ctx.stroke();
    }

    /**
     * Draws glowing text
     */
    static drawText(ctx, text, x, y, color = '#fff', font = '10px unifrakturcook', align = 'center', glow = false) {
        if (glow) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = color;
        } else {
            ctx.shadowBlur = 0;
        }
        ctx.fillStyle = color;
        ctx.font = font;
        ctx.textAlign = align;
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);
        ctx.shadowBlur = 0; // reset
    }

    /**
     * Draws an arrow from p1 to p2
     */
    static drawArrow(ctx, x1, y1, x2, y2, color, headLength = 8) {
        let dx = x2 - x1;
        let dy = y2 - y1;
        let angle = Math.atan2(dy, dx);

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 2;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headLength * Math.cos(angle - Math.PI / 6), y2 - headLength * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(x2 - headLength * Math.cos(angle + Math.PI / 6), y2 - headLength * Math.sin(angle + Math.PI / 6));
        ctx.lineTo(x2, y2);
        ctx.fill();
    }
}

window.CanvasUtils = CanvasUtils;
