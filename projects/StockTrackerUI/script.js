const stockList = document.getElementById("stockList");
const searchInput = document.getElementById("search");

// Fake stock data (offline UI demo)
let stocks = [
  { symbol: "AAPL", name: "Apple Inc.", price: 192.12, change: 1.45 },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 2850.40, change: -12.30 },
  { symbol: "TSLA", name: "Tesla Inc.", price: 245.80, change: 5.62 },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 134.10, change: -2.18 },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 378.95, change: 3.25 }
];

// Render stocks
function renderStocks(filter = "") {
  stockList.innerHTML = "";

  stocks
    .filter(stock =>
      stock.symbol.toLowerCase().includes(filter.toLowerCase()) ||
      stock.name.toLowerCase().includes(filter.toLowerCase())
    )
    .forEach(stock => {
      const card = document.createElement("div");
      card.className = "stock-card";

      const trendClass = stock.change >= 0 ? "up" : "down";
      const sign = stock.change >= 0 ? "+" : "";

      card.innerHTML = `
        <div class="stock-info">
          <div class="symbol">${stock.symbol}</div>
          <small>${stock.name}</small>
        </div>

        <div>
          <div class="price">$${stock.price.toFixed(2)}</div>
          <div class="change ${trendClass}">
            ${sign}${stock.change.toFixed(2)}%
          </div>
        </div>
      `;

      stockList.appendChild(card);
    });
}

// Search filter
searchInput.addEventListener("input", () => {
  renderStocks(searchInput.value);
});

// Initial load
renderStocks();