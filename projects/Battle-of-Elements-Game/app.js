// ========================================
// SVG ICONS
// ========================================
const ICONS = {
  fire: `<svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M12 2c0 4-3 6-3 10a5 5 0 0 0 10 0c0-4-3-6-3-10" stroke="#fff" fill="rgba(255,107,107,0.3)"/>
        <path d="M12 12c0 2-1 3-1 4a2 2 0 0 0 4 0c0-1-1-2-1-4" stroke="#fff" fill="rgba(255,200,100,0.5)"/>
      </svg>`,
  water: `<svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M12 2c-4 6-7 9-7 13a7 7 0 0 0 14 0c0-4-3-7-7-13z" stroke="#fff" fill="rgba(0,180,216,0.3)"/>
        <ellipse cx="12" cy="16" rx="3" ry="2" fill="rgba(255,255,255,0.2)"/>
      </svg>`,
  air: `<svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M4 8h10a3 3 0 1 0-3-3" stroke="#16213e"/>
        <path d="M4 12h14a4 4 0 1 1-4 4" stroke="#16213e"/>
        <path d="M4 16h6a2 2 0 1 0-2-2" stroke="#16213e"/>
      </svg>`,
  chaos: `<svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3" stroke="#fff" fill="rgba(224,64,251,0.4)"/>
        <path d="M12 1v4m0 14v4M1 12h4m14 0h4" stroke="#fff"/>
        <path d="M4.22 4.22l2.83 2.83m9.9 9.9l2.83 2.83M4.22 19.78l2.83-2.83m9.9-9.9l2.83-2.83" stroke="#e040fb"/>
        <circle cx="12" cy="12" r="8" stroke="rgba(255,0,255,0.4)" stroke-dasharray="4 2"/>
      </svg>`
};

// Small icons for history/opponent deck
const SMALL_ICONS = {
  fire: `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5">
        <path d="M12 2c0 4-3 6-3 10a5 5 0 0 0 10 0c0-4-3-6-3-10" fill="rgba(255,107,107,0.3)"/>
      </svg>`,
  water: `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5">
        <path d="M12 2c-4 6-7 9-7 13a7 7 0 0 0 14 0c0-4-3-7-7-13z" fill="rgba(0,180,216,0.3)"/>
      </svg>`,
  air: `<svg viewBox="0 0 24 24" fill="none" stroke="#16213e" stroke-width="2.5">
        <path d="M4 8h10a3 3 0 1 0-3-3"/>
        <path d="M4 12h14a4 4 0 1 1-4 4"/>
      </svg>`,
  chaos: `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
        <circle cx="12" cy="12" r="3" fill="rgba(224,64,251,0.4)"/>
        <path d="M12 1v4m0 14v4M1 12h4m14 0h4"/>
      </svg>`
};

// ========================================
// GAME STATE
// ========================================
let state = {
  phase: "event",
  round: 1,
  deck: { fire: 2, water: 2, air: 2, chaos: 1 },
  opponentDeck: { fire: 2, water: 2, air: 2, chaos: 1 },
  playerSelection: [],
  opponentSelection: [],
  roundHistory: [],
  playerWins: 0,
  opponentWins: 0,
  cups: parseInt(localStorage.getItem("cups") || "0")
};

let timerInterval = null;

// ========================================
// DOM ELEMENTS
// ========================================
const elements = {
  eventPage: document.getElementById("eventPage"),
  matchmaking: document.getElementById("matchmaking"),
  battleArena: document.getElementById("battleArena"),
  finalResult: document.getElementById("finalResult"),
  totalCups: document.getElementById("totalCups"),
  matchTimer: document.getElementById("matchTimer"),
  roundNumber: document.getElementById("roundNumber"),
  playerWins: document.getElementById("playerWins"),
  opponentWins: document.getElementById("opponentWins"),
  slotsContainer: document.getElementById("slotsContainer"),
  instructionText: document.getElementById("instructionText"),
  timerDisplay: document.getElementById("timerDisplay"),
  roundResultText: document.getElementById("roundResultText"),
  deckCards: document.getElementById("deckCards"),
  opponentDeckDisplay: document.getElementById("opponentDeckDisplay"),
  finalTitle: document.getElementById("finalTitle"),
  rewardValue: document.getElementById("rewardValue"),
  continueTimer: document.getElementById("continueTimer")
};

// ========================================
// COMBAT LOGIC
// ========================================
function getWinner(player, opponent) {
  if (player === opponent) return "tie";
  if (player === "chaos") return "win";
  if (opponent === "chaos") return "lose";
  if (player === "fire" && opponent === "air") return "win";
  if (player === "air" && opponent === "water") return "win";
  if (player === "water" && opponent === "fire") return "win";
  return "lose";
}

// ========================================
// UTILITY FUNCTIONS
// ========================================
function clearTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function getRequiredCards() {
  return 4 - state.round; // Round 1: 3, Round 2: 2, Round 3: 1
}

// ========================================
// PHASE MANAGEMENT
// ========================================
function showPhase(phase) {
  elements.eventPage.classList.add("hidden");
  elements.matchmaking.classList.add("hidden");
  elements.battleArena.classList.add("hidden");
  elements.finalResult.classList.add("hidden");

  switch (phase) {
    case "event":
      elements.eventPage.classList.remove("hidden");
      break;
    case "matchmaking":
      elements.matchmaking.classList.remove("hidden");
      break;
    case "battle":
      elements.battleArena.classList.remove("hidden");
      break;
    case "final":
      elements.finalResult.classList.remove("hidden");
      break;
  }
}

// ========================================
// INITIALIZATION
// ========================================
function init() {
  elements.totalCups.textContent = state.cups;
  showPhase("event");
}

// ========================================
// MATCHMAKING
// ========================================
function startMatchmaking() {
  clearTimer();
  state.phase = "matchmaking";
  showPhase("matchmaking");

  let countdown = 3;
  elements.matchTimer.textContent = countdown;

  timerInterval = setInterval(() => {
    countdown--;
    elements.matchTimer.textContent = countdown;
    if (countdown <= 0) {
      clearTimer();
      startBattle();
    }
  }, 1000);
}

// ========================================
// BATTLE START
// ========================================
function startBattle() {
  // Reset battle state
  state = {
    ...state,
    phase: "selecting",
    round: 1,
    deck: { fire: 2, water: 2, air: 2, chaos: 1 },
    opponentDeck: { fire: 2, water: 2, air: 2, chaos: 1 },
    playerSelection: [],
    opponentSelection: [],
    roundHistory: [],
    playerWins: 0,
    opponentWins: 0
  };

  showPhase("battle");
  startRound();
}

// ========================================
// ROUND MANAGEMENT
// ========================================
function startRound() {
  state.phase = "selecting";
  state.playerSelection = [];
  state.opponentSelection = [];

  elements.roundNumber.textContent = state.round;
  elements.playerWins.textContent = state.playerWins;
  elements.opponentWins.textContent = state.opponentWins;

  renderOpponentDeck();
  renderSlots();
  renderDeck();

  const required = getRequiredCards();
  elements.instructionText.textContent = `Select ${required} card${
    required > 1 ? "s" : ""
  }`;
  elements.instructionText.classList.remove("hidden");
  elements.timerDisplay.classList.add("hidden");
  elements.roundResultText.classList.add("hidden");
}

// ========================================
// OPPONENT DECK DISPLAY
// ========================================
function renderOpponentDeck() {
  const elementOrder = ["fire", "water", "air", "chaos"];
  let html = "";

  elementOrder.forEach((element) => {
    const count = state.opponentDeck[element];
    const depleted = count <= 0;
    html += `
          <div class="opp-deck-card ${element} ${depleted ? "depleted" : ""}">
            ${SMALL_ICONS[element]}
            <span class="opp-count">${count}</span>
          </div>
        `;
  });

  elements.opponentDeckDisplay.innerHTML = html;
}

// ========================================
// MYSTERY CARD RENDER
// ========================================
function renderMysteryCard() {
  return `
        <div class="mystery-card">
          <div class="mystery-content">
            <div class="mystery-icon">
              <div class="mystery-silhouette">
                <span class="mystery-question">?</span>
              </div>
            </div>
            <span class="mystery-text">Hidden</span>
          </div>
        </div>
      `;
}

// ========================================
// HISTORY CARD RENDER
// ========================================
function renderHistoryCard(element) {
  return `
        <div class="history-card ${element}">
          ${SMALL_ICONS[element]}
        </div>
      `;
}

// ========================================
// ROUND HISTORY RENDER
// ========================================
function renderRoundHistory() {
  if (state.roundHistory.length === 0) return "";

  let html =
    '<div class="rounds-history"><div class="history-label">Previous Rounds</div><div class="history-rounds">';

  state.roundHistory.forEach((round, roundIndex) => {
    html += `<div class="history-round">`;
    html += `<div class="history-round-label">Round ${roundIndex + 1}</div>`;
    html += `<div class="history-pairs">`;

    for (let i = 0; i < round.playerCards.length; i++) {
      const result = round.results[i];
      html += `
            <div class="history-pair">
              ${renderHistoryCard(round.playerCards[i])}
              <span class="history-vs">VS</span>
              ${renderHistoryCard(round.opponentCards[i])}
              <div class="history-result ${result}"></div>
            </div>
          `;
    }

    html += `</div></div>`;
  });

  html += "</div></div>";
  return html;
}

// ========================================
// SLOTS RENDER
// ========================================
function renderSlots() {
  const required = getRequiredCards();
  const isResults = state.phase === "results";

  let html = "";

  // Add history
  html += renderRoundHistory();

  // Current round
  html += `<div class="current-round-label">Round ${state.round} - Battle Cards</div>`;
  html += '<div class="current-round-slots">';

  for (let i = 0; i < required; i++) {
    const playerCard = state.playerSelection[i];
    const opponentCard = isResults ? state.opponentSelection[i] : null;

    let result = "";
    if (isResults && playerCard && opponentCard) {
      result = getWinner(playerCard, opponentCard);
    }

    html += `
          <div class="slot-pair">
            <div class="card-slot ${playerCard ? "filled" : ""}">
              ${playerCard ? renderSlotCard(playerCard, false) : ""}
              ${
                result
                  ? `<div class="result-indicator ${result}">${result.toUpperCase()}</div>`
                  : ""
              }
            </div>
            <div class="vs-divider">VS</div>
            <div class="card-slot opponent ${opponentCard ? "filled" : ""}">
              ${
                opponentCard
                  ? renderSlotCard(opponentCard, true)
                  : renderMysteryCard()
              }
            </div>
          </div>
        `;
  }

  html += "</div>";
  elements.slotsContainer.innerHTML = html;
}

// ========================================
// SLOT CARD RENDER
// ========================================
function renderSlotCard(element, isReveal = false) {
  let classes = `slot-card card ${element} in-slot`;
  if (isReveal) {
    classes += " card-reveal card-reveal-glow";
  }

  return `
        <div class="${classes}">
          ${ICONS[element]}
          <span class="card-name">${element}</span>
        </div>
      `;
}

// ========================================
// DECK CARD RENDER
// ========================================
function renderCard(element) {
  const count = state.deck[element];
  const isDisabled = count <= 0 || state.phase !== "selecting";

  let classes = `card ${element}`;
  if (isDisabled) classes += " disabled";

  const clickHandler = !isDisabled ? `onclick="selectCard('${element}')"` : "";

  return `
        <div class="${classes}" ${clickHandler}>
          ${ICONS[element]}
          <span class="card-name">${element}</span>
          <span class="card-count">${count}</span>
        </div>
      `;
}

// ========================================
// DECK RENDER
// ========================================
function renderDeck() {
  const elementOrder = ["fire", "water", "air", "chaos"];
  elements.deckCards.innerHTML = elementOrder
    .map((el) => renderCard(el))
    .join("");
}

// ========================================
// CARD SELECTION
// ========================================
function selectCard(element) {
  if (state.phase !== "selecting") return;
  if (state.deck[element] <= 0) return;
  if (state.playerSelection.length >= getRequiredCards()) return;

  // Consume card
  state.deck[element]--;
  state.playerSelection.push(element);

  // Re-render
  renderSlots();
  renderDeck();

  // Check if selection complete
  const remaining = getRequiredCards() - state.playerSelection.length;
  if (remaining > 0) {
    elements.instructionText.textContent = `Select ${remaining} more card${
      remaining > 1 ? "s" : ""
    }`;
  } else {
    lockSelection();
  }
}

// ========================================
// LOCK SELECTION
// ========================================
function lockSelection() {
  clearTimer();
  state.phase = "locked";

  // Generate opponent cards
  generateOpponentSelection();

  renderDeck();
  renderOpponentDeck();

  elements.instructionText.textContent = "Waiting for opponent...";
  elements.timerDisplay.classList.remove("hidden");

  let countdown = 2;
  elements.timerDisplay.textContent = countdown;

  timerInterval = setInterval(() => {
    countdown--;
    elements.timerDisplay.textContent = countdown;
    if (countdown <= 0) {
      clearTimer();
      showResults();
    }
  }, 1000);
}

// ========================================
// OPPONENT AI
// ========================================
function generateOpponentSelection() {
  const required = getRequiredCards();
  const available = [];

  // Build available pool from opponent's remaining deck
  for (const [element, count] of Object.entries(state.opponentDeck)) {
    for (let i = 0; i < count; i++) {
      available.push(element);
    }
  }

  // Shuffle using Fisher-Yates
  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }

  // Select required cards
  state.opponentSelection = available.slice(
    0,
    Math.min(required, available.length)
  );

  // Consume from opponent deck
  state.opponentSelection.forEach((element) => {
    state.opponentDeck[element]--;
  });
}

// ========================================
// SHOW RESULTS
// ========================================
function showResults() {
  clearTimer();
  state.phase = "results";

  elements.instructionText.classList.add("hidden");
  elements.timerDisplay.classList.add("hidden");

  // Render with revealed opponent cards
  renderSlots();
  renderOpponentDeck();

  // Calculate round winner
  let playerPoints = 0;
  let opponentPoints = 0;
  const roundCardResults = [];

  for (let i = 0; i < state.playerSelection.length; i++) {
    const pCard = state.playerSelection[i];
    const oCard = state.opponentSelection[i];

    if (pCard && oCard) {
      const result = getWinner(pCard, oCard);
      roundCardResults.push(result);
      if (result === "win") playerPoints++;
      else if (result === "lose") opponentPoints++;
    }
  }

  // Save to history
  state.roundHistory.push({
    playerCards: [...state.playerSelection],
    opponentCards: [...state.opponentSelection],
    results: roundCardResults
  });

  // Determine round winner
  let roundResult, resultClass;
  if (playerPoints > opponentPoints) {
    state.playerWins++;
    roundResult = "You won this round!";
    resultClass = "win";
  } else if (opponentPoints > playerPoints) {
    state.opponentWins++;
    roundResult = "Opponent won this round!";
    resultClass = "lose";
  } else {
    roundResult = "This round is a tie!";
    resultClass = "tie";
  }

  elements.playerWins.textContent = state.playerWins;
  elements.opponentWins.textContent = state.opponentWins;

  elements.roundResultText.textContent = roundResult;
  elements.roundResultText.className = `round-result-text ${resultClass}`;
  elements.roundResultText.classList.remove("hidden");

  // Auto-advance after delay
  setTimeout(() => {
    // Check for battle end
    if (state.playerWins >= 2 || state.opponentWins >= 2 || state.round >= 3) {
      showFinalResult();
    } else {
      state.round++;
      startRound();
    }
  }, 3000);
}

// ========================================
// FINAL RESULT
// ========================================
function showFinalResult() {
  clearTimer();
  state.phase = "final";
  showPhase("final");

  let title, titleClass, reward;

  if (state.playerWins > state.opponentWins) {
    title = "Victory!";
    titleClass = "win";
    reward = 5;
  } else if (state.opponentWins > state.playerWins) {
    title = "Defeat";
    titleClass = "lose";
    reward = 2;
  } else {
    title = "Draw";
    titleClass = "tie";
    reward = 3;
  }

  state.cups += reward;
  localStorage.setItem("cups", state.cups.toString());

  elements.finalTitle.textContent = title;
  elements.finalTitle.className = `final-title ${titleClass}`;
  elements.rewardValue.textContent = reward;
  elements.totalCups.textContent = state.cups;

  let countdown = 5;
  elements.continueTimer.textContent = countdown;

  timerInterval = setInterval(() => {
    countdown--;
    elements.continueTimer.textContent = countdown;
    if (countdown <= 0) {
      clearTimer();
      returnToEvent();
    }
  }, 1000);
}

// ========================================
// RETURN TO EVENT
// ========================================
function returnToEvent() {
  clearTimer();
  state.phase = "event";
  showPhase("event");
}

// ========================================
// START GAME
// ========================================
init();
