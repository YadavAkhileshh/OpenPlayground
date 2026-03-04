const statusText = document.getElementById("statusText");
const container = document.getElementById("coinsContainer");

const coins = [50, 20, 10, 5, 2, 1];

function sleep(ms){
  return new Promise(r => setTimeout(r, ms));
}

// Create coin UI
function addCoin(value){
  const coin = document.createElement("div");
  coin.className = "coin";
  coin.textContent = value;
  container.appendChild(coin);
}

// Greedy Algorithm (Coin Change)
async function runGreedy(){
  container.innerHTML = "";

  let amount = Number(document.getElementById("amountInput").value);
  if(amount <= 0) return;

  let selected = [];
  let total = 0;

  statusText.textContent = "Running Greedy Algorithm...";

  for(let coin of coins){
    while(amount >= coin){
      amount -= coin;
      selected.push(coin);
      total += coin;

      addCoin(coin);

      statusText.textContent =
        `Selected Coins: ${selected.join(", ")} | Total = ${total}`;

      await sleep(400);
    }
  }

  statusText.textContent =
    `✔ Completed! Coins Used: ${selected.length} | Total = ${total}`;
}

document.getElementById("startBtn").onclick = runGreedy;