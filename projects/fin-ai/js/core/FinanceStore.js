import { Storage } from '../utils/Storage.js';

export class FinanceStore {
    constructor(userId) {
        this.userId = userId;
        this.txKey = `fin_transactions_${userId}`;
        this.budgetKey = `fin_budgets_${userId}`;

        this.transactions = Storage.load(this.txKey) || this.getSeedData();
        this.budgets = Storage.load(this.budgetKey) || this.getDefaultBudgets();
        this.listeners = [];
    }

    getDefaultBudgets() {
        return {
            'Food': 500,
            'Shopping': 200,
            'Transport': 150,
            'Housing': 1200,
            'Entertainment': 100,
            'Other': 100
        };
    }

    getSeedData() {
        // Only seed if we are truly empty
        const now = new Date();
        const seed = [
            { id: '1', description: 'Monthly Salary', amount: 5000, category: 'Income', date: this.offsetDate(now, 0) },
            { id: '2', description: 'Starbucks Coffee', amount: 12.50, category: 'Food', date: this.offsetDate(now, 0) },
            { id: '3', description: 'Uber Ride', amount: 25.00, category: 'Transport', date: this.offsetDate(now, -1) },
            { id: '4', description: 'Netflix Subscription', amount: 15.99, category: 'Entertainment', date: this.offsetDate(now, -2) },
            { id: '5', description: 'Amazon Shopping', amount: 120.00, category: 'Shopping', date: this.offsetDate(now, -3) },
            { id: '6', description: 'Grocery Store', amount: 65.40, category: 'Food', date: this.offsetDate(now, -4) },
            { id: '7', description: 'Fuel Station', amount: 50.00, category: 'Transport', date: this.offsetDate(now, -5) }
        ];
        Storage.save(this.txKey, seed);
        return seed;
    }

    offsetDate(base, days) {
        const d = new Date(base);
        d.setDate(base.getDate() + days);
        return d.toISOString().split('T')[0];
    }

    getTransactions() {
        return this.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    addTransaction(transaction) {
        const newTransaction = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            ...transaction
        };
        this.transactions.push(newTransaction);
        this.save();
        this.notify();
        return newTransaction;
    }

    deleteTransaction(id) {
        this.transactions = this.transactions.filter(t => t.id !== id);
        this.save();
        this.notify();
    }

    getStats() {
        const income = this.transactions
            .filter(t => t.category === 'Income')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        const expense = this.transactions
            .filter(t => t.category !== 'Income')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        return {
            totalIncome: income,
            totalExpenses: expense,
            balance: income - expense
        };
    }

    getDailySpending(days = 7) {
        const stats = {};
        const now = new Date();

        for (let i = 0; i < days; i++) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            stats[dateStr] = 0;
        }

        this.transactions
            .filter(t => t.category !== 'Income')
            .forEach(t => {
                if (stats[t.date] !== undefined) {
                    stats[t.date] += parseFloat(t.amount);
                }
            });

        return Object.entries(stats)
            .sort((a, b) => new Date(a[0]) - new Date(b[0]));
    }

    getCategoryDistribution() {
        const dist = {};
        this.transactions
            .filter(t => t.category !== 'Income')
            .forEach(t => {
                dist[t.category] = (dist[t.category] || 0) + parseFloat(t.amount);
            });
        return dist;
    }

    getBudgets() {
        return this.budgets;
    }

    setBudget(category, amount) {
        this.budgets[category] = parseFloat(amount);
        this.saveBudgets();
        this.notify();
    }

    setAllBudgets(budgets) {
        this.budgets = budgets;
        this.saveBudgets();
        this.notify();
    }

    getBudgetStatus() {
        const spending = this.getCategoryDistribution();
        return Object.entries(this.budgets).map(([cat, limit]) => ({
            category: cat,
            limit: limit,
            spent: spending[cat] || 0,
            percent: limit > 0 ? Math.min((spending[cat] || 0) / limit * 100, 100) : 0,
            isOver: (spending[cat] || 0) > limit
        }));
    }

    save() {
        Storage.save(this.txKey, this.transactions);
    }

    saveBudgets() {
        Storage.save(this.budgetKey, this.budgets);
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    notify() {
        this.listeners.forEach(cb => cb(this.getTransactions()));
    }
}
