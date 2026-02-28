const STORAGE_KEY = 'budgetbuddy_ai_v1';

const state = {
  budget: 20000,
  expenses: [],
};

const el = {
  expenseForm: document.getElementById('expense-form'),
  budgetForm: document.getElementById('budget-form'),
  amount: document.getElementById('amount'),
  category: document.getElementById('category'),
  date: document.getElementById('date'),
  note: document.getElementById('note'),
  monthlyBudget: document.getElementById('monthly-budget'),
  exportBtn: document.getElementById('export-btn'),
  clearBtn: document.getElementById('clear-btn'),
  insights: document.getElementById('insights'),
  chart: document.getElementById('chart'),
  tips: document.getElementById('tips'),
  history: document.getElementById('history'),
  toast: document.getElementById('toast'),
};

function uid() {
  return '_' + Math.random().toString(36).slice(2, 10);
}

function nowMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function showToast(message) {
  el.toast.textContent = message;
  el.toast.style.display = 'block';
  setTimeout(() => {
    el.toast.style.display = 'none';
  }, 1800);
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    seed();
    return;
  }
  const parsed = JSON.parse(raw);
  state.budget = parsed.budget || 20000;
  state.expenses = parsed.expenses || [];
}

function seed() {
  const today = todayISO();
  state.expenses = [
    { id: uid(), amount: 320, category: 'Food', date: today, note: 'Lunch' },
    { id: uid(), amount: 150, category: 'Transport', date: today, note: 'Metro' },
    { id: uid(), amount: 1200, category: 'Bills', date: today, note: 'Internet' },
    { id: uid(), amount: 620, category: 'Shopping', date: today, note: 'Essentials' },
  ];
  save();
}

function monthlyExpenses() {
  const m = nowMonth();
  return state.expenses.filter((e) => e.date.slice(0, 7) === m);
}

function totalSpend(expenses) {
  return expenses.reduce((sum, e) => sum + Number(e.amount), 0);
}

function categoryTotals(expenses) {
  const totals = {};
  expenses.forEach((e) => {
    totals[e.category] = (totals[e.category] || 0) + Number(e.amount);
  });
  return totals;
}

function spendingPace(monthlyTotal) {
  const d = new Date();
  const day = d.getDate();
  const days = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return Math.round((monthlyTotal / day) * days);
}

function renderInsights() {
  const expenses = monthlyExpenses();
  const spent = totalSpend(expenses);
  const remaining = Math.max(state.budget - spent, 0);
  const pct = state.budget ? Math.min(100, Math.round((spent / state.budget) * 100)) : 0;
  const forecast = spendingPace(spent);

  el.insights.innerHTML = `
    <div class="kpi ${pct > 85 ? 'bad' : ''}"><strong>Spent</strong><div class="meta">Rs ${spent.toFixed(2)}</div></div>
    <div class="kpi"><strong>Budget</strong><div class="meta">Rs ${state.budget.toFixed(2)}</div></div>
    <div class="kpi"><strong>Remaining</strong><div class="meta">Rs ${remaining.toFixed(2)}</div></div>
    <div class="kpi ${forecast > state.budget ? 'bad' : ''}"><strong>Forecast</strong><div class="meta">Rs ${forecast.toFixed(2)}</div></div>
    <div class="kpi ${pct > 85 ? 'bad' : ''}"><strong>Usage</strong><div class="meta">${pct}% of budget</div></div>
  `;
}

function renderChart() {
  const totals = categoryTotals(monthlyExpenses());
  const entries = Object.entries(totals);

  if (!entries.length) {
    el.chart.innerHTML = '<div class="row-item">No expenses for this month.</div>';
    return;
  }

  const max = Math.max(...entries.map(([, value]) => value), 1);
  el.chart.innerHTML = entries
    .sort((a, b) => b[1] - a[1])
    .map(([cat, value]) => {
      const width = Math.max(10, Math.round((value / max) * 100));
      return `<div class="bar" style="width:${width}%">${cat}: Rs ${value.toFixed(2)}</div>`;
    })
    .join('');
}

function renderTips() {
  const expenses = monthlyExpenses();
  const spent = totalSpend(expenses);
  const totals = categoryTotals(expenses);
  const tips = [];

  if (spent === 0) {
    tips.push('Start logging expenses to unlock smart insights.');
  }

  const maxCat = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
  if (maxCat) {
    tips.push(`Top spend category is ${maxCat[0]} (Rs ${maxCat[1].toFixed(2)}). Set a cap for it.`);
  }

  if (spent > state.budget * 0.85 && spent <= state.budget) {
    tips.push('You are close to your monthly budget. Reduce non-essential spending this week.');
  }

  if (spent > state.budget) {
    tips.push('Budget exceeded. Pause discretionary expenses and prioritize bills + essentials.');
  }

  const food = totals.Food || 0;
  if (food > state.budget * 0.25) {
    tips.push('Food spending is high. Try meal prep to control daily costs.');
  }

  if (!tips.length) {
    tips.push('Your spending is on track. Keep maintaining this pace.');
  }

  el.tips.innerHTML = tips.map((tip) => `<div class="tip">${tip}</div>`).join('');
}

function renderHistory() {
  if (!state.expenses.length) {
    el.history.innerHTML = '<div class="row-item">No expenses added yet.</div>';
    return;
  }

  el.history.innerHTML = state.expenses
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 25)
    .map((e) => {
      const note = e.note ? ` • ${e.note}` : '';
      return `<div class="row-item"><strong>${e.category}</strong> - Rs ${Number(e.amount).toFixed(2)}<div class="meta">${e.date}${note}</div></div>`;
    })
    .join('');
}

function renderAll() {
  el.monthlyBudget.value = state.budget;
  renderInsights();
  renderChart();
  renderTips();
  renderHistory();
}

function addExpense(event) {
  event.preventDefault();
  state.expenses.push({
    id: uid(),
    amount: Number(el.amount.value),
    category: el.category.value,
    date: el.date.value,
    note: el.note.value.trim(),
  });
  save();
  renderAll();
  el.expenseForm.reset();
  el.date.value = todayISO();
  showToast('Expense added.');
}

function saveBudget(event) {
  event.preventDefault();
  state.budget = Number(el.monthlyBudget.value);
  save();
  renderAll();
  showToast('Budget saved.');
}

function exportJson() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'budgetbuddy-ai-data.json';
  a.click();
  URL.revokeObjectURL(url);
}

function clearAll() {
  if (!confirm('Delete all BudgetBuddy AI data from this browser?')) return;
  localStorage.removeItem(STORAGE_KEY);
  state.budget = 20000;
  state.expenses = [];
  seed();
  renderAll();
  showToast('Data reset complete.');
}

function bind() {
  el.expenseForm.addEventListener('submit', addExpense);
  el.budgetForm.addEventListener('submit', saveBudget);
  el.exportBtn.addEventListener('click', exportJson);
  el.clearBtn.addEventListener('click', clearAll);
}

function init() {
  load();
  el.date.value = todayISO();
  bind();
  renderAll();
}

init();
