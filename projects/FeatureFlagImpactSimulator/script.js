let interval;

let errorData = [];
let revenueData = [];

const rolloutSlider = document.getElementById("rollout");
const rolloutValue = document.getElementById("rolloutValue");
const featureToggle = document.getElementById("featureToggle");

const errorEl = document.getElementById("errorRate");
const perfEl = document.getElementById("performance");
const engageEl = document.getElementById("engagement");
const revenueEl = document.getElementById("revenue");

const ctx = document.getElementById("impactChart").getContext("2d");

rolloutSlider.oninput = () => {
  rolloutValue.textContent = rolloutSlider.value + "%";
};

function startSimulation() {
  clearInterval(interval);

  errorData = [];
  revenueData = [];

  interval = setInterval(() => {

    const rollout = parseInt(rolloutSlider.value);
    const enabled = featureToggle.checked;

    let errorRate = 2;
    let performance = 200;
    let engagement = 50;
    let revenue = 10000;

    if (enabled) {
      errorRate += rollout * 0.05;      // risk increases
      performance -= rollout * 0.5;     // performance improves
      engagement += rollout * 0.4;      // engagement improves
      revenue += rollout * 50;          // revenue grows
    }

    errorEl.textContent = errorRate.toFixed(1) + "%";
    perfEl.textContent = performance.toFixed(0);
    engageEl.textContent = engagement.toFixed(0);
    revenueEl.textContent = "$" + revenue.toFixed(0);

    pushData(errorData, errorRate);
    pushData(revenueData, revenue);

    drawChart();

  }, 1000);
}

function pushData(arr, val) {
  if (arr.length > 60) arr.shift();
  arr.push(val);
}

function drawChart() {
  ctx.clearRect(0, 0, 900, 250);
  drawLine(errorData, "#ef4444", 5);
  drawLine(revenueData.map(v => v / 200), "#22c55e", 1);
}

function drawLine(data, color, scale) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  data.forEach((val, i) => {
    const x = (900 / 60) * i;
    const y = 250 - (val / (100 * scale)) * 250;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
}

function reset() {
  clearInterval(interval);
  ctx.clearRect(0, 0, 900, 250);
  errorEl.textContent = "0%";
  perfEl.textContent = "0";
  engageEl.textContent = "0";
  revenueEl.textContent = "$0";
}
