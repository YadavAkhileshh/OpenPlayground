const game = new WordDetective();
const gridContainer = document.getElementById("gridContainer");
const letterDisplay = document.getElementById("letterDisplay");
const clueText = document.getElementById("clueText");
const difficultyBadge = document.getElementById("difficultyBadge");
const casesSolved = document.getElementById("casesSolved");
const successRate = document.getElementById("successRate");
const streak = document.getElementById("streak");
const foundWords = document.getElementById("foundWords");
const submitBtn = document.getElementById("submitBtn");
const clearBtn = document.getElementById("clearBtn");
const hintBtn = document.getElementById("hintBtn");
const newCaseBtn = document.getElementById("newCaseBtn");
const victoryModal = document.getElementById("victoryModal");
const nextCaseBtn = document.getElementById("nextCaseBtn");

function init() {
  startNewCase();
  submitBtn.addEventListener("click", handleSubmit);
  clearBtn.addEventListener("click", handleClear);
  hintBtn.addEventListener("click", handleHint);
  newCaseBtn.addEventListener("click", startNewCase);
  nextCaseBtn.addEventListener("click", () => {
    victoryModal.classList.add("hidden");
    startNewCase();
  });
}

function startNewCase() {
  const caseData = game.newCase();
  clueText.textContent = caseData.clue;
  difficultyBadge.textContent = caseData.difficulty;
  renderGrid();
  updateDisplay();
}

function renderGrid() {
  gridContainer.innerHTML = "";
  game.grid.forEach((letter, index) => {
    const tile = document.createElement("div");
    tile.className = "letter-tile";
    tile.textContent = letter;
    tile.addEventListener("click", () => handleTileClick(index, tile));
    gridContainer.appendChild(tile);
  });
}

function handleTileClick(index, tile) {
  if (game.selectLetter(index)) {
    tile.classList.add("selected");
    updateDisplay();
  }
}

function handleClear() {
  game.clearSelection();
  document.querySelectorAll(".letter-tile").forEach((tile) => {
    tile.classList.remove("selected");
  });
  updateDisplay();
}

function handleSubmit() {
  const result = game.submitWord();
  if (result.success) {
    document.querySelectorAll(".letter-tile.selected").forEach((tile) => {
      tile.classList.add("found");
    });
    setTimeout(() => showVictory(result.word), 500);
  } else {
    document.querySelectorAll(".letter-tile.selected").forEach((tile) => {
      tile.style.animation = "shake 0.3s";
    });
    handleClear();
  }
  updateStats();
}

function handleHint() {
  const hintIndex = game.getHint();
  if (hintIndex !== null) {
    const tiles = document.querySelectorAll(".letter-tile");
    tiles[hintIndex].style.background = "#F4D03F";
    hintBtn.textContent = `Hint (${game.hintsLeft} left)`;
  }
}

function updateDisplay() {
  const word = game.getSelectedWord();
  letterDisplay.innerHTML =
    word || '<span class="empty-hint">Click letters to form word...</span>';
}

function updateStats() {
  casesSolved.textContent = game.stats.solved;
  successRate.textContent =
    game.stats.attempts > 0
      ? Math.round((game.stats.solved / game.stats.attempts) * 100) + "%"
      : "0%";
  streak.textContent = game.stats.streak;
}

function showVictory(word) {
  document.getElementById("mysteryWord").textContent = word;
  document.getElementById("wordsFoundCount").textContent =
    game.foundWords.length;
  victoryModal.classList.remove("hidden");
}

window.addEventListener("load", init);
