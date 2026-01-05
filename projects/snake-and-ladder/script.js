const board = document.getElementById("board");
const diceText = document.getElementById("dice");
const statusText = document.getElementById("status");

let position = 0;

const snakes = {
  17: 7,
  54: 34,
  62: 19,
  98: 79
};

const ladders = {
  3: 22,
  8: 26,
  20: 41,
  28: 84
};

// Build board
for (let i = 100; i >= 1; i--) {
  const cell = document.createElement("div");
  cell.className = "cell";
  cell.id = `cell-${i}`;
  cell.innerText = i;
  board.appendChild(cell);
}

function rollDice() {
  const roll = Math.floor(Math.random() * 6) + 1;
  diceText.innerText = `Dice: ${roll}`;

  let next = position + roll;
  if (next > 100) return;

  position = next;

  if (snakes[position]) {
    position = snakes[position];
    statusText.innerText = "🐍 Snake bite!";
  } else if (ladders[position]) {
    position = ladders[position];
    statusText.innerText = "🪜 Ladder climb!";
  } else {
    statusText.innerText = "Moving...";
  }

  updatePlayer();

  if (position === 100) {
    statusText.innerText = "🎉 You won!";
  }
}

function updatePlayer() {
  document.querySelectorAll(".player").forEach(p => p.remove());
  const cell = document.getElementById(`cell-${position}`);
  if (!cell) return;

  const player = document.createElement("div");
  player.className = "player";
  cell.appendChild(player);
}
