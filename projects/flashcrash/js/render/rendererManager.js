class RendererManager {
    constructor(metrics, calc, lob, domPanel) {
        this.chart = new ChartRenderer('price-chart-canvas', metrics);
        this.heatmap = new HeatmapRenderer('heatmap-canvas', metrics);
        this.volatility = new VolatilityRenderer('volatility-canvas', calc);
        this.lobRender = new OrderBookRenderer(lob, domPanel);
    }

    tick(snapshot) {
        this.heatmap.addSnapshot(snapshot);
    }

    // Called on RAF so we can throttle logic and rendering
    render() {
        this.chart.render();
        this.heatmap.render();
        this.volatility.render();
        this.lobRender.render();
    }
}

window.RendererManager = RendererManager;
