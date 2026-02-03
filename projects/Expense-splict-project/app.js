// Advanced Expense Split Project JavaScript
// Features: Custom split, edit/delete expenses, persistent data, better UX

document.addEventListener('DOMContentLoaded', function () {
  const personForm = document.getElementById('personForm');
  const personNameInput = document.getElementById('personName');
  const peopleListDiv = document.getElementById('peopleList');
  const expenseForm = document.getElementById('expenseForm');
  const expenseDescInput = document.getElementById('expenseDesc');
  const expenseAmountInput = document.getElementById('expenseAmount');
  const expensePayerSelect = document.getElementById('expensePayer');
  const expenseTableBody = document.querySelector('#expenseTable tbody');
  const splitSummaryDiv = document.getElementById('splitSummary');
  const summaryList = document.getElementById('summaryList');

  let people = JSON.parse(localStorage.getItem('splitPeople') || '[]');
  let expenses = JSON.parse(localStorage.getItem('splitExpenses') || '[]');

  // Add person
  personForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = personNameInput.value.trim();
    if (name && !people.includes(name)) {
      people.push(name);
      personNameInput.value = '';
      saveData();
      renderPeople();
      renderPayerOptions();
      updateSplitSummary();
    }
  });

  // Remove person (click badge)
  peopleListDiv.addEventListener('click', function (e) {
    if (e.target.classList.contains('person-badge')) {
      const name = e.target.textContent;
      people = people.filter(p => p !== name);
      expenses = expenses.filter(exp => exp.payer !== name && exp.splitAmong.every(sa => sa !== name));
      saveData();
      renderPeople();
      renderPayerOptions();
      renderExpenses();
      updateSplitSummary();
    }
  });

  // Add expense
  expenseForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const desc = expenseDescInput.value.trim();
    const amount = parseFloat(expenseAmountInput.value);
    const payer = expensePayerSelect.value;
    if (!desc || isNaN(amount) || amount <= 0 || !payer) return;
    // Custom split: prompt for split among
    let splitAmong = [...people];
    if (people.length > 1) {
      const selected = prompt(`Enter names to split among (comma separated, default: all):\n${people.join(', ')}`);
      if (selected) {
        const arr = selected.split(',').map(s => s.trim()).filter(s => people.includes(s));
        if (arr.length > 0) splitAmong = arr;
      }
    }
    expenses.push({ desc, amount, payer, splitAmong });
    expenseDescInput.value = '';
    expenseAmountInput.value = '';
    saveData();
    renderExpenses();
    updateSplitSummary();
  });

  // Edit/delete expense
  expenseTableBody.addEventListener('click', function (e) {
    const idx = parseInt(e.target.dataset.idx);
    if (e.target.classList.contains('edit-expense')) {
      const exp = expenses[idx];
      const newDesc = prompt('Edit description:', exp.desc);
      const newAmount = parseFloat(prompt('Edit amount:', exp.amount));
      const newPayer = prompt('Edit payer:', exp.payer);
      let newSplit = exp.splitAmong;
      if (people.length > 1) {
        const selected = prompt(`Edit split among (comma separated):\n${people.join(', ')}`, exp.splitAmong.join(', '));
        if (selected) {
          const arr = selected.split(',').map(s => s.trim()).filter(s => people.includes(s));
          if (arr.length > 0) newSplit = arr;
        }
      }
      if (newDesc && !isNaN(newAmount) && newAmount > 0 && newPayer && people.includes(newPayer)) {
        expenses[idx] = { desc: newDesc, amount: newAmount, payer: newPayer, splitAmong: newSplit };
        saveData();
        renderExpenses();
        updateSplitSummary();
      }
    } else if (e.target.classList.contains('delete-expense')) {
      if (confirm('Delete this expense?')) {
        expenses.splice(idx, 1);
        saveData();
        renderExpenses();
        updateSplitSummary();
      }
    }
  });

  function renderPeople() {
    peopleListDiv.innerHTML = people.map(p => `<span class="person-badge" title="Click to remove">${p}</span>`).join('');
  }

  function renderPayerOptions() {
    expensePayerSelect.innerHTML = people.map(p => `<option value="${p}">${p}</option>`).join('');
  }

  function renderExpenses() {
    expenseTableBody.innerHTML = expenses.map((exp, idx) => `
      <tr>
        <td>${exp.desc}</td>
        <td>₹${exp.amount.toFixed(2)}</td>
        <td>${exp.payer}</td>
        <td>${exp.splitAmong.join(', ')}</td>
        <td>
          <button class="edit-expense" data-idx="${idx}" title="Edit">✏️</button>
          <button class="delete-expense" data-idx="${idx}" title="Delete">🗑️</button>
        </td>
      </tr>
    `).join('');
  }

  function updateSplitSummary() {
    // Calculate net balances
    const balances = {};
    people.forEach(p => balances[p] = 0);
    expenses.forEach(exp => {
      const share = exp.amount / exp.splitAmong.length;
      exp.splitAmong.forEach(person => {
        if (person !== exp.payer) {
          balances[person] -= share;
        }
      });
      balances[exp.payer] += exp.amount - share * (exp.splitAmong.length - 1);
    });
    // Settlement logic
    const settlements = [];
    const creditors = Object.entries(balances).filter(([_, bal]) => bal > 0).sort((a,b) => b[1]-a[1]);
    const debtors = Object.entries(balances).filter(([_, bal]) => bal < 0).sort((a,b) => a[1]-b[1]);
    let i = 0, j = 0;
    while (i < creditors.length && j < debtors.length) {
      const [cName, cAmt] = creditors[i];
      const [dName, dAmt] = debtors[j];
      const settleAmt = Math.min(cAmt, -dAmt);
      if (settleAmt > 0.01) {
        settlements.push(`${dName} pays ₹${settleAmt.toFixed(2)} to ${cName}`);
      }
      creditors[i][1] -= settleAmt;
      debtors[j][1] += settleAmt;
      if (creditors[i][1] < 0.01) i++;
      if (debtors[j][1] > -0.01) j++;
    }
    summaryList.innerHTML = settlements.length ? settlements.map(s => `<li>${s}</li>`).join('') : '<li>No settlements needed.</li>';
  }

  function saveData() {
    localStorage.setItem('splitPeople', JSON.stringify(people));
    localStorage.setItem('splitExpenses', JSON.stringify(expenses));
  }

  // Initial render
  renderPeople();
  renderPayerOptions();
  renderExpenses();
  updateSplitSummary();
});
