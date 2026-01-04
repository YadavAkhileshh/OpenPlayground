const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const listEl = document.getElementById("list");
const textInput = document.getElementById("text");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const filterSelect = document.getElementById("filter");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let chart;

// ➕ Income
function addIncome() {
  addTransaction(Math.abs(+amountInput.value));
}

// ➖ Expense
function addExpense() {
  addTransaction(-Math.abs(+amountInput.value));
}

function addTransaction(amount) {
  const text = textInput.value.trim();
  const category = categoryInput.value;

  if (!text || amount === 0) {
    alert("Invalid input");
    return;
  }

  transactions.push({
    id: Date.now(),
    text,
    amount,
    category
  });

  saveAndRender();
  textInput.value = "";
  amountInput.value = "";
}

function removeTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveAndRender();
}

function render() {
  listEl.innerHTML = "";
  const filter = filterSelect.value;

  const filtered = filter === "All"
    ? transactions
    : transactions.filter(t => t.category === filter);

  filtered.forEach(t => {
    const li = document.createElement("li");
    li.classList.add(t.amount > 0 ? "plus" : "minus");

    li.innerHTML = `
      <div class="history-left">
        <strong>${t.text}</strong>
        <small>${t.category}</small>
      </div>
      <div class="history-right">
        <span>₹${Math.abs(t.amount)}</span>
        <button class="delete-btn" onclick="removeTransaction(${t.id})">x</button>
      </div>
    `;

    listEl.appendChild(li);
  });

  updateSummary();
  updateChart();
}

function updateSummary() {
  const amounts = transactions.map(t => t.amount);
  const total = amounts.reduce((a, b) => a + b, 0);
  const income = amounts.filter(a => a > 0).reduce((a, b) => a + b, 0);
  const expense = amounts.filter(a => a < 0).reduce((a, b) => a + b, 0);

  balanceEl.innerText = `₹${total}`;
  incomeEl.innerText = `₹${income}`;
  expenseEl.innerText = `₹${Math.abs(expense)}`;
}

function updateChart() {
  const income = transactions.filter(t => t.amount > 0).reduce((a, b) => a + b.amount, 0);
  const expense = Math.abs(transactions.filter(t => t.amount < 0).reduce((a, b) => a + b.amount, 0));

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("expenseChart"), {
    type: "pie",
    data: {
      labels: ["Income", "Expense"],
      datasets: [{
        data: [income, expense],
        backgroundColor: ["#4CAF50", "#e53935"]
      }]
    }
  });
}

function saveAndRender() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  render();
}

render();
