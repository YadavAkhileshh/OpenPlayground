/**
 * Controls the deployment, lifecycle, and interaction of all bots.
 */
class BotManager {
    constructor(engine, lob, bus, latency) {
        this.engine = engine;
        this.lob = lob;
        this.bus = bus;
        this.latency = latency;
        this.bots = new Map();

        // Listen for user bot creation
        this.bus.on(CONSTANTS.EVENTS.BOT_DEPLOYED, this.onDeployBot.bind(this));

        // Route executed trades to owning bots
        this.bus.on(CONSTANTS.EVENTS.TRADE_EXECUTED, this.onTradeExecuted.bind(this));
    }

    addBot(type, customParams = {}) {
        const id = uid();
        let bot;

        switch (type) {
            case CONSTANTS.BOT_TYPES.MARKET_MAKER:
                bot = new MarketMaker(id, this, customParams);
                break;
            case CONSTANTS.BOT_TYPES.MOMENTUM:
                bot = new MomentumBot(id, this, customParams);
                break;
            case CONSTANTS.BOT_TYPES.NOISE:
                bot = new NoiseBot(id, this, customParams);
                break;
            case CONSTANTS.BOT_TYPES.WHALE:
                bot = new WhaleBot(id, this, customParams);
                break;
            case CONSTANTS.BOT_TYPES.PREDATORY:
                bot = new PredatoryBot(id, this, customParams);
                break;
            case CONSTANTS.BOT_TYPES.ARBITRAGE:
                bot = new ArbitrageBot(id, this, customParams);
                break;
            case CONSTANTS.BOT_TYPES.SNIPER:
                bot = new SniperBot(id, this, customParams);
                break;
            default:
                console.error("Unknown bot type", type);
                return null;
        }

        this.bots.set(id, bot);
        bot.start();
        return bot;
    }

    removeBot(id) {
        const bot = this.bots.get(id);
        if (bot) {
            bot.stop();
            this.bots.delete(id);
            this.bus.emit(CONSTANTS.EVENTS.BOT_REMOVED, id);
        }
    }

    tick() {
        this.bots.forEach(bot => bot.tick());
    }

    // Agent APIs wrapped in latency simulator
    submitOrder(botId, type, side, price, size) {
        this.latency.schedule(() => {
            const bot = this.bots.get(botId);
            if (!bot) return; // bot was killed
            const order = new Order(botId, type, side, price, size);
            this.engine.processOrder(order);
            bot.onOrderPlaced(order);
        });
    }

    cancelOrder(botId, orderId) {
        this.latency.schedule(() => {
            const bot = this.bots.get(botId);
            if (!bot) return;
            const canceledOrder = this.lob.cancelOrder(orderId);
            bot.onOrderCanceled(canceledOrder);
        });
    }

    onTradeExecuted(trade) {
        if (this.bots.has(trade.makerOrderId)) {
            // Find bot by iterating orders (slow, but ok for sim, real system maps them)
            // For sim, bot keeps track of its own orders
        }

        // Notify both maker and taker if they are bots
        this.bots.forEach(bot => {
            if (bot.orders.has(trade.makerOrderId) || bot.orders.has(trade.takerOrderId)) {
                bot.onTrade(trade);
            }
        });
    }

    onDeployBot(type) {
        if (this.bots.size >= window.CONFIG.BOT_DEPLOYMENT_MAX) {
            this.bus.emitAsync(CONSTANTS.EVENTS.LOG, { level: 'error', msg: 'MAX BOT CAPACITY REACHED' });
            return;
        }
        this.addBot(type);
        this.bus.emitAsync(CONSTANTS.EVENTS.LOG, { level: 'info', msg: `${type} BOT DEPLOYED TO NETWORK` });
    }
}

window.BotManager = BotManager;
