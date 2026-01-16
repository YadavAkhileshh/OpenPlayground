// DOM Elements
const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const restartBtn = document.getElementById("restart");
const resetScoresBtn = document.getElementById("reset-scores");
const modeBtns = document.querySelectorAll(".mode-btn");
const difficultyContainer = document.getElementById("difficulty-container");
const symbolContainer = document.getElementById("symbol-container");
const diffBtns = document.querySelectorAll(".option-btn");
const symbolBtns = document.querySelectorAll(".symbol-btn");
const shareContainer = document.getElementById("share-container");
const winningLineSvg = document.getElementById("winning-line-svg");
const winningLine = document.getElementById("winning-line");
const confettiCanvas = document.getElementById("confetti-canvas");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toast-message");

// Score elements
const scoreX = document.getElementById("score-x");
const scoreO = document.getElementById("score-o");
const scoreDraws = document.getElementById("score-draws");
const playerXLabel = document.getElementById("player-x-label");
const playerOLabel = document.getElementById("player-o-label");
const totalGamesEl = document.getElementById("total-games");
const winRateEl = document.getElementById("win-rate");

// Share button elements - Get them safely
const shareTwitterBtn = document.getElementById("share-twitter");
const shareWhatsappBtn = document.getElementById("share-whatsapp");
const shareFacebookBtn = document.getElementById("share-facebook");
const shareTelegramBtn = document.getElementById("share-telegram");
const shareCopyBtn = document.getElementById("share-copy");

// Game State
let currentPlayer = "X";
let gameActive = true;
let gameState = ["", "", "", "", "", "", "", "", ""];
let gameMode = "pvp";
let difficulty = "easy";
let playerSymbol = "X";
let computerSymbol = "O";
let scores = { X: 0, O: 0, draws: 0 };
let lastWinner = null;
let winningCombination = null;

// Winning Conditions
const winningConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// Line positions for winning combinations
const linePositions = {
  0: { x1: 10, y1: 16.67, x2: 90, y2: 16.67 },
  1: { x1: 10, y1: 50, x2: 90, y2: 50 },
  2: { x1: 10, y1: 83.33, x2: 90, y2: 83.33 },
  3: { x1: 16.67, y1: 10, x2: 16.67, y2: 90 },
  4: { x1: 50, y1: 10, x2: 50, y2: 90 },
  5: { x1: 83.33, y1: 10, x2: 83.33, y2: 90 },
  6: { x1: 10, y1: 10, x2: 90, y2: 90 },
  7: { x1: 90, y1: 10, x2: 10, y2: 90 },
};

// Initialize
function init() {
  loadScores();
  updateScoreDisplay();
  updateLabels();
  updateStats();
  setupEventListeners();
}

// Setup all event listeners safely
function setupEventListeners() {
  // Cell click events
  cells.forEach((cell) => cell.addEventListener("click", handleCellClick));

  // Button events with null checks
  if (restartBtn) {
    restartBtn.addEventListener("click", restartGame);
  }

  if (resetScoresBtn) {
    resetScoresBtn.addEventListener("click", resetScores);
  }

  // Mode buttons
  modeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      modeBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      gameMode = btn.dataset.mode;

      if (gameMode === "pvc") {
        difficultyContainer.classList.remove("hidden");
        symbolContainer.classList.remove("hidden");
      } else {
        difficultyContainer.classList.add("hidden");
        symbolContainer.classList.add("hidden");
      }

      updateLabels();
      restartGame();
    });
  });

  // Difficulty buttons
  diffBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      diffBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      difficulty = btn.dataset.difficulty;
      restartGame();
    });
  });

  // Symbol buttons
  symbolBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      symbolBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      playerSymbol = btn.dataset.symbol;
      computerSymbol = playerSymbol === "X" ? "O" : "X";
      updateLabels();
      restartGame();
    });
  });

  // Share buttons - with null checks to prevent errors
  if (shareTwitterBtn) {
    shareTwitterBtn.addEventListener("click", shareToTwitter);
  }

  if (shareWhatsappBtn) {
    shareWhatsappBtn.addEventListener("click", shareToWhatsApp);
  }

  if (shareFacebookBtn) {
    shareFacebookBtn.addEventListener("click", shareToFacebook);
  }

  if (shareTelegramBtn) {
    shareTelegramBtn.addEventListener("click", shareToTelegram);
  }

  if (shareCopyBtn) {
    shareCopyBtn.addEventListener("click", copyShareLink);
  }

  // Window resize event
  window.addEventListener("resize", handleResize);
}

// Game Functions
function handleCellClick(e) {
  const cell = e.target.closest(".cell");
  if (!cell) return;

  const index = parseInt(cell.getAttribute("data-index"));

  if (gameState[index] !== "" || !gameActive) {
    return;
  }

  if (gameMode === "pvc" && currentPlayer !== playerSymbol) {
    return;
  }

  makeMove(cell, index);

  if (gameActive && gameMode === "pvc") {
    setTimeout(computerMove, 600);
  }
}

function makeMove(cell, index) {
  gameState[index] = currentPlayer;

  // Create icon element
  const icon = document.createElement("i");
  if (currentPlayer === "X") {
    icon.className = "fas fa-times";
  } else {
    icon.className = "far fa-circle";
  }

  cell.innerHTML = "";
  cell.appendChild(icon);
  cell.classList.add("taken", currentPlayer.toLowerCase(), "pop");

  checkResult();
}

function computerMove() {
  if (!gameActive) return;

  const board = document.getElementById("board");
  if (board) {
    board.classList.add("thinking");
  }

  setTimeout(() => {
    if (board) {
      board.classList.remove("thinking");
    }

    let move;

    switch (difficulty) {
      case "easy":
        move = getRandomMove();
        break;
      case "medium":
        move = Math.random() > 0.4 ? getBestMove() : getRandomMove();
        break;
      case "hard":
        move = getBestMove();
        break;
      default:
        move = getRandomMove();
    }

    if (move !== null && move !== undefined) {
      const cell = document.querySelector(`[data-index="${move}"]`);
      if (cell) {
        makeMove(cell, move);
      }
    }
  }, 400);
}

function getRandomMove() {
  const availableMoves = gameState
    .map((cell, index) => (cell === "" ? index : null))
    .filter((index) => index !== null);

  if (availableMoves.length === 0) return null;

  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function getBestMove() {
  let bestScore = -Infinity;
  let bestMove = null;

  for (let i = 0; i < 9; i++) {
    if (gameState[i] === "") {
      gameState[i] = computerSymbol;
      let score = minimax(gameState, 0, false);
      gameState[i] = "";

      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }

  return bestMove;
}

function minimax(board, depth, isMaximizing) {
  const result = checkWinner(board);

  if (result !== null) {
    if (result === computerSymbol) return 10 - depth;
    if (result === playerSymbol) return depth - 10;
    return 0;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = computerSymbol;
        let score = minimax(board, depth + 1, false);
        board[i] = "";
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = playerSymbol;
        let score = minimax(board, depth + 1, true);
        board[i] = "";
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function checkWinner(board) {
  for (let condition of winningConditions) {
    const [a, b, c] = condition;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  if (!board.includes("")) return "draw";
  return null;
}

function checkResult() {
  let roundWon = false;
  winningCombination = null;

  for (let i = 0; i < winningConditions.length; i++) {
    const condition = winningConditions[i];
    const a = gameState[condition[0]];
    const b = gameState[condition[1]];
    const c = gameState[condition[2]];

    if (a === "" || b === "" || c === "") {
      continue;
    }

    if (a === b && b === c) {
      roundWon = true;
      winningCombination = i;
      break;
    }
  }

  if (roundWon) {
    let winnerName;
    if (gameMode === "pvc") {
      winnerName =
        currentPlayer === playerSymbol ? "You Win!" : "Computer Wins!";
    } else {
      winnerName = `Player ${currentPlayer} Wins!`;
    }

    if (statusText) {
      statusText.innerHTML = `<i class="fas fa-trophy"></i> ${winnerName}`;
      statusText.classList.add("winner");
    }

    gameActive = false;
    lastWinner = currentPlayer;

    scores[currentPlayer]++;
    saveScores();
    updateScoreDisplay();
    updateStats();

    highlightWinningCells(winningConditions[winningCombination]);
    drawWinningLine(winningCombination);

    startCelebration();

    // Show share container after delay
    setTimeout(() => {
      if (shareContainer) {
        shareContainer.classList.remove("hidden");
      }
    }, 800);

    return;
  }

  if (!gameState.includes("")) {
    if (statusText) {
      statusText.innerHTML = `<i class="fas fa-handshake"></i> It's a Draw!`;
    }
    gameActive = false;
    scores.draws++;
    saveScores();
    updateScoreDisplay();
    updateStats();
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateStatusText();
}

function updateStatusText() {
  if (!statusText) return;

  if (gameMode === "pvc") {
    if (currentPlayer === playerSymbol) {
      statusText.innerHTML = `<i class="fas fa-user"></i> Your Turn (${playerSymbol})`;
    } else {
      statusText.innerHTML = `<i class="fas fa-robot"></i> Computer's Turn`;
    }
  } else {
    const icon = currentPlayer === "X" ? "fas fa-times" : "far fa-circle";
    statusText.innerHTML = `<i class="${icon}"></i> Player ${currentPlayer}'s Turn`;
  }
}

function highlightWinningCells(cellsToHighlight) {
  if (!cellsToHighlight) return;

  cellsToHighlight.forEach((index) => {
    const cell = document.querySelector(`[data-index="${index}"]`);
    if (cell) {
      cell.classList.add("winner");
    }
  });
}

function drawWinningLine(combinationIndex) {
  if (!winningLineSvg || !winningLine || combinationIndex === null) return;

  const pos = linePositions[combinationIndex];
  if (!pos) return;

  const width = winningLineSvg.clientWidth || 336;
  const height = winningLineSvg.clientHeight || 336;

  winningLine.setAttribute("x1", (pos.x1 / 100) * width);
  winningLine.setAttribute("y1", (pos.y1 / 100) * height);
  winningLine.setAttribute("x2", (pos.x2 / 100) * width);
  winningLine.setAttribute("y2", (pos.y2 / 100) * height);

  winningLine.classList.add("animate");
}

function restartGame() {
  currentPlayer = "X";
  gameActive = true;
  gameState = ["", "", "", "", "", "", "", "", ""];
  lastWinner = null;
  winningCombination = null;

  if (statusText) {
    statusText.classList.remove("winner");
  }
  updateStatusText();

  cells.forEach((cell) => {
    cell.innerHTML = "";
    cell.classList.remove("taken", "x", "o", "winner", "pop");
  });

  if (winningLine) {
    winningLine.classList.remove("animate");
    winningLine.setAttribute("x1", 0);
    winningLine.setAttribute("y1", 0);
    winningLine.setAttribute("x2", 0);
    winningLine.setAttribute("y2", 0);
  }

  if (shareContainer) {
    shareContainer.classList.add("hidden");
  }

  stopCelebration();

  if (gameMode === "pvc" && playerSymbol === "O") {
    setTimeout(computerMove, 500);
  }
}

function resetScores() {
  scores = { X: 0, O: 0, draws: 0 };
  saveScores();
  updateScoreDisplay();
  updateStats();
  showToast("Scores reset successfully!");
}

function updateScoreDisplay() {
  if (scoreX) scoreX.textContent = scores.X;
  if (scoreO) scoreO.textContent = scores.O;
  if (scoreDraws) scoreDraws.textContent = scores.draws;
}

function updateStats() {
  const total = scores.X + scores.O + scores.draws;

  if (totalGamesEl) {
    totalGamesEl.textContent = total;
  }

  if (winRateEl) {
    if (total > 0) {
      const winRate = Math.round((scores.X / total) * 100);
      winRateEl.textContent = winRate + "%";
    } else {
      winRateEl.textContent = "0%";
    }
  }
}

function updateLabels() {
  if (gameMode === "pvc") {
    if (playerSymbol === "X") {
      if (playerXLabel) playerXLabel.textContent = "You (X)";
      if (playerOLabel) playerOLabel.textContent = "Computer";
    } else {
      if (playerXLabel) playerXLabel.textContent = "Computer";
      if (playerOLabel) playerOLabel.textContent = "You (O)";
    }
  } else {
    if (playerXLabel) playerXLabel.textContent = "Player X";
    if (playerOLabel) playerOLabel.textContent = "Player O";
  }
}

function saveScores() {
  try {
    localStorage.setItem("ticTacToeScores", JSON.stringify(scores));
  } catch (e) {
    console.warn("Could not save scores to localStorage:", e);
  }
}

function loadScores() {
  try {
    const saved = localStorage.getItem("ticTacToeScores");
    if (saved) {
      scores = JSON.parse(saved);
    }
  } catch (e) {
    console.warn("Could not load scores from localStorage:", e);
    scores = { X: 0, O: 0, draws: 0 };
  }
}

// Confetti Celebration
let confettiParticles = [];
let animationId = null;

function startCelebration() {
  if (!confettiCanvas) return;

  const ctx = confettiCanvas.getContext("2d");
  if (!ctx) return;

  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  const colors = [
    "#6366f1",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#8b5cf6",
    "#06b6d4",
    "#f43f5e",
  ];

  // Clear existing particles
  confettiParticles = [];

  for (let i = 0; i < 150; i++) {
    confettiParticles.push({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * confettiCanvas.height - confettiCanvas.height,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 3 + 2,
      angle: Math.random() * Math.PI * 2,
      rotation: Math.random() * 0.2 - 0.1,
      oscillation: Math.random() * 0.5,
      shape: Math.random() > 0.5 ? "rect" : "circle",
    });
  }

  animateConfetti(ctx);
}

function animateConfetti(ctx) {
  if (!confettiCanvas) return;

  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  confettiParticles.forEach((particle) => {
    particle.y += particle.speed;
    particle.x += Math.sin(particle.angle) * particle.oscillation;
    particle.angle += particle.rotation;

    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.angle);
    ctx.fillStyle = particle.color;

    if (particle.shape === "rect") {
      ctx.fillRect(
        -particle.size / 2,
        -particle.size / 2,
        particle.size,
        particle.size / 2
      );
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    if (particle.y > confettiCanvas.height) {
      particle.y = -20;
      particle.x = Math.random() * confettiCanvas.width;
    }
  });

  animationId = requestAnimationFrame(() => animateConfetti(ctx));
}

function stopCelebration() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  confettiParticles = [];

  if (confettiCanvas) {
    const ctx = confettiCanvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }
}

// Share Functions
function getShareText() {
  const winnerText =
    gameMode === "pvc"
      ? lastWinner === playerSymbol
        ? "I just won"
        : "I lost to the computer"
      : `Player ${lastWinner} won`;

  return `🎮 ${winnerText} at Tic Tac Toe! Can you beat me? Play now! 🏆`;
}

function getShareUrl() {
  return window.location.href;
}

function shareToTwitter() {
  const text = encodeURIComponent(getShareText());
  const url = encodeURIComponent(getShareUrl());
  const popup = window.open(
    `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    "_blank"
  );
  if (!popup) {
    showToast("Popup blocked! Please allow popups to share.");
  }
}

function shareToWhatsApp() {
  const text = encodeURIComponent(`${getShareText()} ${getShareUrl()}`);
  const popup = window.open(`https://wa.me/?text=${text}`, "_blank");
  if (!popup) {
    showToast("Popup blocked! Please allow popups to share.");
  }
}

function shareToFacebook() {
  const url = encodeURIComponent(getShareUrl());
  const popup = window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
  if (!popup) {
    showToast("Popup blocked! Please allow popups to share.");
  }
}

function shareToTelegram() {
  const text = encodeURIComponent(getShareText());
  const url = encodeURIComponent(getShareUrl());
  const popup = window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank");
  if (!popup) {
    showToast("Popup blocked! Please allow popups to share.");
  }
}

function copyShareLink() {
  const text = `${getShareText()} ${getShareUrl()}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showToast("Link copied to clipboard!");
      })
      .catch(() => {
        fallbackCopyText(text);
      });
  } else {
    fallbackCopyText(text);
  }
}

function fallbackCopyText(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand("copy");
    showToast("Link copied to clipboard!");
  } catch (err) {
    showToast("Failed to copy link");
  }

  document.body.removeChild(textArea);
}

function showToast(message) {
  if (!toast || !toastMessage) return;

  toastMessage.textContent = message;
  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}

// Handle window resize
function handleResize() {
  if (confettiCanvas) {
    if (
      confettiCanvas.width !== window.innerWidth ||
      confettiCanvas.height !== window.innerHeight
    ) {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    }
  }
}

// Initialize the game when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
