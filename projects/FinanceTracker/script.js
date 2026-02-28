let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function updateDashboard() {
  const income = transactions
    .filter(t => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const expense = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);

  document.getElementById("totalIncome").textContent = `₹${income}`;
  document.getElementById("totalExpense").textContent = `₹${expense}`;
  document.getElementById("balance").textContent = `₹${income - expense}`;
}

function renderTransactions() {
  const list = document.getElementById("transactionList");
  list.innerHTML = "";

  transactions.forEach((t, index) => {
    const li = document.createElement("li");
    li.className = t.type;
    li.innerHTML = `
      <span>${t.description} (${t.category})</span>
      <span>₹${t.amount}</span>
    `;
    list.appendChild(li);
  });
}

function addTransaction() {
  const description = document.getElementById("description").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;

  if (!description || !amount) {
    alert("Please fill all fields.");
    return;
  }

  transactions.push({ description, amount, type, category });
  saveTransactions();
  updateDashboard();
  renderTransactions();

  document.getElementById("description").value = "";
  document.getElementById("amount").value = "";
}

updateDashboard();
renderTransactions();
