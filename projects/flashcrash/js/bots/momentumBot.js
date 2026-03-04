class MomentumBot {
    constructor(id, manager) {
        this.id = id;
        this.manager = manager;
        this.orders = new Map();
        this.type = CONSTANTS.BOT_TYPES.MOMENTUM;
        this.active = false;
        this.tickCounter = 0;

        // Keep localized history
        this.prices = [];
    }

    start() { this.active = true; }
    stop() { this.active = false; }

    tick() {
        if (!this.active) return;
        this.tickCounter++;

        if (this.tickCounter % 60 === 0) {
            const mid = (this.manager.lob.getBestBid() + this.manager.lob.getBestAsk()) / 2;
            if (mid) this.prices.push(mid);
            if (this.prices.length > 10) this.prices.shift();

            if (this.prices.length === 10) {
                const diff = this.prices[9] - this.prices[0];
                if (diff > 5) {
                    // Strong uptrend, market buy!
                    this.manager.submitOrder(this.id, CONSTANTS.ORDER_TYPES.MARKET, CONSTANTS.SIDES.BID, 0, Math.random() * 5 + 1);
                } else if (diff < -5) {
                    // Strong downtrend, market sell!
                    this.manager.submitOrder(this.id, CONSTANTS.ORDER_TYPES.MARKET, CONSTANTS.SIDES.ASK, 0, Math.random() * 5 + 1);
                }
            }
        }
    }

    onOrderPlaced(order) { }
    onOrderCanceled(order) { }
    onTrade(trade) { }
}

window.MomentumBot = MomentumBot;
