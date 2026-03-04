class PredatoryBot {
    constructor(id, manager) {
        this.id = id;
        this.manager = manager;
        this.orders = new Map();
        this.type = CONSTANTS.BOT_TYPES.PREDATORY;
        this.active = false;
        this.tickMode = 'spoofing'; // 'spoofing', 'dumping'
        this.tickCounter = 0;
    }

    start() { this.active = true; }
    stop() { this.active = false; }

    tick() {
        if (!this.active) return;
        this.tickCounter++;

        const bestBid = this.manager.lob.getBestBid();

        if (this.tickMode === 'spoofing') {
            // Place huge blocks just below best bid to feign buying interest
            if (this.tickCounter % 10 === 0) {
                const spoofPrice = MathUtils.roundToTick(bestBid - 1);
                this.manager.submitOrder(this.id, CONSTANTS.ORDER_TYPES.LIMIT, CONSTANTS.SIDES.BID, spoofPrice, 100);
            }
            // Cancel them quickly before filled
            if (this.tickCounter % 15 === 0) {
                this.orders.forEach(o => this.manager.cancelOrder(this.id, o.id));
            }

            if (this.tickCounter > 200) {
                this.tickMode = 'dumping';
                this.orders.forEach(o => this.manager.cancelOrder(this.id, o.id));
            }
        }
        else if (this.tickMode === 'dumping') {
            // Smash the bids we just pumped up
            if (this.tickCounter % 5 === 0) {
                this.manager.submitOrder(this.id, CONSTANTS.ORDER_TYPES.MARKET, CONSTANTS.SIDES.ASK, 0, 80);
            }

            if (this.tickCounter > 250) {
                this.tickMode = 'spoofing';
                this.tickCounter = 0; // reset sequence
            }
        }
    }

    onOrderPlaced(order) { this.orders.set(order.id, order); }
    onOrderCanceled(order) { if (order) this.orders.delete(order.id); }
    onTrade(trade) { }
}

window.PredatoryBot = PredatoryBot;
