class UIManager {
    constructor(bus, metrics, calc, latency) {
        this.bus = bus;
        this.metrics = metrics;
        this.calc = calc;
        this.latency = latency;

        this.elPrice = document.getElementById('global-last-price');
        this.elSpread = document.getElementById('global-spread');
        this.elVol = document.getElementById('global-volume');
        this.elTps = document.getElementById('global-tps');
        this.elLatency = document.getElementById('global-latency');

        this.vixVal = document.getElementById('vix-val');
        this.trendVal = document.getElementById('trend-val');

        this.btnFlash = document.getElementById('btn-flash-crash');
        this.btnFlash.addEventListener('click', () => {
            this.bus.emit('USER_FLASH_CRASH');
            this.btnFlash.classList.add('flash-crash-active');
            setTimeout(() => this.btnFlash.classList.remove('flash-crash-active'), 5000);
        });

        this.bus.on(CONSTANTS.EVENTS.MARKET_STATE_CHANGE, this.updateGlobal.bind(this));

        // Internal refresh map
        setInterval(this.updateSlowStats.bind(this), 500);
    }

    updateGlobal(state) {
        // Fast updates for main ticker
        if (state.lastPrice) {
            this.elPrice.innerText = Utils.formatPrice(state.lastPrice);
            // Flash color based on tick direction maybe, omit for performance focus
        }
        if (state.spread !== undefined) {
            this.elSpread.innerText = Utils.formatPrice(state.spread);
        }
    }

    updateSlowStats() {
        this.elVol.innerText = Utils.formatVolume(this.metrics.totalVolume24h);
        this.elTps.innerText = this.metrics.currentTps.toLocaleString();

        this.elLatency.innerText = `${Math.floor(this.latency.currentLatency)}ms`;

        this.vixVal.innerText = this.calc.vixSimulated.toFixed(2);

        const trend = this.calc.trend;
        this.trendVal.innerText = trend;
        this.trendVal.className = 'val ' + (trend === 'BULLISH' ? 'trend-up' : (trend === 'BEARISH' ? 'trend-down' : 'trend-neutral'));
    }
}

window.UIManager = UIManager;
