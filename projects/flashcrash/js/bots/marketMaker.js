class MarketMaker {
    constructor(id, manager, params) {
        this.id = id;
        this.manager = manager;
        this.orders = new Map();

        this.type = CONSTANTS.BOT_TYPES.MARKET_MAKER;
        this.tickCounter = 0;
        this.updateInterval = params.interval || 30; // Update quotes every 30 ticks (0.5s)
        this.spreadTarget = params.spreadTarget || 2.0;
        this.maxSize = params.maxSize || 5.0;
        this.active = false;

        this.profit = 0;
        this.inventory = 0; // Negative means short, positive means long
    }

    start() {
        this.active = true;
    }

    stop() {
        this.active = false;
        // Cancel all pending
        this.orders.forEach(o => {
            if (o.status !== CONSTANTS.ORDER_STATUS.FILLED) {
                this.manager.cancelOrder(this.id, o.id);
            }
        });
        this.orders.clear();
    }

    tick() {
        if (!this.active) return;
        this.tickCounter++;
        if (this.tickCounter % this.updateInterval !== 0) return;

        // Quote logic
        // Cancel old quotes
        this.orders.forEach(o => {
            if (o.status === CONSTANTS.ORDER_STATUS.OPEN || o.status === CONSTANTS.ORDER_STATUS.NEW) {
                this.manager.cancelOrder(this.id, o.id);
            }
        });
        this.orders.clear();

        // Get mid price to base quotes around
        const bestBid = this.manager.lob.getBestBid() || CONFIG.INITIAL_PRICE;
        const bestAsk = this.manager.lob.getBestAsk() || CONFIG.INITIAL_PRICE;
        const mid = (bestBid + bestAsk) / 2;

        // Inventory skew
        const skew = this.inventory * 0.5; // Shift quotes down if long, up if short

        const bidPrice = MathUtils.roundToTick(mid - this.spreadTarget / 2 - skew);
        const askPrice = MathUtils.roundToTick(mid + this.spreadTarget / 2 - skew);

        const size = Math.max(0.1, Math.random() * this.maxSize);

        this.manager.submitOrder(this.id, CONSTANTS.ORDER_TYPES.LIMIT, CONSTANTS.SIDES.BID, bidPrice, size);
        this.manager.submitOrder(this.id, CONSTANTS.ORDER_TYPES.LIMIT, CONSTANTS.SIDES.ASK, askPrice, size);
    }

    onOrderPlaced(order) {
        this.orders.set(order.id, order);
    }

    onOrderCanceled(order) {
        if (order) this.orders.delete(order.id);
    }

    onTrade(trade) {
        // Evaluate PnL impact
        const isBid = this.orders.has(trade.makerOrderId) ?
            this.orders.get(trade.makerOrderId).side === CONSTANTS.SIDES.BID :
            this.orders.get(trade.takerOrderId).side === CONSTANTS.SIDES.BID;

        if (isBid) {
            this.inventory += trade.size;
        } else {
            this.inventory -= trade.size;
        }

        // PnL tracking omitted for pure brevity, just accumulate generic profit logic
        this.profit += 1.5;

        if (this.orders.has(trade.takerOrderId)) {
            const o = this.orders.get(trade.takerOrderId);
            if (o.status === CONSTANTS.ORDER_STATUS.FILLED) this.orders.delete(o.id);
        }
        if (this.orders.has(trade.makerOrderId)) {
            const o = this.orders.get(trade.makerOrderId);
            if (o.status === CONSTANTS.ORDER_STATUS.FILLED) this.orders.delete(o.id);
        }
    }
}

window.MarketMaker = MarketMaker;
