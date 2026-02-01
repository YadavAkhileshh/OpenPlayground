let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

const list = document.getElementById("list");
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");

function addTransaction() {
  const text = document.getElementById("text").value;
  const amount = +document.getElementById("amount").value;

  if (text === "" || amount === 0) {
    alert("Please enter valid details");
    return;
  }

  const transaction = {
    id: Date.now(),
    text,
    amount
  };

  transactions.push(transaction);
  updateLocalStorage();
  renderTransactions();
}

function removeTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  updateLocalStorage();
  renderTransactions();
}

function renderTransactions() {
  list.innerHTML = "";

  transactions.forEach(t => {
    const sign = t.amount < 0 ? "-" : "+";
    const item = document.createElement("li");

    item.classList.add(t.amount < 0 ? "minus" : "plus");

    item.innerHTML = `
      ${t.text}
      <span>${sign}₹${Math.abs(t.amount)}</span>
      <button onclick="removeTransaction(${t.id})">x</button>
    `;

    list.appendChild(item);
  });

  updateBalance();
}

function updateBalance() {
  const amounts = transactions.map(t => t.amount);
  const total = amounts.reduce((a, b) => a + b, 0);
  const inc = amounts.filter(a => a > 0).reduce((a, b) => a + b, 0);
  const exp = amounts.filter(a => a < 0).reduce((a, b) => a + b, 0);

  balance.innerText = `₹${total}`;
  income.innerText = `₹${inc}`;
  expense.innerText = `₹${Math.abs(exp)}`;
}

function updateLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

renderTransactions();
