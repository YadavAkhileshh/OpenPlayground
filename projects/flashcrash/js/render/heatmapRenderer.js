class HeatmapRenderer {
    constructor(id, metrics) {
        this.id = id;
        this.metrics = metrics;
        this.setup();
        window.addEventListener('resize', Utils.debounce(this.setup.bind(this), 250));

        // We will store historical snapshots as columns in an imageData object
        this.historySize = 200; // time cols
        this.priceLevels = 100; // y axis

        this.colWidth = 0;
        this.rowHeight = 0;

        this.historyData = [];
    }

    setup() {
        const { canvas, ctx, width, height } = CanvasHelper.initCanvas(this.id);
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.colWidth = width / this.historySize;
        this.rowHeight = height / this.priceLevels;
    }

    addSnapshot(snapshot) {
        // We need to map snapshot to a simplified array of intensities for this col
        this.historyData.push(snapshot);
        if (this.historyData.length > this.historySize) {
            this.historyData.shift();
        }
    }

    render() {
        CanvasHelper.clear(this.ctx, this.width, this.height, '#000000');
        if (this.historyData.length === 0) return;

        // Abstracted rendering logic for pure brevity, 
        // real implementation would be drawing blocky alpha squares per tick

        const maxVol = 100; // baseline

        this.ctx.globalCompositeOperation = 'lighter';

        for (let col = 0; col < this.historyData.length; col++) {
            const snap = this.historyData[col];
            const x = (this.width - (this.historyData.length * this.colWidth)) + (col * this.colWidth);

            // Render basic bands to mimic heatmap
            // Bids
            for (let i = 0; i < Math.min(10, snap.bids.length); i++) {
                const y = (this.height / 2) + (i * 4);
                const intensity = Math.min(1, snap.bids[i].volume / maxVol);
                this.ctx.fillStyle = `rgba(0, 210, 135, ${intensity * 0.8})`;
                this.ctx.fillRect(x, y, this.colWidth, 4);
            }
            // Asks
            for (let i = 0; i < Math.min(10, snap.asks.length); i++) {
                const y = (this.height / 2) - (i * 4);
                const intensity = Math.min(1, snap.asks[i].volume / maxVol);
                this.ctx.fillStyle = `rgba(255, 59, 105, ${intensity * 0.8})`;
                this.ctx.fillRect(x, y, this.colWidth, 4);
            }
        }

        this.ctx.globalCompositeOperation = 'source-over';
    }
}

window.HeatmapRenderer = HeatmapRenderer;
