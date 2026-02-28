/**
 * SYNTHETIC EXCHANGE ENGINE
 * A behavior-driven market simulation.
 */

// --- CONFIGURATION ---
const CONFIG = {
    initialCash: 10000,
    tickRate: 1500,        // ms per market update
    candlePeriod: 4,       // ticks per candle
    maxHistory: 80,        // max candles to store
    baseFee: 0.001         // 0.1% fee
};

// --- DATA: HIDDEN ATTRIBUTES ---
const COMPANIES = [
    { s: 'AURA', n: 'Aura Systems', vol: 0.03, stab: 0.8, price: 150.00 }, // Stable
    { s: 'ZEPHYR', n: 'Zephyr Energy', vol: 0.08, stab: 0.4, price: 45.00 }, // Volatile
    { s: 'NEXUS', n: 'Nexus Cyber', vol: 0.05, stab: 0.6, price: 85.00 },
    { s: 'VOID', n: 'Void Dynamics', vol: 0.12, stab: 0.2, price: 12.00 }, // High Risk
    { s: 'PRIME', n: 'Prime Logistics', vol: 0.02, stab: 0.9, price: 210.00 },
    { s: 'FLUX', n: 'Flux Biotech', vol: 0.15, stab: 0.1, price: 30.00 }   // Speculative
];

// --- CLASSES ---

class Candle {
    constructor(open, timeIndex) {
        this.o = open; this.h = open; this.l = open; this.c = open;
        this.t = timeIndex;
    }
    update(price) {
        if (price > this.h) this.h = price;
        if (price < this.l) this.l = price;
        this.c = price;
    }
}

class Stock {
    constructor(data) {
        this.symbol = data.s;
        this.name = data.n;
        // Hidden attributes
        this.volatility = data.vol;
        this.stability = data.stab;
        
        // State
        this.price = data.price;
        this.prevPrice = data.price;
        this.candles = [];
        this.currentCandle = new Candle(this.price, 0);
        this.tickCount = 0;
        this.candleIndex = 0;
        
        // Pressure System (Delayed Consequences)
        this.buyPressure = 0;
        this.sellPressure = 0;
        this.momentum = 0;
        this.halted = false;
    }

    tick(globalSentiment) {
        if (this.halted) return;

        this.prevPrice = this.price;

        // 1. Calculate Net Pressure (Orders don't hit instantly, they "bleed" in)
        const netPressure = this.buyPressure - this.sellPressure;
        
        // 2. Volatility Calculation
        // Volatility increases with pressure imbalance
        let activeVol = this.volatility * (1 + Math.abs(netPressure) * 1.5);
        if (globalSentiment < 0.7) activeVol *= 1.5; // Panic increases vol
        
        // 3. Price Algorithm
        // Price = Old * (1 + SentimentDrift + PressureDrift + RandomNoise)
        const sentimentDrift = (globalSentiment - 1.0) * (1 - this.stability) * 0.05;
        const pressureDrift = netPressure * 0.01;
        const noise = (Math.random() - 0.5) * activeVol;
        
        const changePct = sentimentDrift + pressureDrift + noise;
        this.price = Math.max(0.10, this.price * (1 + changePct));

        // 4. Candle Logic
        this.currentCandle.update(this.price);
        this.tickCount++;
        if (this.tickCount >= CONFIG.candlePeriod) {
            this.candles.push(this.currentCandle);
            if (this.candles.length > CONFIG.maxHistory) this.candles.shift();
            this.candleIndex++;
            this.currentCandle = new Candle(this.price, this.candleIndex);
            this.tickCount = 0;
        }

        // 5. Decay Pressure
        this.buyPressure *= 0.85;
        this.sellPressure *= 0.85;

        // 6. Event Triggers (Flash Crash)
        if (changePct < -0.12) {
            this.halted = true;
            App.logNews(`TRADING HALT: ${this.symbol} triggered circuit breaker.`, true);
            setTimeout(() => { this.halted = false; App.logNews(`${this.symbol} resumed.`); }, 8000);
        }
    }
}

// --- APP ENGINE ---

const App = {
    stocks: [],
    cash: CONFIG.initialCash,
    holdings: {}, // { SYM: { qty, avg } }
    selectedSym: null,
    sentiment: 1.0, // 0.5 (Panic) - 1.5 (Euphoria)
    ticks: 0,
    stats: { panicSells: 0, riskyBuys: 0 },

    init() {
        // Init Stocks
        COMPANIES.forEach(c => this.stocks.push(new Stock(c)));
        this.selectedSym = this.stocks[0].symbol;

        // Load Persistence
        const saved = localStorage.getItem('syn_exchange_save');
        if (saved) {
            const data = JSON.parse(saved);
            this.cash = data.cash;
            this.holdings = data.holdings;
            this.stats = data.stats;
        }

        // Setup Chart Canvas
        this.setupCanvas();
        
        // Start Loop
        setInterval(() => this.tick(), CONFIG.tickRate);
        this.tick();
        this.render();
    },

    tick() {
        this.ticks++;

        // Update Sentiment (Drift towards mean, affected by recent drops)
        // If user is panic selling, sentiment drops faster
        let sentimentTarget = 1.0; 
        if (this.stats.panicSells > 2) sentimentTarget = 0.8;
        this.sentiment += (sentimentTarget - this.sentiment) * 0.05;
        this.sentiment += (Math.random() - 0.5) * 0.05; // Natural drift

        // Tick Stocks
        this.stocks.forEach(s => s.tick(this.sentiment));

        // Generate Insights/News occasionally
        if (this.ticks % 4 === 0) this.generateInsight();
        if (Math.random() > 0.95) this.generateNews();

        // Save State
        if (this.ticks % 10 === 0) {
            localStorage.setItem('syn_exchange_save', JSON.stringify({
                cash: this.cash,
                holdings: this.holdings,
                stats: this.stats
            }));
        }

        this.render();
    },

    trade(type) {
        const s = this.stocks.find(x => x.symbol === this.selectedSym);
        if (s.halted) return this.feedback("MARKET HALTED", "warn");

        const price = s.price;
        const slippage = s.volatility * 0.5; // More vol = more slippage
        const executionPrice = type === 'buy' ? price * (1 + slippage) : price * (1 - slippage);
        const cost = executionPrice * (1 + CONFIG.baseFee);

        if (type === 'buy') {
            if (this.cash >= cost) {
                this.cash -= cost;
                // Add Holdings
                if (!this.holdings[s.symbol]) this.holdings[s.symbol] = { qty: 0, avg: 0 };
                const h = this.holdings[s.symbol];
                const totalVal = (h.qty * h.avg) + cost;
                h.qty++;
                h.avg = totalVal / h.qty;
                
                // Market Impact
                s.buyPressure += 1.5; 
                if (s.volatility > 0.1) this.stats.riskyBuys++;
                
                this.feedback("ORDER FILLED");
            } else {
                this.feedback("INSUFFICIENT CASH", "warn");
            }
        } else {
            const h = this.holdings[s.symbol];
            if (h && h.qty > 0) {
                this.cash += executionPrice * (1 - CONFIG.baseFee);
                h.qty--;
                if (h.qty === 0) delete this.holdings[s.symbol];
                
                // Market Impact
                s.sellPressure += 1.5;
                if (executionPrice < h.avg) this.stats.panicSells++;

                this.feedback("ORDER FILLED");
            } else {
                this.feedback("NO POSITION", "warn");
            }
        }
        this.render();
    },

    feedback(msg, type='bull') {
        const el = document.getElementById('trade-feedback');
        el.innerText = msg;
        el.className = type === 'warn' ? 'c-warn' : 'c-bull';
        setTimeout(() => el.innerText = "", 2000);
    },

    // --- ANALYST ENGINE ---
    generateInsight() {
        const box = document.getElementById('insight-box');
        const s = this.stocks.find(x => x.symbol === this.selectedSym);
        
        // Calculate Signal
        const netPressure = s.buyPressure - s.sellPressure;
        const volatilityHigh = (s.price - s.candles[Math.max(0, s.candles.length-5)]?.c) / s.price;
        
        let msg = "Market conditions stable.";
        let confidence = "High";
        
        // "AI" Logic
        if (this.sentiment < 0.7) {
            msg = "Global fear detected. Cash positions recommended.";
            confidence = "Medium";
        } else if (Math.abs(volatilityHigh) > 0.1) {
            msg = volatilityHigh > 0 ? "Speculative rally underway. Exercise caution." : "Falling knife detected. Do not catch.";
            confidence = "Low";
        } else if (netPressure > 1) {
            msg = "Accumulation patterns detected. Upward pressure likely.";
            confidence = "Medium";
        } else if (netPressure < -1) {
            msg = "Distribution patterns detected. Downside risk.";
            confidence = "Medium";
        }

        // Output
        box.innerHTML = `
            <div class="insight-text">${msg}</div>
            <div class="insight-meta">
                <span>Signal Strength: ${confidence}</span>
                <span>Vol: ${(s.volatility * 100).toFixed(1)}</span>
            </div>
        `;
    },

    generateNews() {
        const events = [
            { t: "Analyst downgrade across tech sector", u: false },
            { t: "Liquidity crisis rumors emerging", u: true },
            { t: "Unexpected trading volume spike", u: false },
            { t: "Algorithmic trading anomaly detected", u: true }
        ];
        const e = events[Math.floor(Math.random() * events.length)];
        this.logNews(e.t, e.u);
    },

    logNews(text, urgent) {
        const feed = document.getElementById('news-feed');
        const div = document.createElement('div');
        div.className = `news-item ${urgent?'urgent':''}`;
        div.innerText = `[${new Date().toLocaleTimeString('en-US',{hour12:false})}] ${text}`;
        feed.prepend(div);
        if (feed.children.length > 15) feed.lastChild.remove();
    },

    // --- RENDERER ---
    setupCanvas() {
        this.canvas = document.getElementById('chart-canvas');
        this.ctx = this.canvas.getContext('2d');
        const resize = () => {
            const p = this.canvas.parentElement;
            // On mobile, use a slightly different sizing approach
            if (window.innerWidth <= 768) {
                this.canvas.width = p.clientWidth * 1.5; // Slightly lower scale for mobile
                this.canvas.height = p.clientHeight * 1.5;
                this.ctx.scale(1.5, 1.5);
            } else {
                this.canvas.width = p.clientWidth * 2; // Retina scale
                this.canvas.height = p.clientHeight * 2;
                this.ctx.scale(2, 2);
            }
        };
        window.addEventListener('resize', resize);
        resize();
    },

    drawChart() {
        const s = this.stocks.find(x => x.symbol === this.selectedSym);
        const ctx = this.ctx;
        const w = this.canvas.width / 2;
        const h = this.canvas.height / 2;
        
        // Clear
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, w, h);

        const data = [...s.candles, s.currentCandle];
        if (data.length < 2) return;

        // Calc Scale
        let min = Infinity, max = -Infinity;
        data.forEach(c => {
            if (c.l < min) min = c.l;
            if (c.h > max) max = c.h;
        });
        let padding = (max - min) * 0.1;
        min -= padding; max += padding;
        const range = max - min;

        // Draw Logic
        const candleW = (w - 60) / CONFIG.maxHistory;
        
        data.forEach((c, i) => {
            // Position from right
            const x = w - 10 - ((data.length - 1 - i) * candleW);
            if (x < 0) return;

            // Y coords (invert because canvas 0,0 is top-left)
            const yH = h - ((c.h - min) / range * h);
            const yL = h - ((c.l - min) / range * h);
            const yO = h - ((c.o - min) / range * h);
            const yC = h - ((c.c - min) / range * h);

            const isGreen = c.c >= c.o;
            ctx.fillStyle = isGreen ? '#10b981' : '#ef4444';
            ctx.strokeStyle = ctx.fillStyle;

            // Wick
            ctx.beginPath();
            ctx.moveTo(x + candleW/2, yH);
            ctx.lineTo(x + candleW/2, yL);
            ctx.stroke();

            // Body
            const bodyH = Math.max(1, Math.abs(yC - yO));
            const bodyY = Math.min(yO, yC);
            ctx.fillRect(x + 2, bodyY, candleW - 4, bodyH);
        });

        // Price Line
        const currentY = h - ((s.price - min) / range * h);
        ctx.strokeStyle = '#3b82f6';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, currentY);
        ctx.lineTo(w, currentY);
        ctx.stroke();
        ctx.setLineDash([]);
    },

    render() {
        // 1. Header
        document.getElementById('ui-cash').innerText = '$' + this.cash.toLocaleString(undefined, {minimumFractionDigits: 2});
        
        // Equity Calc
        let equity = this.cash;
        Object.keys(this.holdings).forEach(k => {
            const p = this.stocks.find(s => s.symbol === k).price;
            equity += this.holdings[k].qty * p;
        });
        document.getElementById('ui-equity').innerText = '$' + equity.toLocaleString(undefined, {minimumFractionDigits: 2});
        
        const sentEl = document.getElementById('ui-sent');
        if (this.sentiment < 0.8) { sentEl.innerText = "FEAR"; sentEl.className = "stat-val c-bear"; }
        else if (this.sentiment > 1.2) { sentEl.innerText = "GREED"; sentEl.className = "stat-val c-bull"; }
        else { sentEl.innerText = "NEUTRAL"; sentEl.className = "stat-val"; }

        // 2. Stock List
        const list = document.getElementById('stock-list');
        list.innerHTML = "";
        this.stocks.forEach(s => {
            const chg = (s.price - s.prevPrice) / s.prevPrice * 100;
            const div = document.createElement('div');
            div.className = `stock-item ${s.symbol === this.selectedSym ? 'active' : ''}`;
            div.onclick = () => { this.selectedSym = s.symbol; this.render(); };
            div.innerHTML = `
                <div class="st-row">
                    <span class="st-sym">${s.symbol}</span>
                    <span class="st-price">${s.price.toFixed(2)}</span>
                </div>
                <div class="st-row">
                    <span style="font-size:0.75rem; color:#999">${s.name}</span>
                    <span class="st-change ${chg >= 0 ? 'c-bull' : 'c-bear'}">${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%</span>
                </div>
            `;
            list.appendChild(div);
        });

        // 3. Desk & Chart Info
        const s = this.stocks.find(x => x.symbol === this.selectedSym);
        document.getElementById('chart-sym').innerText = s.symbol + (s.halted ? " [HALTED]" : "");
        document.getElementById('chart-price').innerText = s.price.toFixed(2);
        
        const holding = this.holdings[s.symbol];
        document.getElementById('desk-qty').innerText = holding ? holding.qty : 0;
        document.getElementById('desk-avg').innerText = holding ? holding.avg.toFixed(2) : "---";
        document.getElementById('desk-vol').innerText = (s.volatility * 100).toFixed(0) + "%";
        
        const plEl = document.getElementById('desk-pl');
        if (holding) {
            const pl = (s.price - holding.avg) * holding.qty;
            plEl.innerText = (pl > 0 ? "+" : "") + pl.toFixed(2);
            plEl.className = `desk-val ${pl >= 0 ? 'c-bull' : 'c-bear'}`;
        } else {
            plEl.innerText = "---";
            plEl.className = "desk-val";
        }

        const btns = document.querySelectorAll('.controls button');
        btns.forEach(b => s.halted ? b.classList.add('btn-disabled') : b.classList.remove('btn-disabled'));

        // 4. Portfolio List
        const portList = document.getElementById('portfolio-list');
        portList.innerHTML = "";
        Object.keys(this.holdings).forEach(key => {
            const h = this.holdings[key];
            const stock = this.stocks.find(x => x.symbol === key);
            const val = h.qty * stock.price;
            const div = document.createElement('div');
            div.className = "pf-item";
            div.innerHTML = `
                <div class="pf-row">
                    <span style="font-weight:bold">${key}</span>
                    <span>$${val.toFixed(2)}</span>
                </div>
                <div class="pf-row" style="color:#888; font-size:0.8rem;">
                    <span>${h.qty} @ ${h.avg.toFixed(2)}</span>
                    <span class="${stock.price >= h.avg ? 'c-bull':'c-bear'}">
                        ${((stock.price - h.avg)/h.avg * 100).toFixed(1)}%
                    </span>
                </div>
            `;
            portList.appendChild(div);
        });

        // 5. Draw
        this.drawChart();
    }
};

// Mobile Panel Management
function setupMobileNavigation() {
    const tabs = document.querySelectorAll('.mobile-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab
            document.querySelectorAll('.mobile-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Hide all panels
            document.querySelectorAll('.panel').forEach(panel => {
                panel.classList.add('hidden');
                panel.style.display = 'none';
            });
            
            // Show selected panel
            const panelName = tab.getAttribute('data-panel');
            let panelToShow;
            
            switch(panelName) {
                case 'markets':
                    panelToShow = document.querySelector('aside.panel:first-child');
                    break;
                case 'chart':
                    panelToShow = document.querySelector('main.panel');
                    break;
                case 'intel':
                    panelToShow = document.querySelectorAll('aside.panel')[1];
                    break;
                case 'portfolio':
                    // For portfolio, we'll show the right panel and scroll to portfolio section
                    panelToShow = document.querySelectorAll('aside.panel')[1];
                    break;
            }
            
            if (panelToShow) {
                panelToShow.classList.remove('hidden');
                panelToShow.style.display = 'flex';
            }
        });
    });
}

// Start
window.onload = () => {
    App.init();
    
    // Set up mobile navigation
    if (window.innerWidth <= 768) {
        setupMobileNavigation();
        
        // Initially show the markets panel on mobile
        document.querySelectorAll('.panel').forEach((panel, index) => {
            if (index !== 0) panel.classList.add('hidden');
        });
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            // On larger screens, show all panels
            document.querySelectorAll('.panel').forEach(panel => {
                panel.classList.remove('hidden');
                panel.style.display = 'flex';
            });
            
            // Reset mobile tab selection
            document.querySelectorAll('.mobile-tab').forEach(t => t.classList.remove('active'));
            document.querySelector('.mobile-tab[data-panel="markets"]').classList.add('active');
        } else {
            // On smaller screens, set up mobile navigation if not already done
            if (!document.querySelector('.mobile-tab').onclick) {
                setupMobileNavigation();
            }
            
            // Hide all except the first panel
            document.querySelectorAll('.panel').forEach((panel, index) => {
                if (index === 0) {
                    panel.classList.remove('hidden');
                    panel.style.display = 'flex';
                } else {
                    panel.classList.add('hidden');
                    panel.style.display = 'none';
                }
            });
            
            // Ensure the markets tab is active
            document.querySelectorAll('.mobile-tab').forEach(t => t.classList.remove('active'));
            document.querySelector('.mobile-tab[data-panel="markets"]').classList.add('active');
        }
    });
};
