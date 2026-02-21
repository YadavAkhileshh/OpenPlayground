class WhaleBot {
    constructor(id, manager) {
        this.id = id;
        this.manager = manager;
        this.orders = new Map();
        this.type = CONSTANTS.BOT_TYPES.WHALE;
        this.active = false;
        this.tickCounter = 0;
    }

    start() { this.active = true; }
    stop() { this.active = false; }

    tick() {
        if (!this.active) return;
        this.tickCounter++;

        // Whales act very rarely but with massive size
        if (this.tickCounter % 600 === 0 && Math.random() < 0.2) {
            const side = Math.random() > 0.5 ? CONSTANTS.SIDES.BID : CONSTANTS.SIDES.ASK;
            // Dump large market order to clear levels
            const size = Math.random() * 50 + 50;
            this.manager.submitOrder(this.id, CONSTANTS.ORDER_TYPES.MARKET, side, 0, size);

            this.manager.bus.emitAsync(CONSTANTS.EVENTS.LOG, { level: 'trade', msg: `WHALE ALERT: ${size.toFixed(2)} MARKET ${side}` });
        }
    }

    onOrderPlaced(order) { }
    onOrderCanceled(order) { }
    onTrade(trade) { }
}

window.WhaleBot = WhaleBot;
