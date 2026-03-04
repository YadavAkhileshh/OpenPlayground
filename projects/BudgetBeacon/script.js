const STORE_KEY = "budgetbeacon-state";
const state = loadState();

const budgetForm = document.getElementById("budgetForm");
const expenseForm = document.getElementById("expenseForm");
const clearAllBtn = document.getElementById("clearAllBtn");
const expenseList = document.getElementById("expenseList");

const budgetDisplay = document.getElementById("monthlyBudgetDisplay");
const spentDisplay = document.getElementById("spentDisplay");
const projectionDisplay = document.getElementById("projectionDisplay");
const riskDisplay = document.getElementById("riskDisplay");

const categoryCanvas = document.getElementById("categoryChart");
const dailyCanvas = document.getElementById("dailyChart");

document.getElementById("expenseDate").valueAsDate = new Date();

budgetForm.addEventListener("submit", onBudgetSave);
expenseForm.addEventListener("submit", onExpenseAdd);
clearAllBtn.addEventListener("click", onClearAll);
expenseList.addEventListener("click", onExpenseDelete);

render();

function onBudgetSave(e) {
  e.preventDefault();
  const amount = Number(document.getElementById("monthlyBudgetInput").value);
  if (!Number.isFinite(amount) || amount <= 0) return;
  state.monthlyBudget = amount;
  budgetForm.reset();
  persistAndRender();
}

function onExpenseAdd(e) {
  e.preventDefault();
  const title = document.getElementById("expenseTitle").value.trim();
  const category = document.getElementById("expenseCategory").value;
  const amount = Number(document.getElementById("expenseAmount").value);
  const date = document.getElementById("expenseDate").value;

  if (!title || !category || !Number.isFinite(amount) || amount <= 0 || !date) return;

  state.expenses.push({
    id: crypto.randomUUID(),
    title,
    category,
    amount,
    date,
    createdAt: new Date().toISOString()
  });

  expenseForm.reset();
  document.getElementById("expenseDate").valueAsDate = new Date();
  persistAndRender();
}

function onClearAll() {
  if (!state.expenses.length) return;
  const ok = confirm("Delete all expenses?");
  if (!ok) return;
  state.expenses = [];
  persistAndRender();
}

function onExpenseDelete(e) {
  const id = e.target.dataset.id;
  if (!id) return;
  state.expenses = state.expenses.filter((x) => x.id !== id);
  persistAndRender();
}

function persistAndRender() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
  render();
}

function render() {
  const monthData = getCurrentMonthData(state.expenses);
  const totalSpent = monthData.total;
  const projection = projectMonthEndSpend(monthData.byDate, totalSpent);
  const risk = getRiskLevel(state.monthlyBudget, projection);

  budgetDisplay.textContent = formatCurrency(state.monthlyBudget);
  spentDisplay.textContent = formatCurrency(totalSpent);
  projectionDisplay.textContent = formatCurrency(projection);
  riskDisplay.textContent = risk.label;
  riskDisplay.style.color = risk.color;

  renderExpenseList(monthData.expenses);
  drawCategoryChart(monthData.byCategory);
  drawDailyTrend(monthData.byDate);
}

function renderExpenseList(monthExpenses) {
  if (!monthExpenses.length) {
    expenseList.innerHTML = '<p class="empty">No expenses logged for this month.</p>';
    return;
  }

  const sorted = monthExpenses.slice().sort((a, b) => b.date.localeCompare(a.date));
  expenseList.innerHTML = sorted
    .map((item) => `
      <div class="item">
        <div class="item-head">
          <div>
            <strong>${escapeHtml(item.title)} <span class="tag">${escapeHtml(item.category)}</span></strong>
            <p class="meta">${item.date} | ${formatCurrency(item.amount)}</p>
          </div>
          <button class="delete" data-id="${item.id}" aria-label="Delete expense">Delete</button>
        </div>
      </div>
    `)
    .join("");
}

function getCurrentMonthData(expenses) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const monthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const byCategory = {};
  const byDateMap = {};
  let total = 0;

  monthExpenses.forEach((e) => {
    total += e.amount;
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    byDateMap[e.date] = (byDateMap[e.date] || 0) + e.amount;
  });

  const byDate = Object.entries(byDateMap).sort(([a], [b]) => a.localeCompare(b));

  return {
    expenses: monthExpenses,
    byCategory,
    byDate,
    total
  };
}

function projectMonthEndSpend(byDate, totalSpent) {
  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  if (totalSpent <= 0 || byDate.length === 0) return 0;

  const averagePerDay = totalSpent / dayOfMonth;
  return averagePerDay * daysInMonth;
}

function getRiskLevel(monthlyBudget, projected) {
  if (!monthlyBudget || monthlyBudget <= 0) {
    return { label: "Set Budget", color: "#58647a" };
  }

  const ratio = projected / monthlyBudget;

  if (ratio < 0.8) return { label: "Low", color: "#0f9d84" };
  if (ratio <= 1) return { label: "Moderate", color: "#e35d2f" };
  return { label: "High", color: "#ca2d2d" };
}

function drawCategoryChart(byCategory) {
  const ctx = categoryCanvas.getContext("2d");
  const labels = Object.keys(byCategory);
  const values = labels.map((k) => byCategory[k]);
  const palette = ["#2a60ff", "#0f9d84", "#ff8f3d", "#7c55ff", "#18a7d1", "#e35d2f"];

  clearCanvas(ctx);

  if (!labels.length) {
    drawEmpty(ctx, "Add expenses to view category split");
    return;
  }

  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const centerX = width * 0.3;
  const centerY = height * 0.5;
  const radius = Math.min(width, height) * 0.28;
  const total = values.reduce((sum, x) => sum + x, 0);

  let start = -Math.PI / 2;
  labels.forEach((label, i) => {
    const slice = (values[i] / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, start, start + slice);
    ctx.closePath();
    ctx.fillStyle = palette[i % palette.length];
    ctx.fill();
    start += slice;
  });

  ctx.fillStyle = "#26344d";
  ctx.font = "12px Sora";
  labels.forEach((label, i) => {
    const y = 26 + i * 20;
    const color = palette[i % palette.length];
    ctx.fillStyle = color;
    ctx.fillRect(width * 0.57, y - 8, 10, 10);
    ctx.fillStyle = "#26344d";
    const text = `${label}: ${formatCurrency(values[i])}`;
    ctx.fillText(text, width * 0.57 + 16, y);
  });
}

function drawDailyTrend(byDate) {
  const ctx = dailyCanvas.getContext("2d");
  clearCanvas(ctx);

  if (!byDate.length) {
    drawEmpty(ctx, "Add expenses to view daily trend");
    return;
  }

  const labels = byDate.map(([date]) => date.slice(8));
  const values = byDate.map(([, amount]) => amount);

  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const pad = { top: 22, right: 20, bottom: 36, left: 42 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const maxValue = Math.max(...values, 1);

  ctx.strokeStyle = "#d8e2f2";
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top + chartH);
  ctx.lineTo(pad.left + chartW, pad.top + chartH);
  ctx.lineTo(pad.left + chartW, pad.top);
  ctx.stroke();

  ctx.strokeStyle = "#2a60ff";
  ctx.lineWidth = 2;
  ctx.beginPath();

  values.forEach((v, i) => {
    const x = pad.left + (i / Math.max(values.length - 1, 1)) * chartW;
    const y = pad.top + chartH - (v / maxValue) * (chartH - 8);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();

  values.forEach((v, i) => {
    const x = pad.left + (i / Math.max(values.length - 1, 1)) * chartW;
    const y = pad.top + chartH - (v / maxValue) * (chartH - 8);
    ctx.fillStyle = "#0f9d84";
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();

    if (i % Math.ceil(values.length / 8) === 0 || i === values.length - 1) {
      ctx.fillStyle = "#4d5f7f";
      ctx.font = "11px Sora";
      ctx.fillText(labels[i], x - 4, pad.top + chartH + 14);
    }
  });
}

function clearCanvas(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function drawEmpty(ctx, text) {
  ctx.fillStyle = "#6c7891";
  ctx.font = "14px Sora";
  ctx.fillText(text, ctx.canvas.width / 2 - 120, ctx.canvas.height / 2);
}

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORE_KEY));
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.expenses)) {
      return {
        monthlyBudget: Number(parsed.monthlyBudget) || 0,
        expenses: parsed.expenses
          .filter((x) => x && typeof x === "object")
          .map((x) => ({
            id: String(x.id || crypto.randomUUID()),
            title: String(x.title || "Untitled"),
            category: String(x.category || "Other"),
            amount: Number(x.amount) || 0,
            date: String(x.date || new Date().toISOString().slice(0, 10)),
            createdAt: String(x.createdAt || new Date().toISOString())
          }))
          .filter((x) => x.amount > 0)
      };
    }
  } catch (_err) {
    // fall through to default state
  }

  return {
    monthlyBudget: 0,
    expenses: []
  };
}

function formatCurrency(value) {
  const amount = Number(value) || 0;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(amount);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
