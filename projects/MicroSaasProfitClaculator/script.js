function calculateProfit() {
  const devCost = parseFloat(document.getElementById("devCost").value) || 0;
  const hosting = parseFloat(document.getElementById("hosting").value) || 0;
  const users = parseInt(document.getElementById("users").value) || 0;
  const price = parseFloat(document.getElementById("price").value) || 0;
  const churn = parseFloat(document.getElementById("churn").value) || 0;

  const result = document.getElementById("result");

  if (!devCost || !hosting || !users || !price) {
    result.innerHTML = "<p>Please fill required fields.</p>";
    return;
  }

  // Monthly revenue
  const monthlyRevenue = users * price;

  // Monthly profit
  const monthlyProfit = monthlyRevenue - hosting;

  // Break-even calculation
  let breakEvenMonths = monthlyProfit > 0
    ? Math.ceil(devCost / monthlyProfit)
    : "Never (Not profitable)";

  // Simulated growth projection (after churn)
  const netUserGrowth = users * (1 - churn / 100);
  const projectedRevenue = netUserGrowth * price;

  // Profit Margin
  const profitMargin = monthlyRevenue > 0
    ? ((monthlyProfit / monthlyRevenue) * 100).toFixed(1)
    : 0;

  let statusClass = "good";
  let statusText = "Healthy Model";

  if (profitMargin < 30) {
    statusClass = "medium";
    statusText = "Moderate Risk";
  }

  if (profitMargin < 10) {
    statusClass = "bad";
    statusText = "High Risk";
  }

  result.innerHTML = `
    <h2>Financial Report</h2>

    <p><strong>Monthly Revenue:</strong> $${monthlyRevenue.toFixed(2)}</p>
    <p><strong>Monthly Profit:</strong> $${monthlyProfit.toFixed(2)}</p>
    <p><strong>Profit Margin:</strong> ${profitMargin}%</p>
    <p><strong>Break-even Time:</strong> ${breakEvenMonths} months</p>

    <hr>

    <p><strong>Projected Revenue After Churn:</strong> $${projectedRevenue.toFixed(2)}</p>

    <hr>

    <p><strong>Business Health:</strong> 
      <span class="${statusClass}">${statusText}</span>
    </p>
  `;
}
