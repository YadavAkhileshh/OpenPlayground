/**
 * Limit Order Book utilizing Red-Black Trees for O(log N) price level tracking
 * and Doubly LinkedList for O(1) order operations per level
 */
class LimitOrderBook {
    constructor() {
        // Red Black Trees tracking price levels
        this.bidsTree = new RedBlackTree();
        this.asksTree = new RedBlackTree();

        // Fast reference map: Order ID -> Order
        this.orders = new Map();

        // Fast reference map: Price -> PriceLevel (helps avoid O(log N) tree search when adjusting volume)
        this.bidsLevels = new Map();
        this.asksLevels = new Map();

        this.bestBidPrice = 0;
        this.bestAskPrice = Infinity;
    }

    addOrder(order) {
        this.orders.set(order.id, order);

        const isBid = order.side === CONSTANTS.SIDES.BID;
        const levels = isBid ? this.bidsLevels : this.asksLevels;
        const tree = isBid ? this.bidsTree : this.asksTree;

        let level = levels.get(order.price);
        if (!level) {
            level = new PriceLevel(order.price);
            levels.set(order.price, level);
            tree.insert(order.price, level);
            this._updateBest(order.side);
        }

        level.append(order);
    }

    cancelOrder(orderId) {
        const order = this.orders.get(orderId);
        if (!order) return null;

        const isBid = order.side === CONSTANTS.SIDES.BID;
        const levels = isBid ? this.bidsLevels : this.asksLevels;
        const tree = isBid ? this.bidsTree : this.asksTree;

        const level = levels.get(order.price);
        if (level) {
            level.remove(order);
            if (level.isEmpty()) {
                levels.delete(order.price);
                tree.remove(order.price);
                this._updateBest(order.side);
            }
        }

        this.orders.delete(orderId);
        order.status = CONSTANTS.ORDER_STATUS.CANCELED;
        return order;
    }

    _updateBest(side) {
        if (side === CONSTANTS.SIDES.BID) {
            const maxNode = this.bidsTree.getMax();
            this.bestBidPrice = maxNode ? maxNode.key : 0;
        } else {
            const minNode = this.asksTree.getMin();
            this.bestAskPrice = minNode ? minNode.key : Infinity;
        }
    }

    getBestBid() {
        return this.bestBidPrice;
    }

    getBestAsk() {
        return this.bestAskPrice;
    }

    getSpread() {
        if (this.bestAskPrice === Infinity || this.bestBidPrice === 0) return 0;
        return this.bestAskPrice - this.bestBidPrice;
    }

    /**
     * For rendering views. Retrieves top N depths in sorted order.
     */
    getSnapshot(depth = 20) {
        const bids = [];
        const asks = [];

        // Bids: highest to lowest
        let bidCount = 0;
        for (let node of this.bidsTree.reverseOrder()) {
            if (bidCount++ >= depth) break;
            bids.push({ price: node.key, volume: node.value.volume });
        }

        // Asks: lowest to highest
        let askCount = 0;
        for (let node of this.asksTree.inOrder()) {
            if (askCount++ >= depth) break;
            asks.push({ price: node.key, volume: node.value.volume });
        }

        // Ensure asks are visually reversed if displaying the traditional ladder (highest ask on top)
        // Renderer will handle order, just return sorted.
        return { bids, asks };
    }
}

window.LimitOrderBook = LimitOrderBook;
