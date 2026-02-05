function calculate() {

  const revenue = parseFloat(document.getElementById("revenue").value);
  const teamSize = parseInt(document.getElementById("teamSize").value);
  const salary = parseFloat(document.getElementById("salary").value);
  const marketing = parseFloat(document.getElementById("marketing").value);
  const cash = parseFloat(document.getElementById("cash").value);

  const dashboard = document.getElementById("dashboard");
  const chartSection = document.getElementById("chartSection");

  dashboard.classList.remove("hidden");
  chartSection.classList.remove("hidden");

  const salaryCost = teamSize * salary;
  const totalExpenses = salaryCost + marketing;

  const burn = totalExpenses - revenue;
  const runway = burn > 0 ? (cash / burn).toFixed(1) : "Profitable";

  let breakEvenMonths = "--";
  if (burn > 0) {
    const growthRate = 0.1; // assume 10% monthly growth
    let projectedRevenue = revenue;
    let months = 0;

    while (projectedRevenue < totalExpenses && months < 36) {
      projectedRevenue *= (1 + growthRate);
      months++;
    }

    breakEvenMonths = months < 36 ? months + " months" : "Not within 3 years";
  }

  document.getElementById("burn").textContent = "$" + burn.toFixed(0);
  document.getElementById("runway").textContent =
    burn > 0 ? runway + " months" : "No burn (Profitable)";
  document.getElementById("breakeven").textContent = breakEvenMonths;

  drawProjection(revenue, totalExpenses);
}

function drawProjection(revenue, expenses) {

  const canvas = document.getElementById("projectionChart");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const months = 12;
  const growthRate = 0.1;
  let projectedRevenue = revenue;

  ctx.lineWidth = 3;

  // Revenue line
  ctx.beginPath();
  ctx.strokeStyle = "#22c55e";

  for (let i = 0; i < months; i++) {
    const x = (canvas.width / months) * i;
    const y = canvas.height - (projectedRevenue / (expenses * 2)) * canvas.height;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
    projectedRevenue *= (1 + growthRate);
  }

  ctx.stroke();

  // Expense line
  ctx.beginPath();
  ctx.strokeStyle = "#ef4444";

  for (let i = 0; i < months; i++) {
    const x = (canvas.width / months) * i;
    const y = canvas.height - (expenses / (expenses * 2)) * canvas.height;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.stroke();
}
