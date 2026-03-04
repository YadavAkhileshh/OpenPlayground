const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const savingsEl = document.getElementById("savings");

const incomeBar = document.getElementById("incomeBar");
const expenseBar = document.getElementById("expenseBar");
const savingsBar = document.getElementById("savingsBar");

const btn = document.getElementById("updateBtn");

btn.addEventListener("click", ()=>{
    const income = Math.floor(Math.random()*5000)+2000;
    const expense = Math.floor(Math.random()*3000)+1000;
    const savings = income - expense;

    incomeEl.textContent = income;
    expenseEl.textContent = expense;
    savingsEl.textContent = savings;

    incomeBar.style.width = "100%";
    expenseBar.style.width = (expense/income*100)+"%";
    savingsBar.style.width = (savings/income*100)+"%";
});
