export class DashboardUI {
    constructor() {
        this.chart = null;
        this.elements = {
            totalIncome: document.getElementById('totalIncome'),
            totalExpenses: document.getElementById('totalExpenses'),
            currentBalance: document.getElementById('currentBalance'),
            transactionList: document.getElementById('recentTransactions'),
            insightsList: document.getElementById('aiInisghtsList'),
            chartCanvas: document.getElementById('mainChart')
        };
    }

    updateStats(stats) {
        if (this.elements.totalIncome) this.elements.totalIncome.textContent = `$${stats.totalIncome.toFixed(2)}`;
        if (this.elements.totalExpenses) this.elements.totalExpenses.textContent = `$${stats.totalExpenses.toFixed(2)}`;
        if (this.elements.currentBalance) {
            this.elements.currentBalance.textContent = `$${stats.balance.toFixed(2)}`;
            this.elements.currentBalance.style.color = stats.balance < 0 ? 'var(--danger)' : 'var(--text-main)';
        }
    }

    renderTransactions(transactions) {
        if (this.elements.transactionList) {
            this.elements.transactionList.innerHTML = '';
            const recent = transactions.slice(0, 5);
            if (recent.length === 0) {
                this.elements.transactionList.innerHTML = '<p class="text-mute" style="text-align: center; padding: 1rem;">No transactions yet.</p>';
            } else {
                recent.forEach(t => this.elements.transactionList.appendChild(this.createTransactionItem(t)));
            }
        }

        const fullList = document.getElementById('fullTransactionList');
        if (fullList) {
            fullList.innerHTML = '';
            transactions.forEach(t => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${this.formatDate(t.date)}</td>
                    <td>${t.description}</td>
                    <td><span class="tag">${t.category}</span></td>
                    <td class="${t.category === 'Income' ? 'positive' : 'negative'}">
                        ${t.category === 'Income' ? '+' : '-'}$${Math.abs(t.amount).toFixed(2)}
                    </td>
                    <td>
                        <button class="delete-btn" data-id="${t.id}"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                fullList.appendChild(tr);
            });
        }
    }

    createTransactionItem(t) {
        const item = document.createElement('div');
        item.className = 'tr-item';
        const isIncome = t.category === 'Income';
        const icon = this.getCategoryIcon(t.category);
        item.innerHTML = `
            <div class="tr-info">
                <div class="tr-icon"><i class="fas ${icon}"></i></div>
                <div class="tr-details">
                    <span class="tr-name">${t.description}</span>
                    <span class="tr-cat">${t.category} • ${this.formatDate(t.date)}</span>
                </div>
            </div>
            <div class="tr-amount ${isIncome ? 'positive' : 'negative'}">
                ${isIncome ? '+' : '-'}$${Math.abs(t.amount).toFixed(2)}
            </div>
        `;
        return item;
    }

    renderBudgetStatus(stats) {
        const statusList = document.getElementById('budgetStatusList');
        const inputList = document.getElementById('budgetInputs');
        if (!statusList) return;

        statusList.innerHTML = '';
        if (inputList) inputList.innerHTML = '';

        stats.forEach(s => {
            // Render Status
            const item = document.createElement('div');
            item.className = 'budget-status-item';
            item.innerHTML = `
                <div class="budget-info-row">
                    <span>${s.category}</span>
                    <span>$${s.spent.toFixed(0)} / $${s.limit.toFixed(0)}</span>
                </div>
                <div class="progress-container">
                    <div class="progress-bar ${s.isOver ? 'warning' : ''}" style="width: ${s.percent}%"></div>
                </div>
            `;
            statusList.appendChild(item);

            // Render Inputs
            if (inputList && s.category !== 'Income') {
                const group = document.createElement('div');
                group.className = 'budget-input-group';
                group.innerHTML = `
                    <label>${s.category}</label>
                    <input type="number" name="${s.category}" value="${s.limit}" class="glass-input">
                `;
                inputList.appendChild(group);
            }
        });
    }

    renderInsights(insights) {
        if (this.elements.insightsList) {
            this.elements.insightsList.innerHTML = '';
            insights.forEach(insight => {
                const item = document.createElement('div');
                item.className = 'insight-item';
                item.style.borderLeftColor = this.getInsightColor(insight.type);
                item.innerHTML = `
                    <h4>${insight.title}</h4>
                    <p>${insight.message}</p>
                `;
                this.elements.insightsList.appendChild(item);
            });
        }

        const detailedGrid = document.getElementById('detailedInsights');
        if (detailedGrid) {
            detailedGrid.innerHTML = '';
            insights.forEach(insight => {
                const card = document.createElement('div');
                card.className = 'glass-card insight-card';
                card.innerHTML = `
                    <h3><i class="fas ${insight.type === 'warning' ? 'fa-exclamation-triangle' : 'fa-lightbulb'}"></i> ${insight.title}</h3>
                    <p>${insight.message}</p>
                `;
                detailedGrid.appendChild(card);
            });
        }
    }

    renderChart(data) {
        if (!this.elements.chartCanvas) return;

        // CRITICAL FIX: Destroy existing chart instance to prevent memory leaks and crashes
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }

        const labels = data.map(d => this.formatDate(d[0], true));
        const values = data.map(d => d[1]);

        try {
            this.chart = new Chart(this.elements.chartCanvas, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Daily Spending',
                        data: values,
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointBackgroundColor: '#6366f1',
                        borderWidth: 3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 800,
                        easing: 'easeOutQuart'
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(10, 10, 15, 0.9)',
                            titleFont: { family: 'Outfit' },
                            bodyFont: { family: 'Outfit' },
                            padding: 12,
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderWidth: 1
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
                            ticks: {
                                color: '#94a3b8',
                                callback: value => '$' + value
                            }
                        },
                        x: {
                            grid: { display: false, drawBorder: false },
                            ticks: { color: '#94a3b8' }
                        }
                    }
                }
            });
        } catch (err) {
            console.error("Chart rendering failed:", err);
        }
    }

    renderDeepAnalysis(analysis) {
        const summary = document.getElementById('deepInsightsSummary');
        if (!summary) return;

        if (!analysis) {
            summary.innerHTML = '<p class="text-mute">Collect at least 5 transactions for deep mission analysis.</p>';
            return;
        }

        summary.innerHTML = `
            <div class="analysis-row">
                <div class="analysis-item">
                    <span class="label">Efficiency Rating</span>
                    <span class="value" style="color: ${analysis.savingsRate > 20 ? 'var(--success)' : 'var(--warning)'}">${analysis.savingsRate.toFixed(1)}%</span>
                </div>
                <div class="analysis-item">
                    <span class="label">Volatile Systems</span>
                    <span class="value">${analysis.volatileCategories.length > 0 ? analysis.volatileCategories.join(', ') : 'All Systems Stable'}</span>
                </div>
            </div>
        `;
    }

    getCategoryIcon(cat) {
        const icons = {
            'Food': 'fa-burger',
            'Shopping': 'fa-bag-shopping',
            'Transport': 'fa-car',
            'Housing': 'fa-house',
            'Entertainment': 'fa-clapperboard',
            'Income': 'fa-money-bill-trend-up',
            'Other': 'fa-circle-dot'
        };
        return icons[cat] || icons['Other'];
    }

    getInsightColor(type) {
        const colors = {
            success: 'var(--success)',
            warning: 'var(--warning)',
            danger: 'var(--danger)',
            advice: 'var(--accent-blue)',
            info: 'var(--text-mute)'
        };
        return colors[type] || colors.info;
    }

    formatDate(dateStr, short = false) {
        const date = new Date(dateStr);
        if (short) return date.toLocaleDateString('en-US', { weekday: 'short' });
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}
