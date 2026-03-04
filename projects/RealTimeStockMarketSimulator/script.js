const stocks = [
  { name: "AAPL", price: 150, history: [] },
  { name: "GOOG", price: 2800, history: [] },
  { name: "TSLA", price: 700, history: [] }
];

let cash = 10000;
let portfolio = {};

const stockListDiv = document.getElementById("stockList");
const portfolioDiv = document.getElementById("portfolio");
const cashSpan = document.getElementById("cash");
const totalValueDiv = document.getElementById("totalValue");
const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");

function renderStocks() {
  stockListDiv.innerHTML = "";
  stocks.forEach((stock, index) => {
    const div = document.createElement("div");
    div.className = "stock";
    div.innerHTML = `
      ${stock.name} - $${stock.price.toFixed(2)}
      <button onclick="buy(${index})">Buy</button>
      <button onclick="sell(${index})">Sell</button>
    `;
    stockListDiv.appendChild(div);
  });
}

function buy(index) {
  const stock = stocks[index];
  if (cash >= stock.price) {
    cash -= stock.price;
    portfolio[stock.name] = (portfolio[stock.name] || 0) + 1;
    updatePortfolio();
  }
}

function sell(index) {
  const stock = stocks[index];
  if (portfolio[stock.name] > 0) {
    portfolio[stock.name]--;
    cash += stock.price;
    updatePortfolio();
  }
}

function updatePortfolio() {
  portfolioDiv.innerHTML = "";
  let totalStockValue = 0;

  stocks.forEach(stock => {
    const qty = portfolio[stock.name] || 0;
    if (qty > 0) {
      const value = qty * stock.price;
      totalStockValue += value;
      portfolioDiv.innerHTML += `${stock.name}: ${qty} shares ($${value.toFixed(2)})<br>`;
    }
  });

  cashSpan.textContent = cash.toFixed(2);
  totalValueDiv.textContent =
    `Total Portfolio Value: $${(cash + totalStockValue).toFixed(2)}`;
}

function updatePrices() {
  stocks.forEach(stock => {
    const change = (Math.random() - 0.5) * 5;
    stock.price += change;
    stock.price = Math.max(10, stock.price);
    stock.history.push(stock.price);
    if (stock.history.length > 100)
      stock.history.shift();
  });
  renderStocks();
  updatePortfolio();
  drawChart();
}

function drawChart() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  stocks.forEach((stock, idx) => {
    ctx.beginPath();
    ctx.strokeStyle = ["#3b82f6", "#22c55e", "#ef4444"][idx];
    ctx.lineWidth = 2;

    stock.history.forEach((price, i) => {
      const x = (canvas.width / 100) * i;
      const y = canvas.height - (price / 3000) * canvas.height;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();
  });
}

setInterval(updatePrices, 1000);

renderStocks();
updatePortfolio();
