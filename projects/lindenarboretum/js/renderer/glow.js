/**
 * LindenArboretum - Glow Module
 * Handles applying canvas shadowBlur to give drawn lines
 * an emmissive, bio-luminescent property.
 */

export const glowManager = {
    /**
     * Activates glow on a specific context.
     * @param {CanvasRenderingContext2D} ctx 
     * @param {string} color - Hex or hsl string
     * @param {number} intensity - Spread of the glow
     */
    setGlow(ctx, color, intensity) {
        ctx.shadowBlur = intensity;
        ctx.shadowColor = color;
        // Optimization: composite lighter mode makes it look more glowing
        ctx.globalCompositeOperation = 'lighter';
    },

    /**
     * Removes the glow effect.
     * @param {CanvasRenderingContext2D} ctx 
     */
    resetGlow(ctx) {
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        ctx.globalCompositeOperation = 'source-over';
    }
};
