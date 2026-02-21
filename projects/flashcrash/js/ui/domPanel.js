class DOMPanel {
    constructor() {
        this.elAsks = document.getElementById('dom-asks');
        this.elBids = document.getElementById('dom-bids');
        this.elMidPrice = document.getElementById('mid-price-display');
        this.elMidSpread = document.getElementById('mid-spread-display');
        this.elImbBid = document.getElementById('imbalance-bid');
        this.elImbAsk = document.getElementById('imbalance-ask');

        this.maxDisplayVolume = 100; // baseline for depth bars

        this.lastMid = 0;
    }

    update(snapshot) {
        // Build Asks (need to reverse order so lowest is nearest mid)
        let asksHtml = '';
        for (let i = snapshot.asks.length - 1; i >= 0; i--) {
            const row = snapshot.asks[i];
            const width = Math.min(100, (row.volume / this.maxDisplayVolume) * 100);
            asksHtml += `
            <div class="dom-row ask">
                <div class="depth-bar" style="width: ${width}%"></div>
                <div class="price">${Utils.formatPrice(row.price)}</div>
                <div class="size">${Utils.formatSize(row.volume, 2)}</div>
                <div class="total"></div>
            </div>`;
        }
        this.elAsks.innerHTML = asksHtml;

        // Build Bids (highest nearest mid)
        let bidsHtml = '';
        for (let i = 0; i < snapshot.bids.length; i++) {
            const row = snapshot.bids[i];
            const width = Math.min(100, (row.volume / this.maxDisplayVolume) * 100);
            bidsHtml += `
            <div class="dom-row bid">
                <div class="depth-bar" style="width: ${width}%"></div>
                <div class="price">${Utils.formatPrice(row.price)}</div>
                <div class="size">${Utils.formatSize(row.volume, 2)}</div>
                <div class="total"></div>
            </div>`;
        }
        this.elBids.innerHTML = bidsHtml;

        // Update mid
        if (snapshot.bids[0] && snapshot.asks[0]) {
            const mid = (snapshot.bids[0].price + snapshot.asks[0].price) / 2;
            this.elMidPrice.innerText = Utils.formatPrice(mid);
            if (mid > this.lastMid) this.elMidPrice.className = 'text-bid';
            else if (mid < this.lastMid) this.elMidPrice.className = 'text-ask';
            this.lastMid = mid;

            const spread = snapshot.asks[0].price - snapshot.bids[0].price;
            this.elMidSpread.innerText = Utils.formatPrice(spread);
        }
    }

    updateImbalance(val) {
        // val is -1 (100% asks) to 1 (100% bids)
        const bidPct = ((val + 1) / 2) * 100;
        this.elImbBid.style.width = bidPct + '%';
        this.elImbAsk.style.width = (100 - bidPct) + '%';
    }
}

window.DOMPanel = DOMPanel;
