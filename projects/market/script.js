const canvas = document.getElementById('chartCanvas');
const ctx = canvas.getContext('2d');

// DOM Elements
const priceDisplay = document.getElementById('priceDisplay');
const netWorthDisplay = document.getElementById('netWorthDisplay');
const cashDisplay = document.getElementById('cashDisplay');
const sharesDisplay = document.getElementById('sharesDisplay');
const avgCostDisplay = document.getElementById('avgCostDisplay');
const trendIcon = document.getElementById('trendIcon');
const newsDisplay = document.getElementById('newsDisplay');

// Buttons
const btnsBuy = [
    { el: document.getElementById('btnBuy1'), qty: 1 },
    { el: document.getElementById('btnBuy10'), qty: 10 },
    { el: document.getElementById('btnBuyAll'), qty: 'max' }
];
const btnsSell = [
    { el: document.getElementById('btnSell1'), qty: 1 },
    { el: document.getElementById('btnSell10'), qty: 10 },
    { el: document.getElementById('btnSellAll'), qty: 'max' }
];

// Market State
let priceHistory = Array(60).fill(100); // 60 data points
let currentPrice = 100.00;
let marketTrend = 0; // -1 to 1 (Bear to Bull)
let volatility = 2.5;

// Player State
let cash = 1000.00;
let shares = 0;
let totalCost = 0;

// News Events Dictionary
const newsEvents = [
    { text: "Tech CEO promises revolutionary AI update.", trend: 0.8, vol: 4 },
    { text: "Global supply chain faces minor disruptions.", trend: -0.5, vol: 3 },
    { text: "Central bank announces unexpected interest rate hike.", trend: -1.2, vol: 5 },
    { text: "Record-breaking quarterly profits reported.", trend: 1.2, vol: 3 },
    { text: "Scandal erupts over leaked internal emails!", trend: -1.5, vol: 6 },
    { text: "Merger rumors send shockwaves through the industry.", trend: 0.9, vol: 4 },
    { text: "Market analysts predict a period of stagnation.", trend: 0, vol: 1 }
];

function updateMarket() {
    // Random walk with drift (trend)
    const change = (Math.random() * volatility * 2) - volatility + marketTrend;
    currentPrice += change;
    
    // Hard floor to prevent negative prices
    if (currentPrice < 1) currentPrice = 1 + Math.random(); 

    // Update history array
    priceHistory.shift();
    priceHistory.push(currentPrice);

    // Slowly revert trend to 0 (mean reversion)
    marketTrend *= 0.9;
    volatility = Math.max(1.5, volatility * 0.95);

    updateUI();
    drawChart();
}

function triggerNewsEvent() {
    const event = newsEvents[Math.floor(Math.random() * newsEvents.length)];
    newsDisplay.innerText = event.text;
    marketTrend = event.trend;
    volatility = event.vol;
}

function formatMoney(num) {
    return num.toFixed(2);
}

function updateUI() {
    // Current Price & Icon
    priceDisplay.innerText = formatMoney(currentPrice);
    const lastPrice = priceHistory[priceHistory.length - 2];
    
    if (currentPrice > lastPrice) {
        trendIcon.innerText = "📈";
        priceDisplay.className = "up";
    } else {
        trendIcon.innerText = "📉";
        priceDisplay.className = "down";
    }

    // Portfolio Math
    const netWorth = cash + (shares * currentPrice);
    const avgCost = shares > 0 ? totalCost / shares : 0;

    netWorthDisplay.innerText = formatMoney(netWorth);
    cashDisplay.innerText = "$" + formatMoney(cash);
    sharesDisplay.innerText = shares;
    avgCostDisplay.innerText = "$" + formatMoney(avgCost);

    // Color code Net Worth
    netWorthDisplay.className = netWorth >= 1000 ? "up" : "down";

    // Button states
    btnsBuy.forEach(btn => btn.el.disabled = cash < currentPrice);
    btnsSell.forEach(btn => btn.el.disabled = shares === 0);
}

function drawChart() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 1;
    for(let i=0; i<5; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * 75);
        ctx.lineTo(canvas.width, i * 75);
        ctx.stroke();
    }

    // Find min and max for dynamic scaling
    const minPrice = Math.min(...priceHistory) * 0.9;
    const maxPrice = Math.max(...priceHistory) * 1.1;
    const range = maxPrice - minPrice;

    // Draw Line
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    
    const isUp = priceHistory[priceHistory.length - 1] >= priceHistory[0];
    ctx.strokeStyle = isUp ? '#3fb950' : '#f85149';

    for (let i = 0; i < priceHistory.length; i++) {
        const x = (i / (priceHistory.length - 1)) * canvas.width;
        // Invert Y axis because canvas 0,0 is top-left
        const normalizedY = (priceHistory[i] - minPrice) / range;
        const y = canvas.height - (normalizedY * canvas.height);
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Create gradient fill under the line
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, isUp ? 'rgba(63, 185, 80, 0.3)' : 'rgba(248, 81, 73, 0.3)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fillStyle = gradient;
    ctx.fill();
}

// Transaction Logic
function buy(qty) {
    if (qty === 'max') qty = Math.floor(cash / currentPrice);
    if (qty <= 0 || cash < currentPrice * qty) return;
    
    const cost = currentPrice * qty;
    cash -= cost;
    shares += qty;
    totalCost += cost;
    updateUI();
}

function sell(qty) {
    if (qty === 'max') qty = shares;
    if (qty <= 0 || shares < qty) return;

    // Remove proportionate cost
    const avgCost = totalCost / shares;
    totalCost -= avgCost * qty;
    
    shares -= qty;
    cash += currentPrice * qty;
    updateUI();
}

// Event Listeners
btnsBuy.forEach(b => b.el.addEventListener('click', () => buy(b.qty)));
btnsSell.forEach(b => b.el.addEventListener('click', () => sell(b.qty)));

// Game Loops
setInterval(updateMarket, 1000); // Tick market every 1 second
setInterval(triggerNewsEvent, 8000); // News event every 8 seconds

// Init
updateUI();
drawChart();