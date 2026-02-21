class OrderBookRenderer {
    constructor(lob, uiPanel) {
        this.lob = lob;
        this.uiPanel = uiPanel;
    }

    render() {
        const snapshot = this.lob.getSnapshot(20);
        this.uiPanel.update(snapshot);
    }
}

window.OrderBookRenderer = OrderBookRenderer;
