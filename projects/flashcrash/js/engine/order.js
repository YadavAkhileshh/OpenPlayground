class Order {
    constructor(botId, type, side, price, size) {
        this.id = uid();
        this.botId = botId;
        this.type = type; // LIMIT, MARKET
        this.side = side; // BID, ASK
        this.price = price;
        this.size = size;
        this.initialSize = size;
        this.timestamp = window.TimeClass ? window.TimeClass.now() : Date.now();
        this.status = CONSTANTS.ORDER_STATUS.NEW;

        // Linking for doubly linked list in PriceLevel
        this.next = null;
        this.prev = null;
        this.queueNode = null; // reference strictly for deletion
    }

    fill(amount) {
        this.size -= amount;
        if (this.size <= 0.000001) {
            this.size = 0;
            this.status = CONSTANTS.ORDER_STATUS.FILLED;
        } else {
            this.status = CONSTANTS.ORDER_STATUS.PARTIAL;
        }
    }
}

window.Order = Order;
