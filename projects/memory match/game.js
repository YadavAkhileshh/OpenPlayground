// Card symbols
const symbols = [
  "🎮",
  "🎯",
  "🎲",
  "🎪",
  "🎨",
  "🎭",
  "🎸",
  "🎹",
  "🎺",
  "🎻",
  "🎬",
  "🎤",
  "🎧",
  "🎼",
  "🎵",
  "🎶",
];

let cards = [];
let flippedCards = [];
let canFlip = true;

// Shuffle array
function shuffle(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Create card element
function createCard(symbol, index) {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.symbol = symbol;
  card.dataset.index = index;

  card.innerHTML = `
        <div class="card-back"></div>
        <div class="card-face">${symbol}</div>
    `;

  card.addEventListener("click", () => flipCard(card));

  return card;
}

// Initialize game board
function initBoard() {
  elements.gameBoard.innerHTML = "";

  // Create card pairs
  const selectedSymbols = symbols.slice(0, gameState.totalPairs);
  const cardSymbols = shuffle([...selectedSymbols, ...selectedSymbols]);

  // Create and add cards
  cards = cardSymbols.map((symbol, index) => {
    const card = createCard(symbol, index);
    elements.gameBoard.appendChild(card);
    return card;
  });

  flippedCards = [];
  canFlip = true;
}

// Flip card
function flipCard(card) {
  if (!canFlip) return;
  if (card.classList.contains("flipped")) return;
  if (card.classList.contains("matched")) return;
  if (flippedCards.includes(card)) return;

  // Start timer on first move
  if (!gameState.isRunning) {
    gameState.isRunning = true;
    startTimer();
  }

  card.classList.add("flipped");
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    canFlip = false;
    gameState.moves++;
    updateUI();
    checkMatch();
  }
}

// Check for match
function checkMatch() {
  const [card1, card2] = flippedCards;
  const symbol1 = card1.dataset.symbol;
  const symbol2 = card2.dataset.symbol;

  if (symbol1 === symbol2) {
    // Match found
    setTimeout(() => {
      card1.classList.add("matched");
      card2.classList.add("matched");
      flippedCards = [];
      canFlip = true;

      gameState.matches++;
      updateUI();

      // Check win condition
      if (gameState.matches === gameState.totalPairs) {
        setTimeout(() => {
          stopTimer();
          showWinModal();
        }, 500);
      }
    }, 500);
  } else {
    // No match
    setTimeout(() => {
      card1.classList.add("wrong");
      card2.classList.add("wrong");

      setTimeout(() => {
        card1.classList.remove("flipped", "wrong");
        card2.classList.remove("flipped", "wrong");
        flippedCards = [];
        canFlip = true;
      }, 400);
    }, 800);
  }
}

// Start new game
function newGame() {
  resetGame();
  initBoard();
}

// Initialize first game
newGame();
