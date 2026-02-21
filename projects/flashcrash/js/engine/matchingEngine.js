/**
 * Core engine to match incoming orders against the LOB.
 * Uses event bus to announce trades in real-time.
 */
class MatchingEngine {
    constructor(lob, eventBus) {
        this.lob = lob;
        this.bus = eventBus;
        this.tradeCount = 0;
    }

    processOrder(order) {
        const trades = [];

        if (order.type === CONSTANTS.ORDER_TYPES.MARKET) {
            trades.push(...this._matchMarket(order));
        } else if (order.type === CONSTANTS.ORDER_TYPES.LIMIT) {
            trades.push(...this._matchLimit(order));
        }

        // Announce all trades
        for (let i = 0; i < trades.length; i++) {
            this.tradeCount++;
            this.bus.emit(CONSTANTS.EVENTS.TRADE_EXECUTED, trades[i]);
        }

        return trades;
    }

    _matchMarket(order) {
        const trades = [];
        const isBuy = order.side === CONSTANTS.SIDES.BID;

        while (order.size > 0.000001) {
            const bestLevelPrice = isBuy ? this.lob.getBestAsk() : this.lob.getBestBid();

            if (bestLevelPrice === Infinity || bestLevelPrice === 0) {
                order.status = CONSTANTS.ORDER_STATUS.REJECTED;
                break; // No liquidity
            }

            const level = isBuy ? this.lob.asksLevels.get(bestLevelPrice) : this.lob.bidsLevels.get(bestLevelPrice);
            if (!level) break; // Should not happen with valid tree

            const restingOrder = level.queue.head();
            if (!restingOrder) break; // Ghost order fallback

            const tradeSize = Math.min(order.size, restingOrder.size);
            const tradePrice = restingOrder.price;

            // Execute
            restingOrder.fill(tradeSize);
            order.fill(tradeSize);

            // Generate Trade
            trades.push(new Trade(restingOrder.id, order.id, tradePrice, tradeSize, order.side));

            // Cleanup resting if filled
            if (restingOrder.size === 0) {
                this.lob.cancelOrder(restingOrder.id);
            }
        }

        return trades;
    }

    _matchLimit(order) {
        const trades = [];
        const isBuy = order.side === CONSTANTS.SIDES.BID;

        // Try to match as long as there is an opportunistic crossing price
        while (order.size > 0.000001) {
            const crossPrice = isBuy ? this.lob.getBestAsk() : this.lob.getBestBid();

            // Check cross condition
            if (isBuy && order.price < crossPrice) break;
            if (!isBuy && order.price > crossPrice) break;
            if (crossPrice === Infinity || crossPrice === 0) break;

            const level = isBuy ? this.lob.asksLevels.get(crossPrice) : this.lob.bidsLevels.get(crossPrice);
            if (!level) break;

            const restingOrder = level.queue.head();
            if (!restingOrder) break;

            const tradeSize = Math.min(order.size, restingOrder.size);
            const tradePrice = restingOrder.price;

            // Execute
            restingOrder.fill(tradeSize);
            order.fill(tradeSize);

            trades.push(new Trade(restingOrder.id, order.id, tradePrice, tradeSize, order.side));

            if (restingOrder.size === 0) {
                this.lob.cancelOrder(restingOrder.id);
            }
        }

        // If order still has size after matching, add to book
        if (order.size > 0.000001) {
            this.lob.addOrder(order);
        }

        return trades;
    }
}

window.MatchingEngine = MatchingEngine;
