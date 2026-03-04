// Game state
const gameState = {
  moves: 0,
  matches: 0,
  totalPairs: 8,
  difficulty: "easy",
  timeElapsed: 0,
  timerInterval: null,
  isRunning: false,
};

// UI Elements
const elements = {
  gameBoard: document.getElementById("gameBoard"),
  movesDisplay: document.getElementById("moves"),
  matchesDisplay: document.getElementById("matches"),
  timerDisplay: document.getElementById("timer"),
  newGameBtn: document.getElementById("newGameBtn"),
  easyBtn: document.getElementById("easyBtn"),
  mediumBtn: document.getElementById("mediumBtn"),
  hardBtn: document.getElementById("hardBtn"),
  winModal: document.getElementById("winModal"),
  playAgainBtn: document.getElementById("playAgainBtn"),
  finalMoves: document.getElementById("finalMoves"),
  finalTime: document.getElementById("finalTime"),
};

// Update UI
function updateUI() {
  elements.movesDisplay.textContent = gameState.moves;
  elements.matchesDisplay.textContent = `${gameState.matches}/${gameState.totalPairs}`;

  const minutes = Math.floor(gameState.timeElapsed / 60);
  const seconds = gameState.timeElapsed % 60;
  elements.timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// Start timer
function startTimer() {
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
  }

  gameState.timerInterval = setInterval(() => {
    gameState.timeElapsed++;
    updateUI();
  }, 1000);
}

// Stop timer
function stopTimer() {
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = null;
  }
}

// Reset game
function resetGame() {
  gameState.moves = 0;
  gameState.matches = 0;
  gameState.timeElapsed = 0;
  gameState.isRunning = false;
  stopTimer();
  updateUI();
}

// Show win modal
function showWinModal() {
  elements.finalMoves.textContent = gameState.moves;
  const minutes = Math.floor(gameState.timeElapsed / 60);
  const seconds = gameState.timeElapsed % 60;
  elements.finalTime.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  elements.winModal.classList.remove("hidden");
}

// Hide win modal
function hideWinModal() {
  elements.winModal.classList.add("hidden");
}

// Set difficulty
function setDifficulty(difficulty) {
  gameState.difficulty = difficulty;

  // Update active button
  document.querySelectorAll(".difficulty-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  if (difficulty === "easy") {
    gameState.totalPairs = 8;
    elements.easyBtn.classList.add("active");
    elements.gameBoard.className = "game-board easy";
  } else if (difficulty === "medium") {
    gameState.totalPairs = 12;
    elements.mediumBtn.classList.add("active");
    elements.gameBoard.className = "game-board medium";
  } else {
    gameState.totalPairs = 16;
    elements.hardBtn.classList.add("active");
    elements.gameBoard.className = "game-board hard";
  }

  newGame();
}

// Event listeners
elements.newGameBtn.addEventListener("click", newGame);
elements.easyBtn.addEventListener("click", () => setDifficulty("easy"));
elements.mediumBtn.addEventListener("click", () => setDifficulty("medium"));
elements.hardBtn.addEventListener("click", () => setDifficulty("hard"));
elements.playAgainBtn.addEventListener("click", () => {
  hideWinModal();
  newGame();
});

// Initialize
updateUI();
