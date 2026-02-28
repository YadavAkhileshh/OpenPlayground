class BotPanel {
    constructor(bus, botManager) {
        this.bus = bus;
        this.botManager = botManager;
        this.elList = document.getElementById('bot-list');
        this.elBtnAdd = document.getElementById('add-bot-btn');

        this.elBtnAdd.addEventListener('click', () => {
            // Add random bot type
            const types = [
                CONSTANTS.BOT_TYPES.MARKET_MAKER,
                CONSTANTS.BOT_TYPES.MOMENTUM,
                CONSTANTS.BOT_TYPES.NOISE,
                CONSTANTS.BOT_TYPES.ARBITRAGE
            ];
            this.bus.emit(CONSTANTS.EVENTS.BOT_DEPLOYED, types[Math.floor(Math.random() * types.length)]);
        });

        // Fast update loop
        setInterval(this.render.bind(this), 1000);
    }

    render() {
        let html = '';
        this.botManager.bots.forEach(bot => {
            let cls = 'bot-card active';
            if (bot.type === CONSTANTS.BOT_TYPES.PREDATORY || bot.type === CONSTANTS.BOT_TYPES.WHALE) cls += ' predatory';

            html += `
            <div class="${cls}" data-id="${bot.id}">
                <div class="bot-card-header">
                    <span class="bot-name">${bot.type}</span>
                    <span class="bot-status">RUNNING</span>
                </div>
                <div class="bot-stats">
                    <span>ORD: <span class="bot-stat-val">${bot.orders.size}</span></span>
                    <span>INV: <span class="bot-stat-val">${(bot.inventory || 0).toFixed(1)}</span></span>
                </div>
            </div>`;
        });
        this.elList.innerHTML = html;
    }
}

window.BotPanel = BotPanel;
