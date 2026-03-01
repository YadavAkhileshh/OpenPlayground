// Smart Expense Splitter - Comprehensive Implementation
// Features: Multi-person split, various splitting methods, tax/tip calculator,
// debt minimization, local storage, export functionality, analytics

class SmartExpenseSplitter {
    constructor() {
        this.members = [];
        this.expenses = [];
        this.currency = 'USD';
        this.currencySymbols = {
            USD: '$', EUR: '€', GBP: '£', JPY: '¥', INR: '₹', CAD: 'C$', AUD: 'A$'
        };
        this.currentTheme = localStorage.getItem('expenseSplitter_theme') || 'light';
        this.savedGroups = JSON.parse(localStorage.getItem('expenseSplitter_groups') || '[]');
        this.settlementReminders = JSON.parse(localStorage.getItem('expenseSplitter_reminders') || '[]');

        this.init();
    }

    init() {
        this.initEventListeners();
        this.initTheme();
        this.loadFromLocalStorage();
        this.updateUI();
        this.showToast('Welcome to Smart Expense Splitter!', 'success');
    }

    // Initialize all event listeners
    initEventListeners() {
        // Group management
        document.getElementById('add-member').addEventListener('click', () => this.addMember());
        document.getElementById('member-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addMember();
        });

        // Expense management
        document.getElementById('add-expense').addEventListener('click', () => this.addExpense());
        document.getElementById('clear-expense-form').addEventListener('click', () => this.clearExpenseForm());
        document.getElementById('split-method').addEventListener('change', (e) => this.updateSplitOptions(e.target.value));

        // Filters
        document.getElementById('filter-category').addEventListener('change', () => this.filterExpenses());
        document.getElementById('filter-date').addEventListener('change', () => this.filterExpenses());
        document.getElementById('clear-filters').addEventListener('click', () => this.clearFilters());

        // Settlement
        document.getElementById('calculate-settlement').addEventListener('click', () => this.calculateSettlement());
        document.getElementById('minimize-transactions').addEventListener('click', () => this.minimizeTransactions());
        document.getElementById('settlement-reminder').addEventListener('click', () => this.setSettlementReminder());

        // Tax & Tip
        document.getElementById('calculate-tax-tip').addEventListener('click', () => this.calculateTaxTip());
        document.getElementById('add-tax-tip-expense').addEventListener('click', () => this.addTaxTipAsExpense());

        // Navigation
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('save-expenses').addEventListener('click', () => this.showSaveModal());
        document.getElementById('load-expenses').addEventListener('click', () => this.showLoadModal());
        document.getElementById('export-expenses').addEventListener('click', () => this.showExportModal());
        document.getElementById('analytics-toggle').addEventListener('click', () => this.toggleAnalytics());

        // Currency
        document.getElementById('currency').addEventListener('change', (e) => this.changeCurrency(e.target.value));

        // Modal controls
        document.querySelectorAll('.modal-close').forEach(close => {
            close.addEventListener('click', () => this.hideModals());
        });

        document.getElementById('save-expenses-confirm').addEventListener('click', () => this.saveExpenses());
        document.getElementById('export-pdf').addEventListener('click', () => this.exportAsPDF());
        document.getElementById('export-csv').addEventListener('click', () => this.exportAsCSV());
        document.getElementById('export-json').addEventListener('click', () => this.exportAsJSON());

        // Analytics
        document.getElementById('close-analytics').addEventListener('click', () => this.hideAnalytics());

        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.hideModals();
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Auto-save on changes
        this.setupAutoSave();
    }

    // Add a new member to the group
    addMember() {
        const nameInput = document.getElementById('member-name');
        const name = nameInput.value.trim();

        if (!name) {
            this.showToast('Please enter a member name.', 'warning');
            return;
        }

        if (this.members.some(member => member.name.toLowerCase() === name.toLowerCase())) {
            this.showToast('Member already exists.', 'warning');
            return;
        }

        const member = {
            id: Date.now() + Math.random(),
            name: name,
            balance: 0,
            avatar: this.generateAvatar(name)
        };

        this.members.push(member);
        this.updateMembersList();
        this.updateExpensePaidByOptions();
        this.saveToLocalStorage();

        nameInput.value = '';
        this.showToast(`Added ${name} to the group!`, 'success');
    }

    // Generate avatar for member
    generateAvatar(name) {
        const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];
        const initial = name.charAt(0).toUpperCase();
        const color = colors[this.members.length % colors.length];
        return { initial, color };
    }

    // Update members list in UI
    updateMembersList() {
        const container = document.getElementById('members-list');

        if (this.members.length === 0) {
            container.innerHTML = '<p class="empty-state">No members added yet. Add members above to get started!</p>';
            return;
        }

        container.innerHTML = this.members.map(member => `
            <div class="member-card fade-in" data-id="${member.id}">
                <div class="member-info">
                    <div class="member-avatar" style="background-color: ${member.avatar.color}">
                        ${member.avatar.initial}
                    </div>
                    <div>
                        <div class="member-name">${member.name}</div>
                        <div class="member-balance">${this.formatCurrency(member.balance)}</div>
                    </div>
                </div>
                <div class="member-actions">
                    <button class="member-btn edit" onclick="expenseSplitter.editMember('${member.id}')" title="Edit Member">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="member-btn remove" onclick="expenseSplitter.removeMember('${member.id}')" title="Remove Member">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Remove a member
    removeMember(memberId) {
        const member = this.members.find(m => m.id === memberId);
        if (!member) return;

        if (this.expenses.some(expense => expense.paidBy === memberId)) {
            this.showToast('Cannot remove member with existing expenses.', 'error');
            return;
        }

        if (confirm(`Remove ${member.name} from the group?`)) {
            this.members = this.members.filter(m => m.id !== memberId);
            this.updateMembersList();
            this.updateExpensePaidByOptions();
            this.saveToLocalStorage();
            this.showToast(`Removed ${member.name} from the group.`, 'info');
        }
    }

    // Edit member name
    editMember(memberId) {
        const member = this.members.find(m => m.id === memberId);
        if (!member) return;

        const newName = prompt('Edit member name:', member.name);
        if (newName && newName.trim() && newName !== member.name) {
            if (this.members.some(m => m.id !== memberId && m.name.toLowerCase() === newName.toLowerCase())) {
                this.showToast('Member name already exists.', 'warning');
                return;
            }

            member.name = newName.trim();
            member.avatar = this.generateAvatar(newName);
            this.updateMembersList();
            this.updateExpensePaidByOptions();
            this.saveToLocalStorage();
            this.showToast(`Updated ${member.name}'s name.`, 'success');
        }
    }

    // Update expense paid by options
    updateExpensePaidByOptions() {
        const select = document.getElementById('expense-paid-by');
        select.innerHTML = '<option value="">Select payer</option>';

        this.members.forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = member.name;
            select.appendChild(option);
        });
    }

    // Add a new expense
    addExpense() {
        const description = document.getElementById('expense-description').value.trim();
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const paidBy = document.getElementById('expense-paid-by').value;
        const category = document.getElementById('expense-category').value;
        const splitMethod = document.getElementById('split-method').value;
        const date = document.getElementById('expense-date').value || new Date().toISOString().split('T')[0];

        if (!description || !amount || amount <= 0 || !paidBy) {
            this.showToast('Please fill in all required fields.', 'warning');
            return;
        }

        if (this.members.length < 2) {
            this.showToast('Add at least 2 members to split expenses.', 'warning');
            return;
        }

        const payer = this.members.find(m => m.id === paidBy);
        if (!payer) {
            this.showToast('Invalid payer selected.', 'error');
            return;
        }

        // Get split details based on method
        const splitDetails = this.getSplitDetails(splitMethod, amount);

        const expense = {
            id: Date.now() + Math.random(),
            description,
            amount,
            paidBy,
            category,
            splitMethod,
            splitDetails,
            date,
            createdAt: new Date().toISOString()
        };

        this.expenses.push(expense);
        this.calculateBalances();
        this.updateExpensesList();
        this.updateExpenseSummary();
        this.saveToLocalStorage();
        this.clearExpenseForm();

        this.showToast(`Added expense: ${description}`, 'success');
    }

    // Get split details based on method
    getSplitDetails(method, totalAmount) {
        const details = {};

        switch (method) {
            case 'equal':
                const equalShare = totalAmount / this.members.length;
                this.members.forEach(member => {
                    details[member.id] = equalShare;
                });
                break;

            case 'unequal':
                // Get values from split options
                this.members.forEach(member => {
                    const input = document.querySelector(`input[data-member-id="${member.id}"][data-split-type="unequal"]`);
                    const amount = parseFloat(input?.value || 0);
                    details[member.id] = amount;
                });
                break;

            case 'percentage':
                // Get percentages from split options
                this.members.forEach(member => {
                    const input = document.querySelector(`input[data-member-id="${member.id}"][data-split-type="percentage"]`);
                    const percentage = parseFloat(input?.value || 0);
                    details[member.id] = (totalAmount * percentage) / 100;
                });
                break;

            case 'exact':
                // Get exact amounts from split options
                this.members.forEach(member => {
                    const input = document.querySelector(`input[data-member-id="${member.id}"][data-split-type="exact"]`);
                    const amount = parseFloat(input?.value || 0);
                    details[member.id] = amount;
                });
                break;
        }

        return details;
    }

    // Update split options UI based on method
    updateSplitOptions(method) {
        const container = document.getElementById('split-options');

        if (method === 'equal') {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        container.innerHTML = '';

        const totalAmount = parseFloat(document.getElementById('expense-amount').value) || 0;

        this.members.forEach(member => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'split-option';

            let inputType = 'number';
            let placeholder = '0.00';
            let step = '0.01';
            let label = '';

            switch (method) {
                case 'unequal':
                    label = `${member.name} pays:`;
                    break;
                case 'percentage':
                    label = `${member.name} percentage:`;
                    placeholder = '0';
                    step = '0.1';
                    break;
                case 'exact':
                    label = `${member.name} amount:`;
                    break;
            }

            optionDiv.innerHTML = `
                <label>${label}</label>
                <input type="${inputType}" placeholder="${placeholder}" step="${step}"
                       data-member-id="${member.id}" data-split-type="${method}"
                       min="0" ${method === 'percentage' ? 'max="100"' : ''}>
                ${method === 'percentage' ? '<span>%</span>' : ''}
            `;

            container.appendChild(optionDiv);
        });

        // Add total validation for unequal and exact methods
        if (method === 'unequal' || method === 'exact') {
            const totalDiv = document.createElement('div');
            totalDiv.className = 'split-total';
            totalDiv.innerHTML = `<strong>Total: <span id="split-total">0.00</span></strong>`;
            container.appendChild(totalDiv);

            // Add event listeners for validation
            container.querySelectorAll('input').forEach(input => {
                input.addEventListener('input', () => this.validateSplitTotal(method, totalAmount));
            });
        }
    }

    // Validate split total
    validateSplitTotal(method, totalAmount) {
        const inputs = document.querySelectorAll('#split-options input');
        let total = 0;

        inputs.forEach(input => {
            total += parseFloat(input.value) || 0;
        });

        const totalSpan = document.getElementById('split-total');
        totalSpan.textContent = total.toFixed(2);
        totalSpan.style.color = Math.abs(total - totalAmount) < 0.01 ? 'var(--success-color)' : 'var(--danger-color)';
    }

    // Calculate member balances
    calculateBalances() {
        // Reset balances
        this.members.forEach(member => member.balance = 0);

        // Calculate net balance for each member
        this.expenses.forEach(expense => {
            const payer = this.members.find(m => m.id === expense.paidBy);
            if (!payer) return;

            // Payer gets credit for the full amount
            payer.balance += expense.amount;

            // Each participant owes their share
            Object.entries(expense.splitDetails).forEach(([memberId, share]) => {
                const member = this.members.find(m => m.id === memberId);
                if (member) {
                    member.balance -= share;
                }
            });
        });
    }

    // Update expenses list in UI
    updateExpensesList() {
        const container = document.getElementById('expenses-list');
        const filteredExpenses = this.getFilteredExpenses();

        if (filteredExpenses.length === 0) {
            container.innerHTML = '<div class="empty-state">No expenses found. Add your first expense above!</div>';
            return;
        }

        container.innerHTML = filteredExpenses.map(expense => {
            const payer = this.members.find(m => m.id === expense.paidBy);
            const categoryEmoji = this.getCategoryEmoji(expense.category);

            return `
                <div class="expense-item fade-in" data-id="${expense.id}">
                    <div class="expense-info">
                        <div class="expense-header">
                            <span class="expense-description">${expense.description}</span>
                            <span class="expense-category">${categoryEmoji} ${this.capitalizeFirst(expense.category.replace('_', ' '))}</span>
                        </div>
                        <div class="expense-details">
                            <span>Paid by: ${payer?.name || 'Unknown'}</span>
                            <span>Date: ${new Date(expense.date).toLocaleDateString()}</span>
                            <span>Split: ${this.capitalizeFirst(expense.splitMethod)}</span>
                        </div>
                    </div>
                    <div class="expense-amount">${this.formatCurrency(expense.amount)}</div>
                    <div class="expense-actions">
                        <button class="expense-btn edit" onclick="expenseSplitter.editExpense('${expense.id}')" title="Edit Expense">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="expense-btn delete" onclick="expenseSplitter.deleteExpense('${expense.id}')" title="Delete Expense">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Get filtered expenses
    getFilteredExpenses() {
        const categoryFilter = document.getElementById('filter-category').value;
        const dateFilter = document.getElementById('filter-date').value;

        return this.expenses.filter(expense => {
            if (categoryFilter !== 'all' && expense.category !== categoryFilter) return false;
            if (dateFilter && expense.date !== dateFilter) return false;
            return true;
        });
    }

    // Filter expenses
    filterExpenses() {
        this.updateExpensesList();
    }

    // Clear filters
    clearFilters() {
        document.getElementById('filter-category').value = 'all';
        document.getElementById('filter-date').value = '';
        this.updateExpensesList();
    }

    // Update expense summary
    updateExpenseSummary() {
        const totalExpenses = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const perPersonAverage = this.members.length > 0 ? totalExpenses / this.members.length : 0;

        document.getElementById('total-expenses').textContent = this.formatCurrency(totalExpenses);
        document.getElementById('per-person-average').textContent = this.formatCurrency(perPersonAverage);
        document.getElementById('total-expenses-count').textContent = this.expenses.length;
    }

    // Calculate settlement using debt minimization algorithm
    calculateSettlement() {
        if (this.members.length < 2) {
            this.showToast('Add at least 2 members to calculate settlement.', 'warning');
            return;
        }

        this.calculateBalances();

        // Separate creditors and debtors
        const creditors = this.members.filter(m => m.balance > 0.01).sort((a, b) => b.balance - a.balance);
        const debtors = this.members.filter(m => m.balance < -0.01).sort((a, b) => a.balance - b.balance);

        const settlements = [];
        let i = 0, j = 0;

        while (i < creditors.length && j < debtors.length) {
            const creditor = creditors[i];
            const debtor = debtors[j];

            const amount = Math.min(creditor.balance, -debtor.balance);

            if (amount > 0.01) {
                settlements.push({
                    from: debtor,
                    to: creditor,
                    amount: amount
                });

                creditor.balance -= amount;
                debtor.balance += amount;

                if (creditor.balance <= 0.01) i++;
                if (debtor.balance >= -0.01) j++;
            } else {
                if (creditor.balance <= 0.01) i++;
                if (debtor.balance >= -0.01) j++;
            }
        }

        this.displaySettlement(settlements);
    }

    // Display settlement results
    displaySettlement(settlements) {
        const container = document.getElementById('settlement-results');

        if (settlements.length === 0) {
            container.innerHTML = '<div class="empty-state">All balances are settled! 🎉</div>';
            return;
        }

        container.innerHTML = settlements.map(settlement => `
            <div class="settlement-item fade-in">
                <div class="settlement-arrow">💸</div>
                <div class="settlement-text">
                    <strong>${settlement.from.name}</strong> owes <strong>${settlement.to.name}</strong>
                </div>
                <div class="settlement-amount">${this.formatCurrency(settlement.amount)}</div>
            </div>
        `).join('');

        this.showToast(`Found ${settlements.length} settlement${settlements.length > 1 ? 's' : ''}!`, 'success');
    }

    // Minimize transactions (advanced settlement)
    minimizeTransactions() {
        this.showToast('Transaction minimization is a premium feature!', 'info');
        // In a real implementation, this would use more advanced algorithms
    }

    // Set settlement reminder
    setSettlementReminder() {
        if (this.settlementReminders.length >= 5) {
            this.showToast('Maximum 5 reminders allowed.', 'warning');
            return;
        }

        const reminder = {
            id: Date.now(),
            message: 'Time to settle up with your group!',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
            created: new Date().toISOString()
        };

        this.settlementReminders.push(reminder);
        localStorage.setItem('expenseSplitter_reminders', JSON.stringify(this.settlementReminders));

        this.showToast('Settlement reminder set for next week!', 'success');
    }

    // Calculate tax and tip
    calculateTaxTip() {
        const subtotal = parseFloat(document.getElementById('subtotal').value) || 0;
        const taxRate = parseFloat(document.getElementById('tax-rate').value) || 0;
        const tipPercentage = parseFloat(document.getElementById('tip-percentage').value) || 0;
        const tipAmount = parseFloat(document.getElementById('tip-amount').value) || 0;

        const taxAmount = (subtotal * taxRate) / 100;
        const calculatedTip = tipAmount || ((subtotal + taxAmount) * tipPercentage) / 100;
        const grandTotal = subtotal + taxAmount + calculatedTip;

        document.getElementById('tax-amount').textContent = this.formatCurrency(taxAmount);
        document.getElementById('calculated-tip').textContent = this.formatCurrency(calculatedTip);
        document.getElementById('grand-total').textContent = this.formatCurrency(grandTotal);

        this.showToast('Tax and tip calculated!', 'success');
    }

    // Add tax/tip as expense
    addTaxTipAsExpense() {
        const subtotal = parseFloat(document.getElementById('subtotal').value) || 0;
        const grandTotal = parseFloat(document.getElementById('grand-total').textContent.replace(/[^0-9.-]+/g, '')) || 0;

        if (grandTotal <= 0) {
            this.showToast('Calculate tax and tip first.', 'warning');
            return;
        }

        // Auto-fill expense form
        document.getElementById('expense-description').value = 'Tax & Tip Calculation';
        document.getElementById('expense-amount').value = (grandTotal - subtotal).toFixed(2);
        document.getElementById('expense-category').value = 'other';

        this.showToast('Tax & tip amount added to expense form!', 'success');
    }

    // Delete expense
    deleteExpense(expenseId) {
        const expense = this.expenses.find(e => e.id === expenseId);
        if (!expense) return;

        if (confirm(`Delete expense: ${expense.description}?`)) {
            this.expenses = this.expenses.filter(e => e.id !== expenseId);
            this.calculateBalances();
            this.updateExpensesList();
            this.updateExpenseSummary();
            this.saveToLocalStorage();
            this.showToast('Expense deleted.', 'info');
        }
    }

    // Edit expense
    editExpense(expenseId) {
        const expense = this.expenses.find(e => e.id === expenseId);
        if (!expense) return;

        // Populate form with expense data
        document.getElementById('expense-description').value = expense.description;
        document.getElementById('expense-amount').value = expense.amount;
        document.getElementById('expense-paid-by').value = expense.paidBy;
        document.getElementById('expense-category').value = expense.category;
        document.getElementById('expense-date').value = expense.date;

        // Remove the expense and let user re-add it
        this.expenses = this.expenses.filter(e => e.id !== expenseId);
        this.calculateBalances();
        this.updateExpensesList();
        this.updateExpenseSummary();

        this.showToast('Expense loaded for editing. Make changes and add again.', 'info');
    }

    // Clear expense form
    clearExpenseForm() {
        document.getElementById('expense-description').value = '';
        document.getElementById('expense-amount').value = '';
        document.getElementById('expense-paid-by').value = '';
        document.getElementById('expense-category').value = 'food';
        document.getElementById('split-method').value = 'equal';
        document.getElementById('expense-date').value = '';
        document.getElementById('split-options').style.display = 'none';
    }

    // Save expenses to local storage
    saveToLocalStorage() {
        const data = {
            members: this.members,
            expenses: this.expenses,
            currency: this.currency,
            lastSaved: new Date().toISOString()
        };
        localStorage.setItem('expenseSplitter_data', JSON.stringify(data));
    }

    // Load from local storage
    loadFromLocalStorage() {
        const data = JSON.parse(localStorage.getItem('expenseSplitter_data') || '{}');

        if (data.members) this.members = data.members;
        if (data.expenses) this.expenses = data.expenses;
        if (data.currency) {
            this.currency = data.currency;
            document.getElementById('currency').value = this.currency;
        }
    }

    // Show save modal
    showSaveModal() {
        if (this.members.length === 0 && this.expenses.length === 0) {
            this.showToast('Nothing to save. Add members and expenses first.', 'warning');
            return;
        }

        document.getElementById('save-modal').classList.add('show');
        document.getElementById('expense-group-name').focus();
    }

    // Save expenses group
    saveExpenses() {
        const name = document.getElementById('expense-group-name').value.trim();
        const description = document.getElementById('expense-group-description').value.trim();

        if (!name) {
            this.showToast('Please enter a group name.', 'warning');
            return;
        }

        const groupData = {
            id: Date.now(),
            name,
            description,
            members: this.members,
            expenses: this.expenses,
            currency: this.currency,
            totalAmount: this.expenses.reduce((sum, exp) => sum + exp.amount, 0),
            createdAt: new Date().toISOString()
        };

        this.savedGroups.push(groupData);
        localStorage.setItem('expenseSplitter_groups', JSON.stringify(this.savedGroups));

        this.hideModals();
        this.showToast(`Group "${name}" saved successfully!`, 'success');
    }

    // Show load modal
    showLoadModal() {
        const container = document.getElementById('saved-expenses-list');

        if (this.savedGroups.length === 0) {
            container.innerHTML = '<p>No saved groups found.</p>';
        } else {
            container.innerHTML = this.savedGroups.map(group => `
                <div class="saved-expense-item" onclick="expenseSplitter.loadExpenses(${group.id})">
                    <div class="saved-expense-name">${group.name}</div>
                    <div class="saved-expense-meta">
                        ${group.members.length} members • ${group.expenses.length} expenses • ${this.formatCurrency(group.totalAmount)}
                        ${group.description ? `<br><small>${group.description}</small>` : ''}
                    </div>
                </div>
            `).join('');
        }

        document.getElementById('load-modal').classList.add('show');
    }

    // Load saved expenses
    loadExpenses(groupId) {
        const group = this.savedGroups.find(g => g.id === groupId);
        if (!group) return;

        this.members = group.members;
        this.expenses = group.expenses;
        this.currency = group.currency;
        document.getElementById('currency').value = this.currency;

        this.calculateBalances();
        this.updateUI();
        this.saveToLocalStorage();

        this.hideModals();
        this.showToast(`Loaded group "${group.name}"!`, 'success');
    }

    // Show export modal
    showExportModal() {
        if (this.expenses.length === 0) {
            this.showToast('No expenses to export.', 'warning');
            return;
        }

        document.getElementById('export-modal').classList.add('show');
    }

    // Export as CSV
    exportAsCSV() {
        const csvContent = this.generateCSV();
        this.downloadFile(csvContent, 'expenses.csv', 'text/csv');
        this.hideModals();
        this.showToast('CSV exported successfully!', 'success');
    }

    // Export as JSON
    exportAsJSON() {
        const jsonContent = JSON.stringify({
            members: this.members,
            expenses: this.expenses,
            currency: this.currency,
            exportedAt: new Date().toISOString()
        }, null, 2);
        this.downloadFile(jsonContent, 'expenses.json', 'application/json');
        this.hideModals();
        this.showToast('JSON exported successfully!', 'success');
    }

    // Export as PDF (simplified version)
    exportAsPDF() {
        // In a real implementation, you would use a PDF library like jsPDF
        const pdfContent = this.generatePDFText();
        this.downloadFile(pdfContent, 'expenses.txt', 'text/plain');
        this.hideModals();
        this.showToast('PDF export simulated (saved as text file)!', 'success');
    }

    // Generate CSV content
    generateCSV() {
        const headers = ['Date', 'Description', 'Category', 'Paid By', 'Amount', 'Split Method'];
        const rows = this.expenses.map(expense => {
            const payer = this.members.find(m => m.id === expense.paidBy);
            return [
                expense.date,
                `"${expense.description}"`,
                expense.category,
                payer?.name || 'Unknown',
                expense.amount,
                expense.splitMethod
            ];
        });

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    // Generate PDF text content
    generatePDFText() {
        let content = `Expense Report\n\n`;
        content += `Generated: ${new Date().toLocaleString()}\n\n`;
        content += `Members: ${this.members.map(m => m.name).join(', ')}\n\n`;
        content += `Total Expenses: ${this.formatCurrency(this.expenses.reduce((sum, exp) => sum + exp.amount, 0))}\n\n`;

        content += `Expenses:\n`;
        this.expenses.forEach((expense, index) => {
            const payer = this.members.find(m => m.id === expense.paidBy);
            content += `${index + 1}. ${expense.date} - ${expense.description}\n`;
            content += `   Paid by: ${payer?.name || 'Unknown'} | Amount: ${this.formatCurrency(expense.amount)}\n`;
            content += `   Category: ${expense.category} | Split: ${expense.splitMethod}\n\n`;
        });

        return content;
    }

    // Download file helper
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    // Toggle analytics dashboard
    toggleAnalytics() {
        const dashboard = document.getElementById('analytics-dashboard');
        if (dashboard.classList.contains('hidden')) {
            this.showAnalytics();
        } else {
            this.hideAnalytics();
        }
    }

    // Show analytics dashboard
    showAnalytics() {
        const dashboard = document.getElementById('analytics-dashboard');
        dashboard.classList.remove('hidden');
        this.updateAnalyticsCharts();
    }

    // Hide analytics dashboard
    hideAnalytics() {
        const dashboard = document.getElementById('analytics-dashboard');
        dashboard.classList.add('hidden');
    }

    // Update analytics charts
    updateAnalyticsCharts() {
        this.updateCategoryChart();
        this.updateTrendChart();
        this.updateMemberChart();
        this.updateSettlementSummary();
    }

    // Update category spending chart
    updateCategoryChart() {
        const ctx = document.getElementById('category-chart');
        if (!ctx) return;

        const categoryData = {};
        this.expenses.forEach(expense => {
            categoryData[expense.category] = (categoryData[expense.category] || 0) + expense.amount;
        });

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categoryData),
                datasets: [{
                    data: Object.values(categoryData),
                    backgroundColor: [
                        '#10b981', '#3b82f6', '#f59e0b', '#ef4444',
                        '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Update spending trend chart
    updateTrendChart() {
        const ctx = document.getElementById('trend-chart');
        if (!ctx) return;

        const dailyData = {};
        this.expenses.forEach(expense => {
            const date = expense.date;
            dailyData[date] = (dailyData[date] || 0) + expense.amount;
        });

        const sortedDates = Object.keys(dailyData).sort();
        const amounts = sortedDates.map(date => dailyData[date]);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: sortedDates,
                datasets: [{
                    label: 'Daily Spending',
                    data: amounts,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Update member contributions chart
    updateMemberChart() {
        const ctx = document.getElementById('member-chart');
        if (!ctx) return;

        const memberData = {};
        this.members.forEach(member => {
            memberData[member.name] = this.expenses
                .filter(expense => expense.paidBy === member.id)
                .reduce((sum, expense) => sum + expense.amount, 0);
        });

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(memberData),
                datasets: [{
                    label: 'Amount Paid',
                    data: Object.values(memberData),
                    backgroundColor: '#3b82f6'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Update settlement summary
    updateSettlementSummary() {
        const container = document.getElementById('settlement-summary');
        if (!container) return;

        const summary = this.members.map(member => ({
            name: member.name,
            balance: member.balance
        })).sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));

        container.innerHTML = summary.map(member => `
            <div class="settlement-summary-item">
                <span>${member.name}</span>
                <span class="${member.balance >= 0 ? 'positive' : 'negative'}">
                    ${this.formatCurrency(member.balance)}
                </span>
            </div>
        `).join('');
    }

    // Initialize theme
    initTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        const themeBtn = document.getElementById('theme-toggle');
        themeBtn.innerHTML = this.currentTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    // Toggle theme
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('expenseSplitter_theme', this.currentTheme);

        const themeBtn = document.getElementById('theme-toggle');
        themeBtn.innerHTML = this.currentTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

        this.showToast(`Switched to ${this.currentTheme} theme.`, 'info');
    }

    // Change currency
    changeCurrency(newCurrency) {
        this.currency = newCurrency;
        this.saveToLocalStorage();
        this.updateUI();
        this.showToast(`Currency changed to ${newCurrency}.`, 'info');
    }

    // Hide all modals
    hideModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }

    // Show loading overlay
    showLoading(message = 'Processing...') {
        document.getElementById('loading-text').textContent = message;
        document.getElementById('loading-overlay').classList.add('show');
    }

    // Hide loading overlay
    hideLoading() {
        document.getElementById('loading-overlay').classList.remove('show');
    }

    // Show toast notification
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${this.getToastIcon(type)}"></i>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    // Get toast icon based on type
    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Handle keyboard shortcuts
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 's':
                    e.preventDefault();
                    this.showSaveModal();
                    break;
                case 'o':
                    e.preventDefault();
                    this.showLoadModal();
                    break;
                case 'e':
                    e.preventDefault();
                    this.showExportModal();
                    break;
            }
        }

        if (e.key === 'Escape') {
            this.hideModals();
            this.hideAnalytics();
        }
    }

    // Setup auto-save
    setupAutoSave() {
        let autoSaveTimeout;
        const autoSave = () => {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = setTimeout(() => {
                this.saveToLocalStorage();
            }, 1000);
        };

        // Auto-save on data changes
        document.addEventListener('input', autoSave);
        document.addEventListener('change', autoSave);
    }

    // Update all UI elements
    updateUI() {
        this.updateMembersList();
        this.updateExpensePaidByOptions();
        this.updateExpensesList();
        this.updateExpenseSummary();
        this.calculateBalances();
    }

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: this.currency
        }).format(amount);
    }

    // Get category emoji
    getCategoryEmoji(category) {
        const emojis = {
            food: '🍽️',
            transport: '🚗',
            accommodation: '🏨',
            entertainment: '🎭',
            shopping: '🛍️',
            utilities: '⚡',
            other: '📦'
        };
        return emojis[category] || '📦';
    }

    // Capitalize first letter
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Initialize the application
const expenseSplitter = new SmartExpenseSplitter();

// Make expenseSplitter available globally for onclick handlers
window.expenseSplitter = expenseSplitter;