// FinTrack - Personal Finance Tracker
// ...existing code...
const transactionForm = document.getElementById('transaction-form');
const transactionList = document.getElementById('transaction-list');
const financeChart = document.getElementById('financeChart');
const goalForm = document.getElementById('goal-form');
const goalList = document.getElementById('goal-list');
const exportBtn = document.getElementById('export-btn');

let transactions = [];
let goals = [];

transactionForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const desc = document.getElementById('desc').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    transactions.push({ desc, amount, category, date: new Date() });
    renderTransactions();
    renderChart();
    transactionForm.reset();
});

function renderTransactions() {
    transactionList.innerHTML = '';
    transactions.forEach((t, idx) => {
        const li = document.createElement('li');
        li.textContent = `${t.date.toLocaleDateString()} - ${t.desc}: $${t.amount} [${t.category}]`;
        transactionList.appendChild(li);
    });
}

function renderChart() {
    const income = transactions.filter(t => t.category === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.category === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const savings = transactions.filter(t => t.category === 'savings').reduce((sum, t) => sum + t.amount, 0);
    const ctx = financeChart.getContext('2d');
    if (window.financeChartInstance) window.financeChartInstance.destroy();
    window.financeChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Income', 'Expense', 'Savings'],
            datasets: [{
                data: [income, expense, savings],
                backgroundColor: ['#38b000', '#ff6f61', '#ffd60a']
            }]
        }
    });
}

goalForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const desc = document.getElementById('goal-desc').value;
    const amount = parseFloat(document.getElementById('goal-amount').value);
    goals.push({ desc, amount });
    renderGoals();
    goalForm.reset();
});

function renderGoals() {
    goalList.innerHTML = '';
    goals.forEach((g, idx) => {
        const li = document.createElement('li');
        li.textContent = `${g.desc}: $${g.amount}`;
        goalList.appendChild(li);
    });
}

exportBtn.addEventListener('click', function() {
    let csv = 'Date,Description,Amount,Category\n';
    transactions.forEach(t => {
        csv += `${t.date.toLocaleDateString()},${t.desc},${t.amount},${t.category}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fintrack_report.csv';
    a.click();
    URL.revokeObjectURL(url);
});
// ...existing code...
