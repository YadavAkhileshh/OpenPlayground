class NoiseBot {
    constructor(id, manager) {
        this.id = id;
        this.manager = manager;
        this.orders = new Map();
        this.type = CONSTANTS.BOT_TYPES.NOISE;
        this.active = false;
        this.tickCounter = 0;
        this.poissonLambda = 0.5; // Trades randomly
    }

    start() { this.active = true; }
    stop() { this.active = false; }

    tick() {
        if (!this.active) return;
        this.tickCounter++;

        // Use poisson process to fire random orders
        if (Math.random() < 0.05) {
            const mid = (this.manager.lob.getBestBid() + this.manager.lob.getBestAsk()) / 2 || CONFIG.INITIAL_PRICE;
            const side = Math.random() > 0.5 ? CONSTANTS.SIDES.BID : CONSTANTS.SIDES.ASK;

            // Randomly place limit orders deep in the book or crossing the spread
            const priceVariance = MathUtils.randomNormal(0, 5);
            const price = MathUtils.roundToTick(mid + priceVariance);
            const size = Math.random() * 2 + 0.1;

            this.manager.submitOrder(this.id, CONSTANTS.ORDER_TYPES.LIMIT, side, price, size);
        }

        // Randomly cancel own orders
        if (Math.random() < 0.1 && this.orders.size > 0) {
            const ids = Array.from(this.orders.keys());
            const target = ids[Math.floor(Math.random() * ids.length)];
            this.manager.cancelOrder(this.id, target);
        }
    }

    onOrderPlaced(order) { this.orders.set(order.id, order); }

    onOrderCanceled(order) { if (order) this.orders.delete(order.id); }

    onTrade(trade) { }
}

window.NoiseBot = NoiseBot;
