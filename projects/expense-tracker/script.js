let titleInput = document.getElementById("title");
let amountInput = document.getElementById("amount");
let typeSelect = document.getElementById("type");
let categorySelect = document.getElementById("category");
let list = document.getElementById("list");
let balanceText = document.getElementById("balance");
let canvas = document.getElementById("chart");
let ctx = canvas.getContext("2d");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

display();
drawChart();

function addTransaction() {
  if(titleInput.value === "" || amountInput.value === "") return;

  let transaction = {
    title: titleInput.value,
    amount: Number(amountInput.value),
    type: typeSelect.value,
    category: categorySelect.value
  };

  transactions.push(transaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));

  titleInput.value = "";
  amountInput.value = "";

  display();
  drawChart();
}

function display() {
  list.innerHTML = "";
  let balance = 0;

  transactions.forEach((t, index) => {
    let li = document.createElement("li");
    li.innerHTML = `
      ${t.title} (${t.category}) - ${t.type === "income" ? "+" : "-"}₹${t.amount}
      <button onclick="deleteTransaction(${index})">❌</button>
    `;
    list.appendChild(li);

    balance += t.type === "income" ? t.amount : -t.amount;
  });

  balanceText.innerText = "Balance: ₹" + balance;
}

function deleteTransaction(index) {
  transactions.splice(index, 1);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  display();
  drawChart();
}

function drawChart() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  let income = transactions.filter(t=>t.type==="income").reduce((a,b)=>a+b.amount,0);
  let expense = transactions.filter(t=>t.type==="expense").reduce((a,b)=>a+b.amount,0);
  let total = income + expense;

  if(total === 0) return;

  let incomeAngle = (income/total) * Math.PI * 2;

  // Income
  ctx.beginPath();
  ctx.moveTo(150,100);
  ctx.arc(150,100,80,0,incomeAngle);
  ctx.fillStyle = "#00ff99";
  ctx.fill();

  // Expense
  ctx.beginPath();
  ctx.moveTo(150,100);
  ctx.arc(150,100,80,incomeAngle,Math.PI*2);
  ctx.fillStyle = "#ff5f5f";
  ctx.fill();
}