const elements = {
  insights: document.getElementById("insights"),
  refreshInsights: document.getElementById("refresh-insights"),
  primaryGoal: document.getElementById("primary-goal"),
  transactionForm: document.getElementById("transaction-form"),
  txName: document.getElementById("tx-name"),
  txAmount: document.getElementById("tx-amount"),
  txType: document.getElementById("tx-type"),
  txCategory: document.getElementById("tx-category"),
  txAccount: document.getElementById("tx-account"),
  txDate: document.getElementById("tx-date"),
  txRecurring: document.getElementById("tx-recurring"),
  budgetForm: document.getElementById("budget-form"),
  budgetAmount: document.getElementById("budget-amount"),
  budgetCategory: document.getElementById("budget-category"),
  budgetSpent: document.getElementById("budget-spent"),
  budgetBar: document.getElementById("budget-bar"),
  budgetAlerts: document.getElementById("budget-alerts"),
  chart: document.getElementById("income-expense-chart"),
  investmentForm: document.getElementById("investment-form"),
  assetName: document.getElementById("asset-name"),
  assetValue: document.getElementById("asset-value"),
  assetType: document.getElementById("asset-type"),
  portfolio: document.getElementById("portfolio"),
  goalForm: document.getElementById("goal-form"),
  goalName: document.getElementById("goal-name"),
  goalTarget: document.getElementById("goal-target"),
  goalSaved: document.getElementById("goal-saved"),
  goals: document.getElementById("goals"),
  billForm: document.getElementById("bill-form"),
  billName: document.getElementById("bill-name"),
  billDate: document.getElementById("bill-date"),
  billAmount: document.getElementById("bill-amount"),
  bills: document.getElementById("bills"),
  exportCsv: document.getElementById("export-csv"),
  exportPdf: document.getElementById("export-pdf"),
  downloadSummary: document.getElementById("download-summary"),
  encryption: document.getElementById("encryption"),
  passphrase: document.getElementById("passphrase"),
  lockData: document.getElementById("lock-data"),
  netBalance: document.getElementById("net-balance"),
  monthlySpend: document.getElementById("monthly-spend"),
  goalProgress: document.getElementById("goal-progress")
};

const STORAGE_KEYS = {
  data: "moneymind_data",
  settings: "moneymind_settings"
};

const defaultState = {
  transactions: [],
  budgets: { amount: 2000, category: "Overall" },
  assets: [],
  goals: [],
  bills: [],
  goalText: "",
  encrypted: false,
  lastUpdated: new Date().toISOString()
};

let state = { ...defaultState };

const insightsLibrary = [
  "Lifestyle spending is trending up. Consider a weekly cap.",
  "Your savings rate is strong. Explore a high-yield account.",
  "Recurring bills are 42% of expenses. Review subscriptions.",
  "Investments are growing steadily. Keep contributions consistent.",
  "Expense volatility is low. This is a good time to set a new goal."
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);

const parseDate = (value) => new Date(value || new Date());

const saveState = () => {
  state.lastUpdated = new Date().toISOString();
  const payload = JSON.stringify(state);
  const data = elements.encryption.checked && elements.passphrase.value
    ? btoa(payload)
    : payload;
  localStorage.setItem(STORAGE_KEYS.data, data);
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify({
    encrypted: elements.encryption.checked,
    goalText: elements.primaryGoal.value
  }));
};

const loadState = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.data);
  const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) || "{}");

  if (stored) {
    try {
      const decoded = settings.encrypted ? atob(stored) : stored;
      state = { ...defaultState, ...JSON.parse(decoded) };
    } catch {
      state = { ...defaultState };
    }
  }

  elements.primaryGoal.value = settings.goalText || state.goalText || "";
  elements.encryption.checked = Boolean(settings.encrypted);
};

const addTransaction = (transaction) => {
  state.transactions.unshift(transaction);
  saveState();
  render();
};

const addAsset = (asset) => {
  state.assets.unshift(asset);
  saveState();
  render();
};

const addGoal = (goal) => {
  state.goals.unshift(goal);
  saveState();
  render();
};

const addBill = (bill) => {
  state.bills.unshift(bill);
  saveState();
  render();
};

const updateBudget = (budget) => {
  state.budgets = budget;
  saveState();
  render();
};

const getMonthlyTransactions = () => {
  const now = new Date();
  return state.transactions.filter((tx) => {
    const date = parseDate(tx.date);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
};

const calculateTotals = () => {
  const monthly = getMonthlyTransactions();
  const income = monthly.filter((tx) => tx.type === "income").reduce((sum, tx) => sum + tx.amount, 0);
  const expenses = monthly.filter((tx) => tx.type === "expense").reduce((sum, tx) => sum + tx.amount, 0);
  const balance = state.transactions.reduce(
    (sum, tx) => sum + (tx.type === "income" ? tx.amount : -tx.amount),
    0
  );

  return { income, expenses, balance };
};

const renderInsights = () => {
  elements.insights.innerHTML = "";
  const suggestions = insightsLibrary.sort(() => 0.5 - Math.random()).slice(0, 3);
  suggestions.forEach((text) => {
    const item = document.createElement("div");
    item.className = "insight";
    item.textContent = text;
    elements.insights.appendChild(item);
  });
};

const renderBudget = () => {
  const { expenses } = calculateTotals();
  const budget = state.budgets.amount;
  const progress = Math.min((expenses / budget) * 100, 100);

  elements.budgetSpent.textContent = formatCurrency(expenses);
  elements.budgetBar.style.width = `${progress}%`;

  elements.budgetAlerts.innerHTML = "";
  if (progress >= 90) {
    elements.budgetAlerts.innerHTML = `<span class="alert">You're at ${Math.round(progress)}% of budget.</span>`;
  }
};

const renderChart = () => {
  elements.chart.innerHTML = "";
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return date;
  });

  months.forEach((date) => {
    const monthly = state.transactions.filter((tx) => {
      const txDate = parseDate(tx.date);
      return txDate.getMonth() === date.getMonth() && txDate.getFullYear() === date.getFullYear();
    });
    const income = monthly.filter((tx) => tx.type === "income").reduce((sum, tx) => sum + tx.amount, 0);
    const expenses = monthly.filter((tx) => tx.type === "expense").reduce((sum, tx) => sum + tx.amount, 0);
    const total = Math.max(income, expenses, 1);

    const bar = document.createElement("span");
    bar.style.height = `${(expenses / total) * 100}%`;
    bar.title = `Income ${formatCurrency(income)} · Expenses ${formatCurrency(expenses)}`;
    elements.chart.appendChild(bar);
  });
};

const renderPortfolio = () => {
  elements.portfolio.innerHTML = "";
  if (state.assets.length === 0) {
    elements.portfolio.innerHTML = `<p class="muted">No assets added yet.</p>`;
    return;
  }

  state.assets.forEach((asset) => {
    const item = document.createElement("div");
    item.className = "asset";
    item.innerHTML = `
      <div class="asset__row">
        <strong>${asset.name}</strong>
        <span class="tag">${asset.type}</span>
      </div>
      <div class="asset__row">
        <span class="muted">Value</span>
        <strong>${formatCurrency(asset.value)}</strong>
      </div>
    `;
    elements.portfolio.appendChild(item);
  });
};

const renderGoals = () => {
  elements.goals.innerHTML = "";
  if (state.goals.length === 0) {
    elements.goals.innerHTML = `<p class="muted">No goals defined yet.</p>`;
    return;
  }

  state.goals.forEach((goal) => {
    const progress = Math.min((goal.saved / goal.target) * 100, 100);
    const item = document.createElement("div");
    item.className = "goal";
    item.innerHTML = `
      <div class="goal__row">
        <strong>${goal.name}</strong>
        <span class="tag">${Math.round(progress)}%</span>
      </div>
      <div class="goal__row">
        <span class="muted">Saved ${formatCurrency(goal.saved)}</span>
        <span class="muted">Target ${formatCurrency(goal.target)}</span>
      </div>
      <div class="progress"><span style="width: ${progress}%"></span></div>
    `;
    elements.goals.appendChild(item);
  });

  const average =
    state.goals.reduce((sum, goal) => sum + Math.min((goal.saved / goal.target) * 100, 100), 0) /
    state.goals.length;
  elements.goalProgress.textContent = `${Math.round(average)}%`;
};

const renderBills = () => {
  elements.bills.innerHTML = "";
  if (state.bills.length === 0) {
    elements.bills.innerHTML = `<p class="muted">No bills scheduled.</p>`;
    return;
  }

  state.bills.forEach((bill) => {
    const due = parseDate(bill.date);
    const item = document.createElement("div");
    item.className = "bill";
    item.innerHTML = `
      <div class="bill__row">
        <strong>${bill.name}</strong>
        <span class="tag">${due.toLocaleDateString()}</span>
      </div>
      <div class="bill__row">
        <span class="muted">Amount</span>
        <strong>${formatCurrency(bill.amount)}</strong>
      </div>
    `;
    elements.bills.appendChild(item);
  });
};

const renderStats = () => {
  const { income, expenses, balance } = calculateTotals();
  elements.netBalance.textContent = formatCurrency(balance);
  elements.monthlySpend.textContent = formatCurrency(expenses);

  if (state.goals.length === 0) {
    elements.goalProgress.textContent = "0%";
  }

  if (income === 0 && expenses === 0) {
    renderInsights();
  }
};

const exportCsv = () => {
  if (state.transactions.length === 0) return;
  const rows = ["Name,Amount,Type,Category,Account,Date,Recurring"];
  state.transactions.forEach((tx) => {
    rows.push(
      [
        tx.name,
        tx.amount,
        tx.type,
        tx.category,
        tx.account,
        tx.date,
        tx.recurring ? "Yes" : "No"
      ].join(",")
    );
  });

  downloadFile("moneymind-transactions.csv", rows.join("\n"));
};

const exportPdf = () => {
  const summary = buildSummary();
  downloadFile("moneymind-report.txt", summary);
};

const downloadSummary = () => {
  downloadFile("moneymind-summary.txt", buildSummary());
};

const buildSummary = () => {
  const { income, expenses, balance } = calculateTotals();
  return `MoneyMind Summary\n\nNet balance: ${formatCurrency(balance)}\nMonthly income: ${formatCurrency(income)}\nMonthly expenses: ${formatCurrency(expenses)}\nBudgets: ${formatCurrency(state.budgets.amount)} focus on ${state.budgets.category}\nGoals: ${state.goals.length}\nAssets: ${state.assets.length}\nBills: ${state.bills.length}\nLast updated: ${new Date(state.lastUpdated).toLocaleString()}`;
};

const downloadFile = (filename, content) => {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const handleEncryption = () => {
  saveState();
};

const initDates = () => {
  elements.txDate.valueAsDate = new Date();
  elements.billDate.valueAsDate = new Date();
};

const init = () => {
  loadState();
  initDates();
  render();

  elements.refreshInsights.addEventListener("click", renderInsights);
  elements.primaryGoal.addEventListener("input", () => {
    state.goalText = elements.primaryGoal.value;
    saveState();
    renderInsights();
  });

  elements.transactionForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const transaction = {
      name: elements.txName.value.trim(),
      amount: Number(elements.txAmount.value),
      type: elements.txType.value,
      category: elements.txCategory.value,
      account: elements.txAccount.value,
      date: elements.txDate.value,
      recurring: elements.txRecurring.checked
    };
    if (!transaction.name) return;
    addTransaction(transaction);
    elements.transactionForm.reset();
    initDates();
  });

  elements.budgetForm.addEventListener("submit", (event) => {
    event.preventDefault();
    updateBudget({
      amount: Number(elements.budgetAmount.value),
      category: elements.budgetCategory.value
    });
  });

  elements.investmentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const asset = {
      name: elements.assetName.value.trim(),
      value: Number(elements.assetValue.value),
      type: elements.assetType.value
    };
    if (!asset.name) return;
    addAsset(asset);
    elements.investmentForm.reset();
  });

  elements.goalForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const goal = {
      name: elements.goalName.value.trim(),
      target: Number(elements.goalTarget.value),
      saved: Number(elements.goalSaved.value)
    };
    if (!goal.name) return;
    addGoal(goal);
    elements.goalForm.reset();
  });

  elements.billForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const bill = {
      name: elements.billName.value.trim(),
      date: elements.billDate.value,
      amount: Number(elements.billAmount.value)
    };
    if (!bill.name) return;
    addBill(bill);
    elements.billForm.reset();
    initDates();
  });

  elements.exportCsv.addEventListener("click", exportCsv);
  elements.exportPdf.addEventListener("click", exportPdf);
  elements.downloadSummary.addEventListener("click", downloadSummary);
  elements.lockData.addEventListener("click", handleEncryption);
};

const render = () => {
  renderInsights();
  renderBudget();
  renderChart();
  renderPortfolio();
  renderGoals();
  renderBills();
  renderStats();
};

init();
