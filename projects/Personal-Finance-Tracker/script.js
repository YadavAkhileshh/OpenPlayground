// Personal Finance Tracker
class FinanceTracker {
    constructor() {
        this.transactions = this.loadTransactions();
        this.budgets = this.loadBudgets();
        this.currency = localStorage.getItem('currency') || 'USD';
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.incomeCategories = ['Salary', 'Freelance', 'Investment', 'Bonus', 'Gift', 'Other Income'];
        this.expenseCategories = ['Food & Dining', 'Transportation', 'Entertainment', 'Shopping', 'Utilities', 'Healthcare', 'Education', 'Travel', 'Other'];
        this.charts = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCurrentMonth();
        this.populateCategories();
        this.applyTheme();
        this.setCurrencySymbol();
        this.renderOverview();
    }

    // Load data from localStorage
    loadTransactions() {
        const saved = localStorage.getItem('transactions');
        return saved ? JSON.parse(saved) : [];
    }

    loadBudgets() {
        const saved = localStorage.getItem('budgets');
        return saved ? JSON.parse(saved) : [];
    }

    saveTrans() {
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
    }

    saveBudgets() {
        localStorage.setItem('budgets', JSON.stringify(this.budgets));
    }

    // Setup Event Listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => this.switchSection(e.target.closest('.nav-item')));
        });

        // Theme
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('darkModeToggle').addEventListener('change', () => this.toggleTheme());

        // Currency
        document.getElementById('currencySelect').addEventListener('change', (e) => this.changeCurrency(e.target.value));

        // Transaction Modal
        const modal = document.getElementById('transactionModal');
        const addBtns = document.querySelectorAll('#addTransactionBtn, #addTransactionBtn2');
        const closeBtn = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelBtn');
        const form = document.getElementById('transactionForm');

        addBtns.forEach(btn => {
            btn.addEventListener('click', () => this.openTransactionModal());
        });

        closeBtn.addEventListener('click', () => this.closeTransactionModal());
        cancelBtn.addEventListener('click', () => this.closeTransactionModal());
        form.addEventListener('submit', (e) => this.handleTransactionSubmit(e));
        window.addEventListener('click', (e) => {
            if (e.target === modal) this.closeTransactionModal();
        });

        // Budget Modal
        const budgetModal = document.getElementById('budgetModal');
        const addBudgetBtn = document.getElementById('addBudgetBtn');
        const closeBudgetBtn = document.getElementById('closeBudgetModal');
        const cancelBudgetBtn = document.getElementById('cancelBudgetBtn');
        const budgetForm = document.getElementById('budgetForm');

        addBudgetBtn.addEventListener('click', () => this.openBudgetModal());
        closeBudgetBtn.addEventListener('click', () => this.closeBudgetModal());
        cancelBudgetBtn.addEventListener('click', () => this.closeBudgetModal());
        budgetForm.addEventListener('submit', (e) => this.handleBudgetSubmit(e));
        window.addEventListener('click', (e) => {
            if (e.target === budgetModal) this.closeBudgetModal();
        });

        // Filters
        document.getElementById('filterType').addEventListener('change', () => this.renderTransactions());
        document.getElementById('filterCategory').addEventListener('change', () => this.renderTransactions());
        document.getElementById('filterMonth').addEventListener('change', () => this.renderTransactions());

        // Search
        document.getElementById('searchInput').addEventListener('input', () => this.renderTransactions());

        // Reports
        document.getElementById('reportPeriod').addEventListener('change', () => this.renderReports());

        // Settings
        document.getElementById('exportDataBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importDataBtn').addEventListener('click', () => document.getElementById('importFile').click());
        document.getElementById('importFile').addEventListener('change', (e) => this.importData(e));
        document.getElementById('clearDataBtn').addEventListener('click', () => this.clearAllData());

        // Transaction Type Radio
        document.querySelectorAll('input[name="type"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateCategoryOptions());
        });
    }

    // Section Navigation
    switchSection(navItem) {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        navItem.classList.add('active');

        const sectionId = navItem.dataset.section;
        document.querySelectorAll('.section-content').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');

        if (sectionId === 'transactions') {
            this.renderTransactions();
            this.populateFilterMonths();
        } else if (sectionId === 'budget') {
            this.renderBudgets();
        } else if (sectionId === 'reports') {
            this.renderReports();
        }
    }

    // Theme Management
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('darkMode', this.isDarkMode);
        this.applyTheme();
    }

    applyTheme() {
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
            document.getElementById('themeToggle').innerHTML = '<i class="ri-sun-line"></i>';
            document.getElementById('darkModeToggle').checked = true;
        } else {
            document.body.classList.remove('dark-mode');
            document.getElementById('themeToggle').innerHTML = '<i class="ri-moon-line"></i>';
            document.getElementById('darkModeToggle').checked = false;
        }
    }

    // Currency Management
    changeCurrency(currency) {
        this.currency = currency;
        localStorage.setItem('currency', currency);
        this.setCurrencySymbol();
        this.renderOverview();
        this.renderTransactions();
        this.renderReports();
    }

    setCurrencySymbol() {
        const symbols = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'INR': '₹',
            'JPY': '¥',
            'CAD': 'C$'
        };
        const symbol = symbols[this.currency] || '$';
        document.getElementById('currencySymbol').textContent = symbol;
        document.getElementById('budgetCurrencySymbol').textContent = symbol;
    }

    // Category Management
    populateCategories() {
        const categorySelect = document.getElementById('category');
        const budgetCategorySelect = document.getElementById('budgetCategory');
        this.updateCategoryOptions();

        document.querySelectorAll('input[name="type"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.updateCategoryOptions();
            });
        });
    }

    updateCategoryOptions() {
        const type = document.querySelector('input[name="type"]:checked').value;
        const categories = type === 'income' ? this.incomeCategories : this.expenseCategories;
        const select = document.getElementById('category');
        const budgetSelect = document.getElementById('budgetCategory');

        select.innerHTML = '<option value="">Select a category</option>';
        budgetSelect.innerHTML = '<option value="">Select a category</option>';

        categories.forEach(cat => {
            const option1 = document.createElement('option');
            option1.value = cat;
            option1.textContent = cat;
            select.appendChild(option1);

            if (type === 'expense') {
                const option2 = document.createElement('option');
                option2.value = cat;
                option2.textContent = cat;
                budgetSelect.appendChild(option2);
            }
        });
    }

    // Transaction Modal
    openTransactionModal() {
        document.getElementById('transactionForm').reset();
        document.querySelector('input[name="type"][value="expense"]').checked = true;
        document.getElementById('date').valueAsDate = new Date();
        this.updateCategoryOptions();
        document.getElementById('transactionModal').classList.add('active');
    }

    closeTransactionModal() {
        document.getElementById('transactionModal').classList.remove('active');
    }

    handleTransactionSubmit(e) {
        e.preventDefault();

        const type = document.querySelector('input[name="type"]:checked').value;
        const transaction = {
            id: Date.now(),
            type,
            description: document.getElementById('description').value,
            category: document.getElementById('category').value,
            amount: parseFloat(document.getElementById('amount').value),
            date: document.getElementById('date').value,
            notes: document.getElementById('transNotes').value,
            createdAt: new Date().toISOString()
        };

        this.transactions.push(transaction);
        this.saveTrans();
        this.renderOverview();
        this.renderTransactions();
        this.renderReports();
        this.closeTransactionModal();
        this.showNotification('Transaction added successfully!');
    }

    deleteTransaction(id) {
        if (confirm('Delete this transaction?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveTrans();
            this.renderOverview();
            this.renderTransactions();
            this.renderReports();
            this.showNotification('Transaction deleted');
        }
    }

    // Budget Modal
    openBudgetModal() {
        document.getElementById('budgetForm').reset();
        document.getElementById('budgetAlert').value = '80';
        document.getElementById('budgetModal').classList.add('active');
        this.updateCategoryOptions();
    }

    closeBudgetModal() {
        document.getElementById('budgetModal').classList.remove('active');
    }

    handleBudgetSubmit(e) {
        e.preventDefault();

        const budget = {
            id: Date.now(),
            category: document.getElementById('budgetCategory').value,
            limit: parseFloat(document.getElementById('budgetAmount').value),
            alertAt: parseInt(document.getElementById('budgetAlert').value),
            createdAt: new Date().toISOString()
        };

        const existing = this.budgets.find(b => b.category === budget.category);
        if (existing) {
            existing.limit = budget.limit;
            existing.alertAt = budget.alertAt;
        } else {
            this.budgets.push(budget);
        }

        this.saveBudgets();
        this.renderBudgets();
        this.closeBudgetModal();
        this.showNotification('Budget created successfully!');
    }

    deleteBudget(id) {
        if (confirm('Delete this budget?')) {
            this.budgets = this.budgets.filter(b => b.id !== id);
            this.saveBudgets();
            this.renderBudgets();
            this.showNotification('Budget deleted');
        }
    }

    // Overview Rendering
    renderOverview() {
        this.updateSummary();
        this.renderRecentTransactions();
        this.renderCharts();
    }

    updateSummary() {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        const monthTransactions = this.transactions.filter(t => t.date.startsWith(currentMonth));
        const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const balance = income - expenses;

        const totalIncome = this.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

        document.getElementById('totalIncome').textContent = this.formatCurrency(income);
        document.getElementById('incomeCount').textContent = monthTransactions.filter(t => t.type === 'income').length + ' transactions';
        
        document.getElementById('totalExpenses').textContent = this.formatCurrency(expenses);
        document.getElementById('expenseCount').textContent = monthTransactions.filter(t => t.type === 'expense').length + ' transactions';
        
        document.getElementById('balance').textContent = this.formatCurrency(balance);
        
        const savingsRate = totalIncome === 0 ? 0 : Math.round(((totalIncome - expenses) / totalIncome) * 100);
        document.getElementById('savingsRate').textContent = savingsRate + '%';
        
        document.getElementById('netWorthValue').textContent = this.formatCurrency(
            this.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) -
            this.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
        );
    }

    renderRecentTransactions() {
        const recent = this.transactions.slice().reverse().slice(0, 5);
        const container = document.getElementById('recentTransactions');

        if (recent.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="ri-inbox-line"></i><p>No transactions yet</p></div>';
            return;
        }

        container.innerHTML = recent.map(t => this.createTransactionElement(t)).join('');
    }

    createTransactionElement(transaction) {
        const date = new Date(transaction.date);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        return `
            <div class="transaction-item ${transaction.type}">
                <div class="transaction-left">
                    <div class="transaction-icon">
                        ${transaction.type === 'income' ? '<i class="ri-arrow-down-line"></i>' : '<i class="ri-arrow-up-line"></i>'}
                    </div>
                    <div class="transaction-info">
                        <h4>${this.escapeHtml(transaction.description)}</h4>
                        <p>${transaction.category} • ${dateStr}</p>
                    </div>
                </div>
                <div class="transaction-right">
                    <span class="transaction-amount">
                        ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                    </span>
                    <div class="transaction-actions">
                        <button class="transaction-btn" onclick="tracker.deleteTransaction(${transaction.id})" title="Delete">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderTransactions() {
        const filterType = document.getElementById('filterType').value;
        const filterCategory = document.getElementById('filterCategory').value;
        const filterMonth = document.getElementById('filterMonth').value;
        const searchQuery = document.getElementById('searchInput').value.toLowerCase();

        let filtered = [...this.transactions];

        if (filterType !== 'all') {
            filtered = filtered.filter(t => t.type === filterType);
        }

        if (filterCategory !== 'all') {
            filtered = filtered.filter(t => t.category === filterCategory);
        }

        if (filterMonth !== 'all') {
            filtered = filtered.filter(t => t.date.startsWith(filterMonth));
        }

        if (searchQuery) {
            filtered = filtered.filter(t => 
                t.description.toLowerCase().includes(searchQuery) ||
                t.category.toLowerCase().includes(searchQuery)
            );
        }

        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

        const container = document.getElementById('allTransactions');
        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="ri-inbox-line"></i><p>No transactions found</p></div>';
            return;
        }

        container.innerHTML = filtered.map(t => this.createTransactionElement(t)).join('');
    }

    populateFilterMonths() {
        const months = new Set();
        this.transactions.forEach(t => {
            const month = t.date.substring(0, 7);
            months.add(month);
        });

        const select = document.getElementById('filterMonth');
        const currentValue = select.value;
        select.innerHTML = '<option value="all">All Months</option>';

        Array.from(months).sort().reverse().forEach(month => {
            const [year, m] = month.split('-');
            const monthName = new Date(year, m - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            const option = document.createElement('option');
            option.value = month;
            option.textContent = monthName;
            select.appendChild(option);
        });

        select.value = currentValue;
    }

    // Budget Rendering
    renderBudgets() {
        const container = document.getElementById('budgetGrid');

        if (this.budgets.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="ri-inbox-line"></i><p>No budgets created yet</p></div>';
            return;
        }

        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        container.innerHTML = this.budgets.map(budget => {
            const spent = this.transactions
                .filter(t => t.type === 'expense' && t.category === budget.category && t.date.startsWith(currentMonth))
                .reduce((sum, t) => sum + t.amount, 0);

            const percentage = budget.limit === 0 ? 0 : Math.round((spent / budget.limit) * 100);
            const remaining = Math.max(0, budget.limit - spent);

            let status = 'normal';
            if (percentage >= 100) status = 'danger';
            else if (percentage >= budget.alertAt) status = 'warning';

            return `
                <div class="budget-card">
                    <div class="budget-header">
                        <h3 class="budget-title">${this.escapeHtml(budget.category)}</h3>
                        <button class="budget-delete" onclick="tracker.deleteBudget(${budget.id})">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                    <div class="budget-amount">
                        <span>Spent: ${this.formatCurrency(spent)}</span>
                        <span>Limit: ${this.formatCurrency(budget.limit)}</span>
                    </div>
                    <div class="budget-progress">
                        <div class="budget-bar ${status}" style="width: ${Math.min(percentage, 100)}%"></div>
                    </div>
                    <div class="budget-status ${status}">
                        ${percentage}% • ${remaining > 0 ? this.formatCurrency(remaining) + ' remaining' : 'Over budget'}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Charts
    renderCharts() {
        this.renderExpenseBreakdown();
        this.renderComparisonChart();
    }

    renderExpenseBreakdown() {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        const expenses = this.transactions
            .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth));

        const categoryData = {};
        expenses.forEach(t => {
            categoryData[t.category] = (categoryData[t.category] || 0) + t.amount;
        });

        const ctx = document.getElementById('expenseChart').getContext('2d');
        if (this.charts.expense) this.charts.expense.destroy();

        this.charts.expense = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categoryData),
                datasets: [{
                    data: Object.values(categoryData),
                    backgroundColor: [
                        '#f093fb', '#f5576c', '#667eea', '#4facfe', '#43e97b',
                        '#fa709a', '#fee140', '#30cfd0', '#a8edea', '#fed6e3'
                    ],
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--bg'),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--text') }
                    }
                }
            }
        });
    }

    renderComparisonChart() {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        const monthTransactions = this.transactions.filter(t => t.date.startsWith(currentMonth));
        const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        const ctx = document.getElementById('comparisonChart').getContext('2d');
        if (this.charts.comparison) this.charts.comparison.destroy();

        this.charts.comparison = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Income', 'Expenses'],
                datasets: [{
                    label: 'Amount',
                    data: [income, expenses],
                    backgroundColor: ['#10b981', '#ef4444'],
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text') },
                        grid: { color: getComputedStyle(document.documentElement).getPropertyValue('--border') }
                    },
                    y: {
                        ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text') }
                    }
                }
            }
        });
    }

    // Reports
    renderReports() {
        this.renderTrendChart();
        this.renderCategoryTrendChart();
        this.updateStatistics();
    }

    renderTrendChart() {
        const monthData = {};
        this.transactions.forEach(t => {
            const month = t.date.substring(0, 7);
            if (!monthData[month]) monthData[month] = { income: 0, expense: 0 };
            if (t.type === 'income') monthData[month].income += t.amount;
            else monthData[month].expense += t.amount;
        });

        const months = Object.keys(monthData).sort();
        const incomeData = months.map(m => monthData[m].income);
        const expenseData = months.map(m => monthData[m].expense);

        const ctx = document.getElementById('trendChart').getContext('2d');
        if (this.charts.trend) this.charts.trend.destroy();

        this.charts.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months.map(m => new Date(m + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })),
                datasets: [
                    {
                        label: 'Income',
                        data: incomeData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Expenses',
                        data: expenseData,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--text') } }
                },
                scales: {
                    y: {
                        ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text') },
                        grid: { color: getComputedStyle(document.documentElement).getPropertyValue('--border') }
                    },
                    x: {
                        ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text') }
                    }
                }
            }
        });
    }

    renderCategoryTrendChart() {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        const monthExpenses = this.transactions
            .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth));

        const categoryData = {};
        monthExpenses.forEach(t => {
            categoryData[t.category] = (categoryData[t.category] || 0) + t.amount;
        });

        const ctx = document.getElementById('categoryTrendChart').getContext('2d');
        if (this.charts.categoryTrend) this.charts.categoryTrend.destroy();

        this.charts.categoryTrend = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(categoryData),
                datasets: [{
                    label: 'Amount Spent',
                    data: Object.values(categoryData),
                    backgroundColor: '#f093fb',
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { display: false } },
                scales: {
                    x: {
                        ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text') },
                        grid: { color: getComputedStyle(document.documentElement).getPropertyValue('--border') }
                    },
                    y: {
                        ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text') }
                    }
                }
            }
        });
    }

    updateStatistics() {
        const income = this.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = this.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        
        const months = new Set(this.transactions.map(t => t.date.substring(0, 7)));
        const avgIncome = months.size === 0 ? 0 : income / months.size;
        const avgExpense = months.size === 0 ? 0 : expense / months.size;

        document.getElementById('avgIncome').textContent = this.formatCurrency(avgIncome);
        document.getElementById('avgExpense').textContent = this.formatCurrency(avgExpense);
        document.getElementById('totalTransactions').textContent = this.transactions.length;

        let highestDay = '—';
        if (this.transactions.length > 0) {
            const dayData = {};
            this.transactions.forEach(t => {
                dayData[t.date] = (dayData[t.date] || 0) + (t.type === 'expense' ? t.amount : 0);
            });
            const maxDay = Object.keys(dayData).reduce((a, b) => dayData[a] > dayData[b] ? a : b);
            highestDay = new Date(maxDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        document.getElementById('highestDay').textContent = highestDay;
    }

    // Data Management
    exportData() {
        const data = {
            transactions: this.transactions,
            budgets: this.budgets,
            currency: this.currency,
            exportedAt: new Date().toISOString()
        };
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `finance-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        this.showNotification('Data exported successfully!');
    }

    importData(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                this.transactions = data.transactions || [];
                this.budgets = data.budgets || [];
                if (data.currency) this.currency = data.currency;
                
                this.saveTrans();
                this.saveBudgets();
                localStorage.setItem('currency', this.currency);
                
                this.setCurrencySymbol();
                this.renderOverview();
                this.showNotification('Data imported successfully!');
            } catch (error) {
                this.showNotification('Error importing data', 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    }

    clearAllData() {
        if (confirm('Are you sure? This will delete ALL data permanently.')) {
            this.transactions = [];
            this.budgets = [];
            this.saveTrans();
            this.saveBudgets();
            this.renderOverview();
            this.renderTransactions();
            this.renderBudgets();
            this.showNotification('All data cleared', 'warning');
        }
    }

    // Utility Functions
    updateCurrentMonth() {
        const options = { month: 'long', year: 'numeric' };
        const month = new Date().toLocaleDateString('en-US', options);
        document.getElementById('currentMonth').textContent = month;
    }

    formatCurrency(amount) {
        const symbols = { 'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹', 'JPY': '¥', 'CAD': 'C$' };
        const symbol = symbols[this.currency] || '$';
        return symbol + amount.toFixed(2);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification show ${type}`;

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Initialize
const tracker = new FinanceTracker();
