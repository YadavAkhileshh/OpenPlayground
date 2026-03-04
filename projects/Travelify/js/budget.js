let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

function displayExpenses() {
  const list = document.getElementById('expenseList');
  list.innerHTML = '';
  let total = 0;
  expenses.forEach((exp, index) => {
    total += parseFloat(exp.amount);
    const li = document.createElement('li');
    li.innerHTML = `${exp.name}: ₹${exp.amount} <button onclick="deleteExpense(${index})">❌</button>`;
    list.appendChild(li);
  });
  document.getElementById('totalAmount').innerText = total;
}

function addExpense() {
  const name = document.getElementById('expenseName').value;
  const amount = document.getElementById('expenseAmount').value;
  if(name && amount) {
    expenses.push({name, amount});
    localStorage.setItem('expenses', JSON.stringify(expenses));
    displayExpenses();
  } else alert('Fill all fields!');
}

function deleteExpense(index) {
  expenses.splice(index,1);
  localStorage.setItem('expenses', JSON.stringify(expenses));
  displayExpenses();
}

displayExpenses();