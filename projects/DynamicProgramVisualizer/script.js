const table = document.getElementById("dpTable");
const resultText = document.getElementById("resultText");
const speedSlider = document.getElementById("speed");

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Create table UI
function createTable(n) {
  table.innerHTML = "";
  for (let i = 0; i <= n; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = `dp[${i}] = ?`;
    table.appendChild(cell);
  }
}

function getCells() {
  return document.querySelectorAll(".cell");
}

// Fibonacci DP Visualization
async function fibonacciDP(n) {
  const dp = Array(n + 1).fill(0);
  const cells = getCells();

  dp[0] = 0;
  cells[0].textContent = `dp[0] = 0`;
  cells[0].classList.add("done");

  if (n >= 1) {
    dp[1] = 1;
    cells[1].textContent = `dp[1] = 1`;
    cells[1].classList.add("done");
  }

  for (let i = 2; i <= n; i++) {
    cells[i].classList.add("active");

    await sleep(210 - speedSlider.value);

    dp[i] = dp[i - 1] + dp[i - 2];
    cells[i].textContent = `dp[${i}] = ${dp[i]}`;

    cells[i].classList.remove("active");
    cells[i].classList.add("done");
  }

  resultText.textContent = `Fibonacci(${n}) = ${dp[n]}`;
}

// Start
document.getElementById("startBtn").onclick = async () => {
  const n = Number(document.getElementById("inputN").value);
  if (n < 0) return;

  resultText.textContent = "";
  createTable(n);
  await fibonacciDP(n);
};