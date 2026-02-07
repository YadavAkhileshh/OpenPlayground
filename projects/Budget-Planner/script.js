
        let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        let goal = parseFloat(localStorage.getItem('goal')) || 0;
        let chart;

        function updateUI() {
            updateTransactionList();
            updateChart();
            updateGoalDisplay();
            checkAlerts();
        }

        function addTransaction() {
            const type = document.getElementById('type').value;
            const amount = parseFloat(document.getElementById('amount').value);
            const category = document.getElementById('category').value;

            if (isNaN(amount) || amount <= 0) {
                alert('Please enter a valid amount.');
                return;
            }

            transactions.push({ type, amount, category, date: new Date().toISOString() });
            localStorage.setItem('transactions', JSON.stringify(transactions));
            updateUI();
            document.getElementById('amount').value = '';
        }

        function updateTransactionList() {
            const list = document.getElementById('transaction-list');
            list.innerHTML = '';
            transactions.forEach((t, index) => {
                const item = document.createElement('li');
                item.className = 'transaction-item';
                item.innerHTML = `
                    <span>${t.type}: $${t.amount} (${t.category})</span>
                    <button onclick="removeTransaction(${index})">Remove</button>
                `;
                list.appendChild(item);
            });
        }

        function removeTransaction(index) {
            transactions.splice(index, 1);
            localStorage.setItem('transactions', JSON.stringify(transactions));
            updateUI();
        }

        function updateChart() {
            const ctx = document.getElementById('spendingChart').getContext('2d');
            const categories = {};
            transactions.filter(t => t.type === 'expense').forEach(t => {
                categories[t.category] = (categories[t.category] || 0) + t.amount;
            });

            if (chart) chart.destroy();

            chart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: Object.keys(categories),
                    datasets: [{
                        data: Object.values(categories),
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }

        function setGoal() {
            goal = parseFloat(document.getElementById('goal-amount').value) || 0;
            localStorage.setItem('goal', goal);
            updateGoalDisplay();
        }

        function updateGoalDisplay() {
            const display = document.getElementById('goal-display');
            if (goal > 0) {
                const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
                const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
                const savings = totalIncome - totalExpense;
                display.innerHTML = `<div class="goal">Goal: $${goal} | Current Savings: $${savings.toFixed(2)}</div>`;
            } else {
                display.innerHTML = '';
            }
        }

        function checkAlerts() {
            const alertsDiv = document.getElementById('alerts');
            alertsDiv.innerHTML = '';

            const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

            if (totalExpense > totalIncome) {
                alertsDiv.innerHTML += '<div class="alert">Alert: Your expenses exceed your income!</div>';
            }

            if (goal > 0 && (totalIncome - totalExpense) < goal) {
                alertsDiv.innerHTML += '<div class="alert">Alert: You are not meeting your savings goal!</div>';
            }
        }

        updateUI();
    