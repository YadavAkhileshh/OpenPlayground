/**
 * RenderFilters - Advanced pixel manipulations for retro effects.
 */
export class RenderFilters {
    /**
     * Applies a persistence/ghosting effect by blending the current frame
     * with the previous one on a separate layer.
     * @param {CanvasRenderingContext2D} ctx - Target context
     * @param {HTMLCanvasElement} source - Source canvas
     * @param {number} opacity - Persistence factor
     */
    static applyGhosting(targetId, source, opacity) {
        const target = document.getElementById(targetId);
        if (!target) return;

        // This effect is often better handled with CSS-based persistence
        // or a secondary canvas that doesn't clear every frame.
        target.style.opacity = opacity;
        target.style.backgroundImage = `url(${source.toDataURL()})`;
    }

    /**
     * Simulates phosphor bleed (blooming).
     */
    static applyPhosphorBleed(ctx, width, height, amount) {
        if (amount <= 0) return;
        ctx.globalCompositeOperation = 'screen';
        ctx.filter = `blur(${amount}px)`;
        ctx.drawImage(ctx.canvas, 0, 0);
        ctx.filter = 'none';
        ctx.globalCompositeOperation = 'source-over';
    }

    /**
     * Simulates "Horizontal Hold" failure (shearing).
     */
    static applyHorizontalHold(ctx, width, height, drift) {
        if (Math.abs(drift) < 0.1) return;

        const offset = (Date.now() * 0.1 * drift) % width;
        const temp = ctx.getImageData(0, 0, width, height);
        ctx.putImageData(temp, offset, 0);
        ctx.putImageData(temp, offset - width, 0);
    }

    /**
     * Simulates "Vertical Hold" failure (rolling).
     */
    static applyVerticalHold(ctx, width, height, drift) {
        if (Math.abs(drift) < 0.1) return;

        const offset = (Date.now() * 0.1 * drift) % height;
        const temp = ctx.getImageData(0, 0, width, height);
        ctx.putImageData(temp, 0, offset);
        ctx.putImageData(temp, 0, offset - height);
    }
}
