class ArbitrageBot {
    constructor(id, manager, params) {
        this.id = id;
        this.manager = manager;
        this.orders = new Map();

        this.type = CONSTANTS.BOT_TYPES.ARBITRAGE;
        this.tickCounter = 0;
        this.active = false;

        // Simulates looking at another exchange
        this.externalPrice = CONFIG.INITIAL_PRICE;
    }

    start() {
        this.active = true;
    }

    stop() {
        this.active = false;
    }

    tick() {
        if (!this.active) return;
        this.tickCounter++;

        // External drift walking
        if (this.tickCounter % 5 === 0) {
            this.externalPrice = MathUtils.randomWalkUpdate(this.externalPrice, 0, 0.0005);
        }

        if (this.tickCounter % 15 !== 0) return;

        const bestBid = this.manager.lob.getBestBid();
        const bestAsk = this.manager.lob.getBestAsk();

        // Arb condition: Local ask is lower than external bid (buy local, sell external immediately)
        if (bestAsk < this.externalPrice - 2) {
            // Pick edge
            this.manager.submitOrder(this.id, CONSTANTS.ORDER_TYPES.MARKET, CONSTANTS.SIDES.BID, bestAsk, 1.0);
        }

        // Local bid is higher than external ask (sell local, buy external)
        if (bestBid > this.externalPrice + 2) {
            this.manager.submitOrder(this.id, CONSTANTS.ORDER_TYPES.MARKET, CONSTANTS.SIDES.ASK, bestBid, 1.0);
        }
    }

    onOrderPlaced(order) { this.orders.set(order.id, order); }
    onOrderCanceled(order) { if (order) this.orders.delete(order.id); }
    onTrade(trade) { }
}

window.ArbitrageBot = ArbitrageBot;
