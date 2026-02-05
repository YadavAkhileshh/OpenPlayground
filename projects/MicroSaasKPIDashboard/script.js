const mrrEl = document.getElementById("mrr");
const arrEl = document.getElementById("arr");
const usersEl = document.getElementById("users");
const churnEl = document.getElementById("churn");
const cacEl = document.getElementById("cac");
const ltvEl = document.getElementById("ltv");

const ctx = document.getElementById("revenueChart").getContext("2d");

let revenueHistory = [];
let users = 120;
let mrr = 10000;
let churnRate = 5;
let cac = 120;

function simulateGrowth() {

  const growthRate = Math.random() * 8 + 2; // 2–10%
  users = Math.floor(users * (1 + growthRate/100));
  mrr = Math.floor(mrr * (1 + growthRate/100));

  churnRate = (Math.random() * 5).toFixed(2);
  cac = Math.floor(Math.random() * 150 + 50);

  const arr = mrr * 12;
  const ltv = ((mrr / users) * (100 / churnRate)).toFixed(0);

  revenueHistory.push(mrr);
  if (revenueHistory.length > 12) revenueHistory.shift();

  updateUI(mrr, arr, users, churnRate, cac, ltv);
  drawChart();
}

function updateUI(mrr, arr, users, churn, cac, ltv) {
  mrrEl.textContent = "$" + mrr.toLocaleString();
  arrEl.textContent = "$" + arr.toLocaleString();
  usersEl.textContent = users;
  churnEl.textContent = churn + "%";
  cacEl.textContent = "$" + cac;
  ltvEl.textContent = "$" + ltv;
}

function drawChart() {

  const canvas = ctx.canvas;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 3;

  revenueHistory.forEach((value, index) => {
    const x = (canvas.width / 12) * index;
    const y = canvas.height - (value / Math.max(...revenueHistory)) * canvas.height;

    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
}
