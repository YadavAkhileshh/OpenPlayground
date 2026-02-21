/**
 * Collects and diffuses market state regularly for UI ingestion.
 */
class MarketFeed {
    constructor(lob, bus, config) {
        this.lob = lob;
        this.bus = bus;
        this.tickRate = config.TICK_RATE_MS;
        this.lastPrice = config.INITIAL_PRICE;

        // Keep track of recent trades
        this.recentTrades = [];
        this.bus.on(CONSTANTS.EVENTS.TRADE_EXECUTED, this.onTrade.bind(this));
    }

    onTrade(trade) {
        this.lastPrice = trade.price;
        this.recentTrades.push(trade);
    }

    tick() {
        const snapshot = this.lob.getSnapshot(window.CONFIG.MAX_ORDER_BOOK_DEPTH);
        const spread = this.lob.getSpread();
        const midPrice = spread === 0 ? this.lastPrice : (this.lob.getBestBid() + this.lob.getBestAsk()) / 2;

        // Calculate volume in this tick
        let vol = 0;
        for (let i = 0; i < this.recentTrades.length; i++) {
            vol += this.recentTrades[i].size;
        }

        const data = {
            snapshot,
            bestBid: this.lob.getBestBid(),
            bestAsk: this.lob.getBestAsk(),
            spread,
            midPrice,
            lastPrice: this.lastPrice,
            tickVolume: vol,
            trades: [...this.recentTrades]
        };

        this.recentTrades = []; // clear

        // Broadcast
        this.bus.emit(CONSTANTS.EVENTS.MARKET_STATE_CHANGE, data);
    }
}

window.MarketFeed = MarketFeed;
