/**
 * Represents an aggregated entry in the Limit Order Book tree
 */
class PriceLevel {
    constructor(price) {
        this.price = price;
        this.queue = new OrderQueue(price);
    }

    get volume() {
        return this.queue.volume;
    }

    append(order) {
        this.queue.append(order);
    }

    remove(order) {
        this.queue.remove(order);
    }

    isEmpty() {
        return this.queue.isEmpty();
    }
}

window.PriceLevel = PriceLevel;
