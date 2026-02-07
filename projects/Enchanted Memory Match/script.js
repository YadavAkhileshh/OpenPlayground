// Main Game Controller
const game = new MemoryGame();
const particleSystem = new ParticleSystem(document.getElementById("particles"));

// DOM Elements
const cardGrid = document.getElementById("cardGrid");
const startOverlay = document.getElementById("startOverlay");
const winOverlay = document.getElementById("winOverlay");
const startBtn = document.getElementById("startBtn");
const replayBtn = document.getElementById("replayBtn");
const resetBtn = document.getElementById("resetBtn");
const timerDisplay = document.getElementById("timer");
const movesDisplay = document.getElementById("moves");
const pairsDisplay = document.getElementById("pairs");
const finalTimeDisplay = document.getElementById("finalTime");
const finalMovesDisplay = document.getElementById("finalMoves");
const difficultyBtns = document.querySelectorAll(".difficulty-btn");

let selectedDifficulty = "easy";

// Initialize
function init() {
  particleSystem.createFloatingParticles(30);
  setupEventListeners();
}

function setupEventListeners() {
  startBtn.addEventListener("click", startGame);
  replayBtn.addEventListener("click", () => {
    winOverlay.classList.add("hidden");
    startGame();
  });
  resetBtn.addEventListener("click", resetGame);

  difficultyBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      difficultyBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedDifficulty = btn.dataset.level;
    });
  });
}

function startGame() {
  startOverlay.style.display = "none";

  // Initialize game
  game.init(selectedDifficulty);

  // Set up callbacks
  game.setOnMatch((index1, index2) => {
    handleMatch(index1, index2);
  });

  game.setOnNoMatch((index1, index2) => {
    handleNoMatch(index1, index2);
  });

  game.setOnTimerUpdate((time) => {
    timerDisplay.textContent = game.getFormattedTime();
  });

  game.setOnWin((stats) => {
    handleWin(stats);
  });

  // Render cards
  renderCards();

  // Start timer on first move
  let firstMove = true;
  const originalFlipCard = game.flipCard.bind(game);
  game.flipCard = function (index) {
    if (firstMove && originalFlipCard(index)) {
      firstMove = false;
      game.startTimer();
      return true;
    }
    return originalFlipCard(index);
  };

  // Update display
  updateDisplay();
}

function renderCards() {
  cardGrid.innerHTML = "";

  // Set grid class based on difficulty
  cardGrid.className = "card-grid";
  if (selectedDifficulty === "medium") {
    cardGrid.classList.add("medium");
  } else if (selectedDifficulty === "hard") {
    cardGrid.classList.add("hard");
  }

  game.cards.forEach((card, index) => {
    const cardElement = createCardElement(card, index);
    cardGrid.appendChild(cardElement);
  });
}

function createCardElement(card, index) {
  const cardDiv = document.createElement("div");
  cardDiv.className = "memory-card";
  cardDiv.dataset.index = index;

  cardDiv.innerHTML = `
        <div class="card-inner">
            <div class="card-face card-front"></div>
            <div class="card-face card-back">${card.symbol}</div>
        </div>
    `;

  cardDiv.addEventListener("click", () => handleCardClick(index, cardDiv));

  return cardDiv;
}

function handleCardClick(index, cardElement) {
  if (game.flipCard(index)) {
    cardElement.classList.add("flipped");
    playClickSound(cardElement);
    updateDisplay();
  }
}

function playClickSound(element) {
  // Create ripple effect
  const rect = element.getBoundingClientRect();
  const ripple = document.createElement("div");
  ripple.className = "ripple-effect";
  ripple.style.left = rect.left + rect.width / 2 + "px";
  ripple.style.top = rect.top + rect.height / 2 + "px";
  document.body.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

function handleMatch(index1, index2) {
  const card1 = cardGrid.querySelector(`[data-index="${index1}"]`);
  const card2 = cardGrid.querySelector(`[data-index="${index2}"]`);

  // Add matched class
  setTimeout(() => {
    card1.classList.add("matched");
    card2.classList.add("matched");

    // Create sparkle effects
    const rect1 = card1.getBoundingClientRect();
    const rect2 = card2.getBoundingClientRect();

    particleSystem.createSparkles(
      rect1.left + rect1.width / 2,
      rect1.top + rect1.height / 2,
      12,
    );

    particleSystem.createSparkles(
      rect2.left + rect2.width / 2,
      rect2.top + rect2.height / 2,
      12,
    );
  }, 500);

  updateDisplay();
}

function handleNoMatch(index1, index2) {
  const card1 = cardGrid.querySelector(`[data-index="${index1}"]`);
  const card2 = cardGrid.querySelector(`[data-index="${index2}"]`);

  // Flip cards back
  setTimeout(() => {
    card1.classList.remove("flipped");
    card2.classList.remove("flipped");
  }, 1000);
}

function handleWin(stats) {
  setTimeout(() => {
    finalTimeDisplay.textContent = stats.formattedTime;
    finalMovesDisplay.textContent = stats.moves;
    winOverlay.classList.remove("hidden");

    // Create celebration effect
    const winCard = document.querySelector(".win-card");
    const rect = winCard.getBoundingClientRect();
    particleSystem.createBurst(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      30,
    );
  }, 1000);
}

function updateDisplay() {
  movesDisplay.textContent = game.moves;
  pairsDisplay.textContent = `${game.matchedPairs}/${game.cards.length / 2}`;
}

function resetGame() {
  game.reset();
  startOverlay.style.display = "flex";
  cardGrid.innerHTML = "";
  timerDisplay.textContent = "0:00";
  movesDisplay.textContent = "0";
  pairsDisplay.textContent = "0/0";
}

// Create magic cursor trail
let lastTrailTime = 0;
document.addEventListener("mousemove", (e) => {
  const now = Date.now();
  if (now - lastTrailTime > 50) {
    lastTrailTime = now;

    const trail = document.createElement("div");
    trail.className = "magic-trail";
    trail.style.left = e.pageX + "px";
    trail.style.top = e.pageY + "px";
    document.body.appendChild(trail);

    setTimeout(() => trail.remove(), 1000);
  }
});

// Initialize on load
window.addEventListener("load", init);
