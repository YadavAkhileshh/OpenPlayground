/**
 * Tracks PnL and inventory exposure for all bots on the platform continuously
 */
class RiskManagementSystem {
    constructor(botManager, eventBus) {
        this.botManager = botManager;
        this.bus = eventBus;

        this.marginRequirements = 0.05; // 5% default margin
        this.liquidations = 0;
        this.globalExposure = 0;
        this.globalUnrealizedPnL = 0;
    }

    evaluateRisk(markPrice) {
        let totalExposure = 0;
        let totalUpnl = 0;

        this.botManager.bots.forEach(bot => {
            if (!bot.inventory) return;

            // Absolute position value
            const positionValue = Math.abs(bot.inventory) * markPrice;
            totalExposure += positionValue;

            // Upnl = Inventory * (Mark - AvgEntry... estimating using current mark for demo)
            const upnl = bot.inventory * (markPrice * 0.001); // Mock upnl
            totalUpnl += upnl;

            // Trigger margin call if highly leveraged and in a severe drawdown 
            // (Simulating liquidation engine)
            if (positionValue > 100000 && upnl < -20000) {
                this.liquidateBot(bot.id, markPrice);
            }
        });

        this.globalExposure = totalExposure;
        this.globalUnrealizedPnL = totalUpnl;
    }

    liquidateBot(botId, markPrice) {
        const bot = this.botManager.bots.get(botId);
        if (!bot) return;

        this.liquidations++;
        this.bus.emitAsync(CONSTANTS.EVENTS.LOG, {
            level: 'error',
            msg: `LIQUIDATION MARGIN CALL: Bot ${botId.substring(0, 6)} closed.`
        });

        const side = bot.inventory > 0 ? CONSTANTS.SIDES.ASK : CONSTANTS.SIDES.BID;
        const size = Math.abs(bot.inventory);

        bot.stop();
        this.botManager.removeBot(botId);

        // Force dump inventory to market
        if (size > 0.0001) {
            this.botManager.submitOrder(botId, CONSTANTS.ORDER_TYPES.MARKET, side, 0, size);
        }
    }
}

window.RiskManagementSystem = RiskManagementSystem;
