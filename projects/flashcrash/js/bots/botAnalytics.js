/**
 * Detailed Order tracking for individual bot analytics
 */
class BotAnalytics {
    constructor(botId) {
        this.botId = botId;
        this.ordersPlaced = 0;
        this.ordersCanceled = 0;
        this.ordersFilled = 0;
        this.totalVolumeTraded = 0;
        this.realizedPnL = 0;
        this.unrealizedPnL = 0;

        this.tradeHistory = [];
    }

    onOrderPlaced() {
        this.ordersPlaced++;
    }

    onOrderCanceled() {
        this.ordersCanceled++;
    }

    onTrade(trade, inventory, markPrice) {
        this.ordersFilled++;
        this.totalVolumeTraded += trade.size;
        this.tradeHistory.push(trade);

        if (this.tradeHistory.length > 100) {
            this.tradeHistory.shift(); // Keep bounded
        }

        this.updatePnL(inventory, markPrice);
    }

    updatePnL(inventory, markPrice) {
        // Simple mock PnL for demonstration
        this.unrealizedPnL = inventory * markPrice * 0.001; // Mock fraction
    }

    getReport() {
        const fillRate = this.ordersPlaced > 0 ? (this.ordersFilled / this.ordersPlaced) * 100 : 0;
        const cancelRate = this.ordersPlaced > 0 ? (this.ordersCanceled / this.ordersPlaced) * 100 : 0;

        return {
            botId: this.botId,
            placed: this.ordersPlaced,
            filled: this.ordersFilled,
            canceled: this.ordersCanceled,
            fillRate: fillRate.toFixed(2) + '%',
            cancelRate: cancelRate.toFixed(2) + '%',
            volume: this.totalVolumeTraded.toFixed(2),
            uPnL: this.unrealizedPnL.toFixed(2)
        };
    }
}

window.BotAnalytics = BotAnalytics;
