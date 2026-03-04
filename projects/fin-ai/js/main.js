import { FinanceStore } from './core/FinanceStore.js';
import { AIEngine } from './services/AIEngine.js';
import { DashboardUI } from './ui/DashboardUI.js';
import { AuthService } from './services/AuthService.js';

class App {
    constructor() {
        this.auth = new AuthService();
        this.ai = new AIEngine();
        this.ui = new DashboardUI();

        // Components initialized after login
        this.store = null;

        this.currentView = 'dashboard';
        this.init();
    }

    init() {
        if (this.auth.isAuthenticated()) {
            this.handleLoginSuccess(this.auth.getCurrentUser());
        } else {
            this.showAuth();
        }

        this.setupEventListeners();

        // AI Category Suggestion (Global listener)
        const descInput = document.getElementById('desc');
        if (descInput) {
            descInput.addEventListener('input', (e) => {
                const suggestion = this.ai.suggestCategory(e.target.value);
                const hint = document.getElementById('aiCategorySuggestion');
                if (suggestion && suggestion !== 'Other') {
                    hint.textContent = `AI Suggestion: ${suggestion}`;
                    hint.style.opacity = '1';
                } else {
                    hint.style.opacity = '0';
                }
            });
        }
    }

    handleLoginSuccess(user) {
        this.store = new FinanceStore(user.id);

        // Update UI with User Info
        document.getElementById('displayUserName').textContent = user.name;
        document.getElementById('profileNameDisplay').textContent = user.name;
        document.getElementById('profileEmailDisplay').textContent = user.email;
        document.getElementById('editName').value = user.name;
        document.getElementById('editEmail').value = user.email;

        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`;
        document.getElementById('userAvatar').src = avatarUrl;
        document.getElementById('profileAvatarBig').src = avatarUrl;

        // Hide Auth, Show App
        document.getElementById('authContainer').classList.add('hidden');
        document.getElementById('appContainer').classList.remove('blurred');

        this.switchView('dashboard');
        this.refreshUI();
    }

    showAuth() {
        document.getElementById('authContainer').classList.remove('hidden');
        document.getElementById('appContainer').classList.add('blurred');
    }

    handleLogout() {
        this.auth.logout();
        this.store = null;
        this.showAuth();
    }

    setupEventListeners() {
        // --- AUTH EVENTS ---
        document.getElementById('loginForm').onsubmit = (e) => {
            e.preventDefault();
            try {
                const email = document.getElementById('loginEmail').value;
                const pass = document.getElementById('loginPass').value;
                const user = this.auth.login(email, pass);
                this.handleLoginSuccess(user);
                e.target.reset();
            } catch (err) {
                alert(err.message);
            }
        };

        document.getElementById('registerForm').onsubmit = (e) => {
            e.preventDefault();
            try {
                const name = document.getElementById('regName').value;
                const email = document.getElementById('regEmail').value;
                const pass = document.getElementById('regPass').value; // In prod: validate
                const user = this.auth.register(name, email, pass);
                this.handleLoginSuccess(user);
                e.target.reset();
            } catch (err) {
                alert(err.message);
            }
        };

        document.getElementById('showRegister').onclick = (e) => {
            e.preventDefault();
            document.getElementById('loginForm').classList.add('hidden');
            document.getElementById('registerForm').classList.remove('hidden');
        };

        document.getElementById('showLogin').onclick = (e) => {
            e.preventDefault();
            document.getElementById('registerForm').classList.add('hidden');
            document.getElementById('loginForm').classList.remove('hidden');
        };

        document.getElementById('logoutBtn').onclick = () => this.handleLogout();

        document.getElementById('profileForm').onsubmit = (e) => {
            e.preventDefault();
            const name = document.getElementById('editName').value;
            try {
                const updatedUser = this.auth.updateProfile({ name });
                alert('Profile updated!');
                this.handleLoginSuccess(updatedUser); // Refresh UI
            } catch (err) {
                alert(err.message);
            }
        };

        // Go to profile from sidebar
        document.getElementById('userProfileBtn').onclick = () => {
            this.switchView('profile');
        };

        // --- APP EVENTS ---

        // Modal & Transaction Form
        const modal = document.getElementById('transactionModal');
        const addBtn = document.getElementById('addTransactionBtn');
        const closeBtn = document.querySelector('.close-btn');
        const form = document.getElementById('transactionForm');

        if (addBtn) addBtn.onclick = () => {
            modal.classList.remove('hidden');
            document.getElementById('date').valueAsDate = new Date();
        };

        if (closeBtn) closeBtn.onclick = () => modal.classList.add('hidden');

        window.onclick = (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        };

        if (form) form.onsubmit = (e) => {
            e.preventDefault();
            const transaction = {
                description: document.getElementById('desc').value,
                amount: parseFloat(document.getElementById('amount').value),
                category: document.getElementById('category').value,
                date: document.getElementById('date').value
            };
            this.store.addTransaction(transaction);
            form.reset();
            modal.classList.add('hidden');
            this.refreshUI();
        };

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.onclick = (e) => {
                e.preventDefault();
                const view = item.getAttribute('data-view');
                this.switchView(view);

                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            };
        });

        // Transaction Search & Filter
        const txSearch = document.getElementById('txSearch');
        const txFilter = document.getElementById('txFilterCategory');
        if (txSearch) txSearch.addEventListener('input', () => this.filterTransactions());
        if (txFilter) txFilter.addEventListener('change', () => this.filterTransactions());

        // Delete Transactions (Delegation)
        document.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-btn');
            if (deleteBtn && !deleteBtn.id) { // Avoid logout btn
                const id = deleteBtn.getAttribute('data-id');
                if (confirm('Delete this transaction?')) {
                    this.store.deleteTransaction(id);
                    this.refreshUI();
                }
            }
        });

        // Budget Form
        const budgetForm = document.getElementById('budgetForm');
        if (budgetForm) {
            budgetForm.onsubmit = (e) => {
                e.preventDefault();
                const formData = new FormData(budgetForm);
                const budgets = this.store.getBudgets();
                formData.forEach((value, key) => {
                    budgets[key] = parseFloat(value);
                });
                this.store.setAllBudgets(budgets);
                alert('Budgets updated successfully!');
                this.refreshUI();
            };
        }

        // Chart Period
        const chartPeriod = document.getElementById('chartPeriod');
        if (chartPeriod) {
            chartPeriod.onchange = (e) => {
                const days = parseInt(e.target.value);
                this.ui.renderChart(this.store.getDailySpending(days));
            };
        }
    }

    switchView(view) {
        this.currentView = view;

        // Hide all sections
        document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));

        // Show target section
        const target = document.getElementById(`${view}View`);
        if (target) target.classList.remove('hidden');

        // Update titles
        const titles = {
            dashboard: { t: "Good Evening, Explorer", s: "Your financial orbit is looking stable today." },
            transactions: { t: "Transaction Logs", s: "Analyze your historical data points." },
            budget: { t: "Mission Budgets", s: "Define your fuel consumption limits." },
            insights: { t: "Neural Analysis", s: "Deep-dive into your financial trajectory." },
            profile: { t: "Commander Profile", s: "Manage your mission credentials." }
        };

        const info = titles[view] || titles.dashboard;
        document.getElementById('viewTitle').textContent = info.t;
        document.getElementById('viewSubtitle').textContent = info.s;

        this.refreshUI();
    }

    filterTransactions() {
        if (!this.store) return;
        const query = document.getElementById('txSearch').value.toLowerCase();
        const category = document.getElementById('txFilterCategory').value;

        const filtered = this.store.getTransactions().filter(t => {
            const matchesQuery = t.description.toLowerCase().includes(query);
            const matchesCat = category === 'All' || t.category === category;
            return matchesQuery && matchesCat;
        });

        this.ui.renderTransactions(filtered);
    }

    refreshUI() {
        if (!this.store) return; // Guard if not logged in

        const transactions = this.store.getTransactions();
        const stats = this.store.getStats();
        const days = parseInt(document.getElementById('chartPeriod')?.value || 7);
        const dailySpending = this.store.getDailySpending(days);
        const insights = this.ai.generateInsights(transactions, stats);
        const budgetStatus = this.store.getBudgetStatus();
        const deepAnalysis = this.ai.getDeepAnalysis(transactions);

        this.ui.updateStats(stats);

        // Contextual rendering based on view
        if (this.currentView === 'dashboard') {
            this.ui.renderTransactions(transactions);
            this.ui.renderChart(dailySpending);
            this.ui.renderInsights(insights);
        } else if (this.currentView === 'transactions') {
            this.filterTransactions();
        } else if (this.currentView === 'budget') {
            this.ui.renderBudgetStatus(budgetStatus);
        } else if (this.currentView === 'insights') {
            this.ui.renderInsights(insights);
            this.ui.renderDeepAnalysis(deepAnalysis);
        }
        // Profile view has no dynamic lists to refresh, it's static form
    }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
