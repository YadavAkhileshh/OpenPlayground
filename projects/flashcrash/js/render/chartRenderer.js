class ChartRenderer {
    constructor(id, metrics) {
        this.id = id;
        this.metrics = metrics;
        this.setup();
        window.addEventListener('resize', Utils.debounce(this.setup.bind(this), 250));
    }

    setup() {
        const { canvas, ctx, width, height } = CanvasHelper.initCanvas(this.id);
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = width;
        this.height = height;
    }

    render() {
        CanvasHelper.clear(this.ctx, this.width, this.height);

        const prices = this.metrics.priceHistory.toArray();
        if (prices.length < 2) return;

        let minPrice = Infinity;
        let maxPrice = -Infinity;
        for (let i = 0; i < prices.length; i++) {
            if (prices[i] < minPrice) minPrice = prices[i];
            if (prices[i] > maxPrice) maxPrice = prices[i];
        }

        // Pad min/max
        const padding = (maxPrice - minPrice) * 0.1 || 10;
        minPrice -= padding;
        maxPrice += padding;

        const range = maxPrice - minPrice;
        const xStep = this.width / CONFIG.CHART_HISTORY_POINTS;

        // Draw grid
        this.ctx.strokeStyle = CONFIG.THEME_COLORS.GRID;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        for (let i = 0; i < this.height; i += 40) {
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.width, i);
        }
        this.ctx.stroke();

        // Draw line
        this.ctx.strokeStyle = CONFIG.THEME_COLORS.MID;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();

        const startX = this.width - (prices.length * xStep);

        for (let i = 0; i < prices.length; i++) {
            const x = startX + (i * xStep);
            const y = this.height - ((prices[i] - minPrice) / range) * this.height;
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }
        this.ctx.stroke();

        // Draw fill area
        this.ctx.lineTo(this.width, this.height);
        this.ctx.lineTo(startX, this.height);
        this.ctx.fillStyle = 'rgba(226, 232, 240, 0.05)';
        this.ctx.fill();

        // Draw latest price line
        const lastY = this.height - ((prices[prices.length - 1] - minPrice) / range) * this.height;
        this.ctx.strokeStyle = 'rgba(0, 180, 216, 0.5)';
        this.ctx.setLineDash([2, 4]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, lastY);
        this.ctx.lineTo(this.width, lastY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
}

window.ChartRenderer = ChartRenderer;
