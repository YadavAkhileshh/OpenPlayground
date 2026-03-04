class CanvasHelper {
    static initCanvas(id) {
        const canvas = document.getElementById(id);
        const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for no transparency blending background 

        // Handle High-DPI displays
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.parentElement.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        ctx.scale(dpr, dpr);
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        return { canvas, ctx, width: rect.width, height: rect.height, dpr };
    }

    static clear(ctx, width, height, color = CONFIG.THEME_COLORS.BACKGROUND) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);
    }
}

window.CanvasHelper = CanvasHelper;
