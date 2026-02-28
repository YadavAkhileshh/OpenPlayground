/**
 * Price-Time priority queue for orders at a specific price level.
 * Backed by the custom DoublyLinkedList.
 */
class OrderQueue {
    constructor(price) {
        this.price = price;
        this.volume = 0;
        this.orders = new DoublyLinkedList(); // Fast insertion/deletion O(1)
    }

    append(order) {
        const node = this.orders.append(order);
        order.queueNode = node;
        this.volume += order.size;
    }

    remove(order) {
        if (!order.queueNode) return;
        this.orders.removeNode(order.queueNode);
        this.volume -= order.size;
        order.queueNode = null;
    }

    head() {
        return this.orders.peekHead();
    }

    isEmpty() {
        return this.orders.isEmpty();
    }
}

window.OrderQueue = OrderQueue;
