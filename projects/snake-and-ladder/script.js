const board = document.getElementById("board");
const rollBtn = document.getElementById("rollBtn");
const diceText = document.getElementById("dice");
const statusText = document.getElementById("status");

let cells = [];

// REALISTIC ladders (min 3 steps)
const ladders = {
  3: 22, 8: 26, 20: 38, 27: 56,
  50: 72, 63: 81, 70: 92
};

// REALISTIC snakes
const snakes = {
  17: 7, 32: 10, 48: 30,
  62: 19, 88: 36, 95: 75, 99: 64
};

// Create board
for (let i = 100; i >= 1; i--) {
  const cell = document.createElement("div");
  cell.className = "cell";
  cell.innerHTML = `<span class="num">${i}</span>`;

  if (ladders[i]) {
    cell.classList.add("ladder");
    cell.innerHTML += `<span class="mark">🪜 ↑${ladders[i]}</span>`;
  }

  if (snakes[i]) {
    cell.classList.add("snake");
    cell.innerHTML += `<span class="mark">🐍 ↓${snakes[i]}</span>`;
  }

  board.appendChild(cell);
  cells[i] = cell;
}

let playerPos = [0, 0];
let currentPlayer = 0;

function drawPlayers() {
  document.querySelectorAll(".player1,.player2").forEach(p => p.remove());

  if (playerPos[0] > 0) {
    const p1 = document.createElement("div");
    p1.className = "player1";
    cells[playerPos[0]].appendChild(p1);
  }

  if (playerPos[1] > 0) {
    const p2 = document.createElement("div");
    p2.className = "player2";
    cells[playerPos[1]].appendChild(p2);
  }
}

function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

function movePlayer() {
  const dice = rollDice();
  diceText.innerText = `Dice: ${dice}`;

  let next = playerPos[currentPlayer] + dice;
  if (next > 100) {
    statusText.innerText = "Exact roll needed!";
    switchTurn();
    return;
  }

  playerPos[currentPlayer] = next;

  if (snakes[next]) playerPos[currentPlayer] = snakes[next];
  if (ladders[next]) playerPos[currentPlayer] = ladders[next];

  drawPlayers();

  if (playerPos[currentPlayer] === 100) {
    statusText.innerText = `🎉 Player ${currentPlayer + 1} Wins!`;
    rollBtn.disabled = true;
    return;
  }

  switchTurn();
}

function switchTurn() {
  currentPlayer = currentPlayer === 0 ? 1 : 0;
  statusText.innerText = `Player ${currentPlayer + 1} Turn`;
}

rollBtn.addEventListener("click", movePlayer);
drawPlayers();