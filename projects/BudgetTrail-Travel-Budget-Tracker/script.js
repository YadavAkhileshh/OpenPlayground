// BudgetTrail - Travel Budget Tracker Script

// Global variables
let budget = {
    total: 0,
    duration: 0,
    currency: 'USD',
    spent: 0,
    expenses: []
};

let categoryChart;

// Currency symbols
const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$'
};

// DOM elements
const budgetForm = document.getElementById('budget-form');
const expenseForm = document.getElementById('expense-form');
const expensesContainer = document.getElementById('expenses-container');
const filterCategory = document.getElementById('filter-category');
const filterDate = document.getElementById('filter-date');
const clearFiltersBtn = document.getElementById('clear-filters');
const splitExpenseCheckbox = document.getElementById('split-expense');
const splitOptions = document.getElementById('split-options');
const reportTabs = document.querySelectorAll('.tab-btn');

// Event listeners
budgetForm.addEventListener('submit', setBudget);
expenseForm.addEventListener('submit', addExpense);
filterCategory.addEventListener('change', filterExpenses);
filterDate.addEventListener('change', filterExpenses);
clearFiltersBtn.addEventListener('click', clearFilters);
splitExpenseCheckbox.addEventListener('change', toggleSplitOptions);

// Tab switching for reports
reportTabs.forEach(tab => {
    tab.addEventListener('click', () => switchReportTab(tab.dataset.tab));
});

// Initialize the app
function init() {
    loadFromLocalStorage();
    updateBudgetDisplay();
    renderExpenses();
    initCharts();
    setDefaultDate();
}

// Set budget
function setBudget(e) {
    e.preventDefault();

    const totalBudget = parseFloat(document.getElementById('total-budget').value);
    const duration = parseInt(document.getElementById('trip-duration').value);
    const currency = document.getElementById('currency').value;

    if (totalBudget <= 0 || duration <= 0) {
        alert('Please enter valid budget and duration values.');
        return;
    }

    budget.total = totalBudget;
    budget.duration = duration;
    budget.currency = currency;

    updateBudgetDisplay();
    saveToLocalStorage();

    // Reset form
    budgetForm.reset();
}

// Add expense
function addExpense(e) {
    e.preventDefault();

    const date = document.getElementById('expense-date').value;
    const category = document.getElementById('expense-category').value;
    const description = document.getElementById('expense-description').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);

    if (!date || !category || !description || amount <= 0) {
        alert('Please fill in all fields with valid values.');
        return;
    }

    let expenseAmount = amount;

    // Handle split expenses
    if (splitExpenseCheckbox.checked) {
        const numPeople = parseInt(document.getElementById('num-people').value);
        const splitMethod = document.getElementById('split-method').value;

        if (splitMethod === 'equal') {
            expenseAmount = amount / numPeople;
        } else {
            // For custom split, we'd need additional UI - for now, assume equal
            expenseAmount = amount / numPeople;
        }
    }

    const expense = {
        id: Date.now(),
        date: date,
        category: category,
        description: description,
        amount: expenseAmount,
        originalAmount: amount,
        isSplit: splitExpenseCheckbox.checked,
        numPeople: splitExpenseCheckbox.checked ? parseInt(document.getElementById('num-people').value) : 1
    };

    budget.expenses.push(expense);
    budget.spent += expenseAmount;

    updateBudgetDisplay();
    renderExpenses();
    updateCharts();
    saveToLocalStorage();

    // Reset form
    expenseForm.reset();
    setDefaultDate();
    toggleSplitOptions();
}

// Update budget display
function updateBudgetDisplay() {
    const symbol = currencySymbols[budget.currency];

    document.getElementById('total-budget-display').textContent = `${symbol}${budget.total.toFixed(2)}`;
    document.getElementById('spent-display').textContent = `${symbol}${budget.spent.toFixed(2)}`;

    const remaining = budget.total - budget.spent;
    document.getElementById('remaining-display').textContent = `${symbol}${remaining.toFixed(2)}`;

    const dailyAvg = budget.duration > 0 ? budget.spent / budget.duration : 0;
    document.getElementById('daily-avg-display').textContent = `${symbol}${dailyAvg.toFixed(2)}`;

    // Update progress bar
    const progressPercent = budget.total > 0 ? (budget.spent / budget.total) * 100 : 0;
    const progressBar = document.getElementById('budget-progress');
    progressBar.style.width = `${Math.min(progressPercent, 100)}%`;

    // Update progress bar color
    progressBar.className = 'progress-fill';
    if (progressPercent > 90) {
        progressBar.classList.add('danger');
    } else if (progressPercent > 75) {
        progressBar.classList.add('warning');
    }

    // Update status message
    const statusElement = document.getElementById('budget-status');
    if (budget.total === 0) {
        statusElement.textContent = 'Set your budget to get started';
        statusElement.className = 'budget-status';
    } else if (remaining < 0) {
        statusElement.textContent = `Over budget by ${symbol}${Math.abs(remaining).toFixed(2)}`;
        statusElement.className = 'budget-status budget-danger';
    } else if (progressPercent > 90) {
        statusElement.textContent = `Warning: ${progressPercent.toFixed(1)}% of budget used`;
        statusElement.className = 'budget-status budget-warning';
    } else {
        statusElement.textContent = `${progressPercent.toFixed(1)}% of budget used - ${symbol}${remaining.toFixed(2)} remaining`;
        statusElement.className = 'budget-status budget-good';
    }
}

// Render expenses
function renderExpenses() {
    const filteredExpenses = getFilteredExpenses();

    if (filteredExpenses.length === 0) {
        expensesContainer.innerHTML = '<p>No expenses found.</p>';
        return;
    }

    const symbol = currencySymbols[budget.currency];
    expensesContainer.innerHTML = filteredExpenses.map(expense => `
        <div class="expense-item" data-id="${expense.id}">
            <div class="expense-info">
                <h4>${expense.description}</h4>
                <div class="expense-details">
                    ${formatDate(expense.date)} • ${capitalizeFirst(expense.category)}
                    ${expense.isSplit ? ` • Split ${expense.numPeople} ways` : ''}
                </div>
            </div>
            <div class="expense-amount">${symbol}${expense.amount.toFixed(2)}</div>
            <div class="expense-actions">
                <button class="btn-edit" onclick="editExpense(${expense.id})">Edit</button>
                <button class="btn-delete" onclick="deleteExpense(${expense.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Filter expenses
function filterExpenses() {
    renderExpenses();
}

// Get filtered expenses
function getFilteredExpenses() {
    let filtered = budget.expenses;

    const categoryFilter = filterCategory.value;
    const dateFilter = filterDate.value;

    if (categoryFilter) {
        filtered = filtered.filter(expense => expense.category === categoryFilter);
    }

    if (dateFilter) {
        filtered = filtered.filter(expense => expense.date === dateFilter);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    return filtered;
}

// Clear filters
function clearFilters() {
    filterCategory.value = '';
    filterDate.value = '';
    renderExpenses();
}

// Delete expense
function deleteExpense(id) {
    const expense = budget.expenses.find(e => e.id === id);
    if (expense) {
        budget.spent -= expense.amount;
        budget.expenses = budget.expenses.filter(e => e.id !== id);
        updateBudgetDisplay();
        renderExpenses();
        updateCharts();
        saveToLocalStorage();
    }
}

// Edit expense (simplified - in a real app, this would open a modal)
function editExpense(id) {
    const expense = budget.expenses.find(e => e.id === id);
    if (expense) {
        // For now, just delete and let user re-add
        deleteExpense(id);
        // Pre-fill form with expense data
        document.getElementById('expense-date').value = expense.date;
        document.getElementById('expense-category').value = expense.category;
        document.getElementById('expense-description').value = expense.description;
        document.getElementById('expense-amount').value = expense.originalAmount;
        if (expense.isSplit) {
            splitExpenseCheckbox.checked = true;
            toggleSplitOptions();
            document.getElementById('num-people').value = expense.numPeople;
        }
    }
}

// Toggle split options visibility
function toggleSplitOptions() {
    if (splitExpenseCheckbox.checked) {
        splitOptions.classList.remove('hidden');
    } else {
        splitOptions.classList.add('hidden');
    }
}

// Initialize charts
function initCharts() {
    const ctx = document.getElementById('category-chart').getContext('2d');
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Spending by Category'
                }
            }
        }
    });

    updateCharts();
}

// Update charts
function updateCharts() {
    const categoryTotals = {};

    budget.expenses.forEach(expense => {
        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = 0;
        }
        categoryTotals[expense.category] += expense.amount;
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    categoryChart.data.labels = labels.map(capitalizeFirst);
    categoryChart.data.datasets[0].data = data;
    categoryChart.update();
}

// Switch report tabs
function switchReportTab(tabName) {
    // Update active tab
    reportTabs.forEach(tab => tab.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // For now, just show category chart. In a full implementation,
    // we'd have different charts for daily spending and trends
    const reportContent = document.getElementById('report-content');
    reportContent.innerHTML = '<canvas id="category-chart"></canvas>';
    initCharts();
}

// Set default date to today
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('expense-date').value = today;
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Local storage functions
function saveToLocalStorage() {
    localStorage.setItem('budgetTrail', JSON.stringify(budget));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('budgetTrail');
    if (saved) {
        budget = JSON.parse(saved);
    }
}

// Export data (for future feature)
function exportData() {
    const dataStr = JSON.stringify(budget, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'budget-trail-export.json';
    link.click();
}

// Print budget report
function printReport() {
    window.print();
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);