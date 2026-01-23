let currentPlayer = 1;
let scores = { 1: 0, 2: 0 };

function rollDice() {
  const roll = Math.floor(Math.random() * 6) + 1;
  document.getElementById("dice").textContent = `🎲 Rolled: ${roll}`;

  scores[currentPlayer] += roll;
  document.getElementById(`p${currentPlayer}`).textContent = scores[currentPlayer];

  if (scores[currentPlayer] >= 30) {
    alert(`🏆 Player ${currentPlayer} wins!`);
    resetGame();
    return;
  }

  currentPlayer = currentPlayer === 1 ? 2 : 1;
  document.getElementById("turn").textContent = `Player ${currentPlayer}'s Turn`;
}

function resetGame() {
  scores = { 1: 0, 2: 0 };
  currentPlayer = 1;
  document.getElementById("p1").textContent = 0;
  document.getElementById("p2").textContent = 0;
  document.getElementById("turn").textContent = "Player 1's Turn";
}
