class SniperBot {
    constructor(id, manager) {
        this.id = id;
        this.manager = manager;
        this.orders = new Map();
        this.type = CONSTANTS.BOT_TYPES.SNIPER;
        this.active = false;
    }

    start() { this.active = true; }
    stop() { this.active = false; }

    tick() {
        if (!this.active) return;
        // Sniper looks for large spreads caused by flash crashes
        const spread = this.manager.lob.getSpread();

        if (spread > 15) {
            // Spread is huge, step in and take profit on the reversion
            const bestBid = this.manager.lob.getBestBid();
            const bestAsk = this.manager.lob.getBestAsk();

            // Fade the move (buy the bid, sell the ask)
            this.manager.submitOrder(this.id, CONSTANTS.ORDER_TYPES.LIMIT, CONSTANTS.SIDES.BID, MathUtils.roundToTick(bestBid + 1), 2.0);
            this.manager.submitOrder(this.id, CONSTANTS.ORDER_TYPES.LIMIT, CONSTANTS.SIDES.ASK, MathUtils.roundToTick(bestAsk - 1), 2.0);
        }
    }

    onOrderPlaced(order) { this.orders.set(order.id, order); }
    onOrderCanceled(order) { if (order) this.orders.delete(order.id); }
    onTrade(trade) {
        if (this.orders.has(trade.makerOrderId)) {
            this.orders.delete(trade.makerOrderId);
        }
    }
}

window.SniperBot = SniperBot;
