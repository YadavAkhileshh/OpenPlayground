/* =====================
   DATA & CONFIGURATION
   ===================== */

const EXPENSE_CATEGORIES = [
    'Groceries', 'Dining', 'Transportation', 'Housing', 'Utilities',
    'Healthcare', 'Entertainment', 'Shopping', 'Education', 'Other'
];

const INCOME_CATEGORIES = [
    'Salary', 'Freelance', 'Business', 'Investments', 'Rental', 'Other'
];

let state = {
    transactions: [],
    budgets: [],
    goals: [],
    investments: [],
    currentView: 'overview',
    currentPeriod: 'month',
    charts: {}
};

/* =====================
   INITIALIZATION
   ===================== */

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initializeEventListeners();
    populateCategorySelects();
    renderView('overview');
    updateAllCharts();
});

function loadData() {
    const saved = localStorage.getItem('financeData');
    if (saved) {
        const data = JSON.parse(saved);
        state.transactions = data.transactions || [];
        state.budgets = data.budgets || [];
        state.goals = data.goals || [];
        state.investments = data.investments || [];
    } else {
        // Load demo data for first time users
        loadDemoData();
    }
}

function saveData() {
    localStorage.setItem('financeData', JSON.stringify({
        transactions: state.transactions,
        budgets: state.budgets,
        goals: state.goals,
        investments: state.investments
    }));
}

function loadDemoData() {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    // Demo transactions
    state.transactions = [
        { id: Date.now() + 1, type: 'income', amount: 5000, category: 'Salary', description: 'Monthly Salary', date: new Date(thisYear, thisMonth, 1).toISOString() },
        { id: Date.now() + 2, type: 'expense', amount: 1200, category: 'Housing', description: 'Rent Payment', date: new Date(thisYear, thisMonth, 2).toISOString() },
        { id: Date.now() + 3, type: 'expense', amount: 150, category: 'Groceries', description: 'Supermarket', date: new Date(thisYear, thisMonth, 5).toISOString() },
        { id: Date.now() + 4, type: 'expense', amount: 80, category: 'Utilities', description: 'Electricity Bill', date: new Date(thisYear, thisMonth, 10).toISOString() },
        { id: Date.now() + 5, type: 'expense', amount: 200, category: 'Dining', description: 'Restaurants', date: new Date(thisYear, thisMonth, 12).toISOString() },
        { id: Date.now() + 6, type: 'income', amount: 500, category: 'Freelance', description: 'Consulting Work', date: new Date(thisYear, thisMonth, 15).toISOString() }
    ];

    // Demo budgets
    state.budgets = [
        { category: 'Groceries', amount: 500 },
        { category: 'Dining', amount: 300 },
        { category: 'Transportation', amount: 200 },
        { category: 'Entertainment', amount: 150 }
    ];

    // Demo goals
    state.goals = [
        { id: Date.now() + 1, name: 'Emergency Fund', target: 10000, current: 3500, deadline: new Date(thisYear + 1, 0, 1).toISOString() },
        { id: Date.now() + 2, name: 'Vacation', target: 3000, current: 1200, deadline: new Date(thisYear, 8, 1).toISOString() }
    ];

    // Demo investments
    state.investments = [
        { id: Date.now() + 1, name: 'S&P 500 ETF', type: 'stocks', amount: 5000, value: 5500 },
        { id: Date.now() + 2, name: 'Tech Stocks', type: 'stocks', amount: 3000, value: 3200 }
    ];

    saveData();
}

/* =====================
   EVENT LISTENERS
   ===================== */

function initializeEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            renderView(view);
        });
    });

    // Period selector
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentPeriod = btn.dataset.period;
            updateDashboard();
        });
    });

    // Modals
    document.getElementById('addTransactionBtn').addEventListener('click', () => openModal('transactionModal'));
    document.getElementById('addBudgetBtn').addEventListener('click', () => openModal('budgetModal'));
    document.getElementById('addGoalBtn').addEventListener('click', () => openModal('goalModal'));
    document.getElementById('addInvestmentBtn').addEventListener('click', () => openModal('investmentModal'));

    document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
        el.addEventListener('click', closeModals);
    });

    // Forms
    document.getElementById('transactionForm').addEventListener('submit', handleTransactionSubmit);
    document.getElementById('budgetForm').addEventListener('submit', handleBudgetSubmit);
    document.getElementById('goalForm').addEventListener('submit', handleGoalSubmit);
    document.getElementById('investmentForm').addEventListener('submit', handleInvestmentSubmit);

    // Type toggle
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('transactionType').value = this.dataset.type;
            updateCategorySelect();
        });
    });

    // Export
    document.getElementById('exportBtn').addEventListener('click', exportData);

    // Clear data
    document.getElementById('clearDataBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            localStorage.clear();
            location.reload();
        }
    });

    // View all transactions
    document.getElementById('viewAllTransactions')?.addEventListener('click', () => {
        renderView('transactions');
    });

    // Transaction filters
    document.getElementById('typeFilter')?.addEventListener('change', renderTransactions);
    document.getElementById('categoryFilter')?.addEventListener('change', renderTransactions);
    document.getElementById('searchTransactions')?.addEventListener('input', renderTransactions);

    // Set today's date as default
    document.getElementById('date').valueAsDate = new Date();
}

/* =====================
   VIEW MANAGEMENT
   ===================== */

function renderView(viewName) {
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.view === viewName);
    });

    // Update views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.toggle('active', view.id === viewName);
    });

    state.currentView = viewName;

    // Render specific view content
    switch(viewName) {
        case 'overview':
            updateDashboard();
            break;
        case 'transactions':
            renderTransactions();
            break;
        case 'budget':
            renderBudgets();
            break;
        case 'savings':
            renderGoals();
            break;
        case 'investments':
            renderInvestments();
            break;
        case 'analytics':
            renderAnalytics();
            break;
    }
}

/* =====================
   DASHBOARD (OVERVIEW)
   ===================== */

function updateDashboard() {
    const filtered = filterTransactionsByPeriod(state.transactions, state.currentPeriod);
    
    const income = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;
    const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : 0;

    document.getElementById('totalIncome').textContent = formatCurrency(income);
    document.getElementById('totalExpenses').textContent = formatCurrency(expenses);
    document.getElementById('netBalance').textContent = formatCurrency(balance);
    document.getElementById('savingsRate').textContent = savingsRate + '%';

    // Update change indicators (simplified - just show positive/negative)
    document.getElementById('balanceChange').textContent = balance >= 0 ? '+' + savingsRate + '%' : savingsRate + '%';
    document.getElementById('balanceChange').className = 'card-change ' + (balance >= 0 ? 'positive' : 'negative');

    updateAllCharts();
    renderRecentTransactions();
}

function renderRecentTransactions() {
    const container = document.getElementById('recentTransactionsList');
    const recent = state.transactions.slice(-5).reverse();

    if (recent.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="ri-file-list-line"></i><p>No transactions yet</p></div>';
        return;
    }

    container.innerHTML = recent.map(t => createTransactionHTML(t)).join('');
}

/* =====================
   TRANSACTIONS
   ===================== */

function renderTransactions() {
    const container = document.getElementById('transactionsList');
    let filtered = [...state.transactions];

    // Apply filters
    const typeFilter = document.getElementById('typeFilter')?.value;
    const categoryFilter = document.getElementById('categoryFilter')?.value;
    const searchTerm = document.getElementById('searchTransactions')?.value.toLowerCase();

    if (typeFilter && typeFilter !== 'all') {
        filtered = filtered.filter(t => t.type === typeFilter);
    }

    if (categoryFilter && categoryFilter !== 'all') {
        filtered = filtered.filter(t => t.category === categoryFilter);
    }

    if (searchTerm) {
        filtered = filtered.filter(t => 
            t.description.toLowerCase().includes(searchTerm) ||
            t.category.toLowerCase().includes(searchTerm)
        );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="ri-file-list-line"></i><p>No transactions found</p></div>';
        return;
    }

    container.innerHTML = filtered.map(t => createTransactionHTML(t, true)).join('');

    // Add delete handlers
    container.querySelectorAll('.transaction-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            deleteTransaction(id);
        });
    });
}

function createTransactionHTML(transaction, showDelete = false) {
    const date = new Date(transaction.date);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-icon ${transaction.type}">
                    <i class="ri-arrow-${transaction.type === 'income' ? 'down' : 'up'}-line"></i>
                </div>
                <div class="transaction-details">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-meta">${transaction.category} • ${dateStr}</div>
                </div>
            </div>
            <div class="transaction-amount">
                <div class="transaction-value ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
                </div>
                ${showDelete ? `<button class="transaction-delete" data-id="${transaction.id}"><i class="ri-delete-bin-line"></i></button>` : ''}
            </div>
        </div>
    `;
}

function handleTransactionSubmit(e) {
    e.preventDefault();

    const transaction = {
        id: Date.now(),
        type: document.getElementById('transactionType').value,
        amount: parseFloat(document.getElementById('amount').value),
        category: document.getElementById('category').value,
        description: document.getElementById('description').value,
        date: new Date(document.getElementById('date').value).toISOString()
    };

    state.transactions.push(transaction);
    saveData();
    closeModals();
    e.target.reset();
    document.getElementById('date').valueAsDate = new Date();
    
    if (state.currentView === 'overview') {
        updateDashboard();
    } else if (state.currentView === 'transactions') {
        renderTransactions();
    }
}

function deleteTransaction(id) {
    if (confirm('Delete this transaction?')) {
        state.transactions = state.transactions.filter(t => t.id !== id);
        saveData();
        renderTransactions();
        if (state.currentView === 'overview') updateDashboard();
    }
}

/* =====================
   BUDGETS
   ===================== */

function renderBudgets() {
    const container = document.getElementById('budgetGrid');

    if (state.budgets.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="ri-wallet-line"></i><p>No budgets set. Click "Add Budget" to create one.</p></div>';
        return;
    }

    container.innerHTML = state.budgets.map(budget => {
        const spent = getSpentByCategory(budget.category);
        const percentage = (spent / budget.amount * 100).toFixed(1);
        const percentageClass = percentage > 100 ? 'danger' : percentage > 80 ? 'warning' : '';

        return `
            <div class="budget-card">
                <div class="budget-header">
                    <div class="budget-category">${budget.category}</div>
                    <button class="budget-delete" onclick="deleteBudget('${budget.category}')">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
                <div class="budget-amounts">
                    <span class="budget-spent">${formatCurrency(spent)} spent</span>
                    <span class="budget-total">of ${formatCurrency(budget.amount)}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${percentageClass}" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
                <div class="budget-percentage">${percentage}% used</div>
            </div>
        `;
    }).join('');
}

function handleBudgetSubmit(e) {
    e.preventDefault();

    const budget = {
        category: document.getElementById('budgetCategory').value,
        amount: parseFloat(document.getElementById('budgetAmount').value)
    };

    // Check if budget already exists for category
    const existing = state.budgets.findIndex(b => b.category === budget.category);
    if (existing >= 0) {
        state.budgets[existing] = budget;
    } else {
        state.budgets.push(budget);
    }

    saveData();
    closeModals();
    e.target.reset();
    renderBudgets();
}

function deleteBudget(category) {
    if (confirm('Delete this budget?')) {
        state.budgets = state.budgets.filter(b => b.category !== category);
        saveData();
        renderBudgets();
    }
}

window.deleteBudget = deleteBudget;

function getSpentByCategory(category) {
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    
    return state.transactions
        .filter(t => {
            const d = new Date(t.date);
            return t.type === 'expense' && 
                   t.category === category && 
                   d.getMonth() === thisMonth && 
                   d.getFullYear() === thisYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);
}

/* =====================
   SAVINGS GOALS
   ===================== */

function renderGoals() {
    const container = document.getElementById('goalsGrid');

    if (state.goals.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="ri-safe-line"></i><p>No savings goals yet. Click "Add Goal" to create one.</p></div>';
        return;
    }

    container.innerHTML = state.goals.map(goal => {
        const percentage = (goal.current / goal.target * 100).toFixed(1);
        const deadline = new Date(goal.deadline);
        const deadlineStr = deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        return `
            <div class="goal-card">
                <div class="goal-header">
                    <div class="goal-info">
                        <h3>${goal.name}</h3>
                        <div class="goal-deadline">Target: ${deadlineStr}</div>
                    </div>
                    <div class="goal-actions">
                        <button class="goal-action-btn" onclick="updateGoal(${goal.id})">
                            <i class="ri-add-circle-line"></i>
                        </button>
                        <button class="goal-action-btn delete" onclick="deleteGoal(${goal.id})">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                </div>
                <div class="goal-progress">
                    <div class="goal-amounts">
                        <span class="goal-current">${formatCurrency(goal.current)}</span>
                        <span class="goal-target">/ ${formatCurrency(goal.target)}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(percentage, 100)}%"></div>
                    </div>
                    <div class="goal-percentage">${percentage}% Complete</div>
                </div>
            </div>
        `;
    }).join('');
}

function handleGoalSubmit(e) {
    e.preventDefault();

    const goal = {
        id: Date.now(),
        name: document.getElementById('goalName').value,
        target: parseFloat(document.getElementById('goalTarget').value),
        current: parseFloat(document.getElementById('goalCurrent').value),
        deadline: new Date(document.getElementById('goalDeadline').value).toISOString()
    };

    state.goals.push(goal);
    saveData();
    closeModals();
    e.target.reset();
    renderGoals();
}

function updateGoal(id) {
    const goal = state.goals.find(g => g.id === id);
    if (!goal) return;

    const amount = prompt('Add amount to goal:', '0');
    if (amount !== null && !isNaN(amount)) {
        goal.current += parseFloat(amount);
        saveData();
        renderGoals();
    }
}

function deleteGoal(id) {
    if (confirm('Delete this goal?')) {
        state.goals = state.goals.filter(g => g.id !== id);
        saveData();
        renderGoals();
    }
}

window.updateGoal = updateGoal;
window.deleteGoal = deleteGoal;

/* =====================
   INVESTMENTS
   ===================== */

function renderInvestments() {
    const container = document.getElementById('investmentsList');
    
    // Calculate portfolio stats
    const totalInvested = state.investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalValue = state.investments.reduce((sum, inv) => sum + inv.value, 0);
    const gainLoss = totalValue - totalInvested;
    const roi = totalInvested > 0 ? ((gainLoss / totalInvested) * 100).toFixed(2) : 0;

    document.getElementById('portfolioValue').textContent = formatCurrency(totalValue);
    document.getElementById('portfolioGainLoss').textContent = (gainLoss >= 0 ? '+' : '') + formatCurrency(gainLoss);
    document.getElementById('portfolioGainLoss').className = 'card-value ' + (gainLoss >= 0 ? 'positive' : 'negative');
    document.getElementById('portfolioROI').textContent = (roi >= 0 ? '+' : '') + roi + '%';
    document.getElementById('portfolioROI').className = 'card-value ' + (roi >= 0 ? 'positive' : 'negative');

    if (state.investments.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="ri-stock-line"></i><p>No investments tracked. Click "Add Investment" to start.</p></div>';
        return;
    }

    container.innerHTML = state.investments.map(inv => {
        const gain = inv.value - inv.amount;
        const gainPercentage = ((gain / inv.amount) * 100).toFixed(2);

        return `
            <div class="investment-item">
                <div class="investment-details">
                    <h4>${inv.name}</h4>
                    <div class="investment-type">${inv.type}</div>
                </div>
                <div class="investment-stats">
                    <div class="investment-stat">
                        <span class="stat-label">Invested</span>
                        <span class="stat-value">${formatCurrency(inv.amount)}</span>
                    </div>
                    <div class="investment-stat">
                        <span class="stat-label">Current Value</span>
                        <span class="stat-value">${formatCurrency(inv.value)}</span>
                    </div>
                    <div class="investment-stat">
                        <span class="stat-label">Gain/Loss</span>
                        <span class="stat-value ${gain >= 0 ? 'positive' : 'negative'}">
                            ${gain >= 0 ? '+' : ''}${formatCurrency(gain)} (${gainPercentage}%)
                        </span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function handleInvestmentSubmit(e) {
    e.preventDefault();

    const investment = {
        id: Date.now(),
        name: document.getElementById('investmentName').value,
        type: document.getElementById('investmentType').value,
        amount: parseFloat(document.getElementById('investmentAmount').value),
        value: parseFloat(document.getElementById('investmentValue').value)
    };

    state.investments.push(investment);
    saveData();
    closeModals();
    e.target.reset();
    renderInvestments();
}

/* =====================
   ANALYTICS
   ===================== */

function renderAnalytics() {
    updateMonthlyComparisonChart();
    updateCategoryDistributionChart();
    generateInsights();
}

function generateInsights() {
    const container = document.getElementById('insightsList');
    const insights = [];

    // Calculate metrics
    const thisMonth = filterTransactionsByPeriod(state.transactions, 'month');
    const income = thisMonth.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = thisMonth.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    // Generate insights
    if (income > 0) {
        const savingsRate = ((income - expenses) / income * 100).toFixed(1);
        if (savingsRate >= 20) {
            insights.push({
                type: 'success',
                text: `Excellent! You're saving ${savingsRate}% of your income this month.`
            });
        } else if (savingsRate < 10) {
            insights.push({
                type: 'warning',
                text: `Your savings rate is ${savingsRate}%. Try to increase it to at least 20%.`
            });
        }
    }

    // Check budgets
    state.budgets.forEach(budget => {
        const spent = getSpentByCategory(budget.category);
        const percentage = (spent / budget.amount * 100).toFixed(0);
        if (percentage > 100) {
            insights.push({
                type: 'warning',
                text: `You've exceeded your ${budget.category} budget by ${percentage - 100}%.`
            });
        }
    });

    // Top spending category
    const categoryTotals = {};
    thisMonth.filter(t => t.type === 'expense').forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
        insights.push({
            type: '',
            text: `Your highest spending category this month is ${topCategory[0]} at ${formatCurrency(topCategory[1])}.`
        });
    }

    if (insights.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Add more transactions to see insights</p></div>';
        return;
    }

    container.innerHTML = insights.map(insight => `
        <div class="insight-item ${insight.type}">
            ${insight.text}
        </div>
    `).join('');
}

/* =====================
   CHARTS
   ===================== */

function updateAllCharts() {
    updateIncomeExpenseChart();
    updateCategoryChart();
    updateTrendChart();
}

function updateIncomeExpenseChart() {
    const canvas = document.getElementById('incomeExpenseChart');
    if (!canvas) return;

    const filtered = filterTransactionsByPeriod(state.transactions, state.currentPeriod);
    const income = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    if (state.charts.incomeExpense) {
        state.charts.incomeExpense.destroy();
    }

    state.charts.incomeExpense = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: ['Income', 'Expenses', 'Savings'],
            datasets: [{
                data: [income, expenses, Math.max(0, income - expenses)],
                backgroundColor: ['#00d4aa', '#ff6b6b', '#667eea'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateCategoryChart() {
    const canvas = document.getElementById('categoryChart');
    if (!canvas) return;

    const filtered = filterTransactionsByPeriod(state.transactions, state.currentPeriod);
    const expenses = filtered.filter(t => t.type === 'expense');

    const categoryTotals = {};
    expenses.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).slice(0, 6);

    if (state.charts.category) {
        state.charts.category.destroy();
    }

    state.charts.category = new Chart(canvas, {
        type: 'pie',
        data: {
            labels: sorted.map(([cat]) => cat),
            datasets: [{
                data: sorted.map(([, amount]) => amount),
                backgroundColor: [
                    '#667eea', '#764ba2', '#ff6b6b', '#00d4aa', '#ffd93d', '#4facfe'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateTrendChart() {
    const canvas = document.getElementById('trendChart');
    if (!canvas) return;

    const months = [];
    const incomeData = [];
    const expenseData = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        months.push(monthName);

        const monthTransactions = state.transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
        });

        const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        incomeData.push(income);
        expenseData.push(expense);
    }

    if (state.charts.trend) {
        state.charts.trend.destroy();
    }

    state.charts.trend = new Chart(canvas, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    borderColor: '#00d4aa',
                    backgroundColor: 'rgba(0, 212, 170, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    borderColor: '#ff6b6b',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => '$' + value.toLocaleString()
                    }
                }
            }
        }
    });
}

function updateMonthlyComparisonChart() {
    const canvas = document.getElementById('monthlyComparisonChart');
    if (!canvas) return;

    const months = [];
    const data = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        months.push(monthName);

        const monthTransactions = state.transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
        });

        const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        data.push(income - expense);
    }

    if (state.charts.monthlyComparison) {
        state.charts.monthlyComparison.destroy();
    }

    state.charts.monthlyComparison = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'Net Balance',
                data: data,
                backgroundColor: data.map(v => v >= 0 ? '#00d4aa' : '#ff6b6b'),
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => '$' + value.toLocaleString()
                    }
                }
            }
        }
    });
}

function updateCategoryDistributionChart() {
    const canvas = document.getElementById('categoryDistributionChart');
    if (!canvas) return;

    const allExpenses = state.transactions.filter(t => t.type === 'expense');
    const categoryTotals = {};

    allExpenses.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

    if (state.charts.categoryDistribution) {
        state.charts.categoryDistribution.destroy();
    }

    state.charts.categoryDistribution = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: sorted.map(([cat]) => cat),
            datasets: [{
                label: 'Total Spent',
                data: sorted.map(([, amount]) => amount),
                backgroundColor: '#667eea',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => '$' + value.toLocaleString()
                    }
                }
            }
        }
    });
}

/* =====================
   UTILITY FUNCTIONS
   ===================== */

function filterTransactionsByPeriod(transactions, period) {
    const now = new Date();
    return transactions.filter(t => {
        const date = new Date(t.date);
        switch(period) {
            case 'month':
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            case 'year':
                return date.getFullYear() === now.getFullYear();
            case 'all':
            default:
                return true;
        }
    });
}

function formatCurrency(amount) {
    return '$' + Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function populateCategorySelects() {
    const categorySelect = document.getElementById('category');
    const budgetCategorySelect = document.getElementById('budgetCategory');
    const filterCategorySelect = document.getElementById('categoryFilter');

    // Transaction category
    EXPENSE_CATEGORIES.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
        budgetCategorySelect.appendChild(option.cloneNode(true));
    });

    // Filter categories
    [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        filterCategorySelect.appendChild(option);
    });
}

function updateCategorySelect() {
    const type = document.getElementById('transactionType').value;
    const categorySelect = document.getElementById('category');
    const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    categorySelect.innerHTML = '';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

function exportData() {
    const data = {
        transactions: state.transactions,
        budgets: state.budgets,
        goals: state.goals,
        investments: state.investments,
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Initialize
console.log('Personal Finance Visualizer loaded successfully!');