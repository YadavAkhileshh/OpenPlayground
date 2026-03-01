let data = JSON.parse(localStorage.getItem("mv_data") || '{"decks":[],"streak":0,"lastDate":""}');

const EMOJIS = ["📚","🔬","🧮","🌍","💻","🎨","🏛","🧬","📖","🎵","⚡","🔭"];

function save() {
  localStorage.setItem("mv_data", JSON.stringify(data));
}

function showView(id) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function updateGlobalStats() {
  const total = data.decks.reduce((s, d) => s + d.cards.length, 0);
  const mastered = data.decks.reduce((s, d) => s + d.cards.filter(c => c.mastered).length, 0);
  document.getElementById("totalCards").textContent = total;
  document.getElementById("masteredCards").textContent = mastered;
  document.getElementById("streakCount").textContent = data.streak;
}

function openModal(title, bodyHTML, confirmText, onConfirm) {
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalBody").innerHTML = bodyHTML;
  document.getElementById("modalConfirm").textContent = confirmText;
  document.getElementById("modalOverlay").classList.remove("hidden");

  document.querySelectorAll(".emoji-opt").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".emoji-opt").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });

  document.getElementById("modalConfirm").onclick = () => {
    onConfirm();
    closeModal();
  };
}

function closeModal() {
  document.getElementById("modalOverlay").classList.add("hidden");
}

document.getElementById("modalCancel").addEventListener("click", closeModal);
document.getElementById("modalOverlay").addEventListener("click", e => {
  if (e.target === document.getElementById("modalOverlay")) closeModal();
});

function renderHome() {
  const grid = document.getElementById("decksGrid");
  const empty = document.getElementById("emptyState");

  const existing = grid.querySelectorAll(".deck-card");
  existing.forEach(e => e.remove());

  if (data.decks.length === 0) {
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  data.decks.forEach((deck, i) => {
    const mastered = deck.cards.filter(c => c.mastered).length;
    const card = document.createElement("div");
    card.className = "deck-card";
    card.innerHTML = `
      <div class="deck-emoji">${deck.emoji}</div>
      <div class="deck-name">${deck.name}</div>
      <div class="deck-meta">${deck.cards.length} cards</div>
      ${mastered > 0 ? `<div class="deck-mastered">${mastered} mastered</div>` : ""}
    `;
    card.addEventListener("click", () => openDeck(i));
    grid.appendChild(card);
  });

  updateGlobalStats();
}

document.getElementById("createDeckBtn").addEventListener("click", () => {
  const emojiButtons = EMOJIS.map((e, i) =>
    `<button class="emoji-opt ${i === 0 ? "selected" : ""}" data-emoji="${e}">${e}</button>`
  ).join("");

  openModal("New Deck",
    `<label>DECK NAME</label>
     <input id="deckNameInput" placeholder="e.g. Biology Chapter 3" maxlength="40"/>
     <label>PICK AN ICON</label>
     <div class="emoji-grid">${emojiButtons}</div>`,
    "Create Deck",
    () => {
      const name = document.getElementById("deckNameInput").value.trim();
      if (!name) return;
      const selected = document.querySelector(".emoji-opt.selected");
      const emoji = selected ? selected.dataset.emoji : "📚";
      data.decks.push({ name, emoji, cards: [] });
      save();
      renderHome();
    }
  );
});

let activeDeckIndex = -1;

function openDeck(index) {
  activeDeckIndex = index;
  const deck = data.decks[index];
  document.getElementById("deckTitle").textContent = `${deck.emoji} ${deck.name}`;
  renderCardsList();
  showView("deckView");
}

function renderCardsList() {
  const deck = data.decks[activeDeckIndex];
  const list = document.getElementById("cardsList");
  list.innerHTML = "";

  if (deck.cards.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">✏️</div><p>No cards yet.<br>Add your first card!</p></div>`;
    return;
  }

  deck.cards.forEach((card, i) => {
    const item = document.createElement("div");
    item.className = "card-item";
    item.innerHTML = `
      <div class="card-item-num">${i + 1}</div>
      <div class="card-item-content">
        <div class="card-item-q">${card.q}</div>
        <div class="card-item-a">${card.a}</div>
      </div>
      <span class="card-item-badge ${card.mastered ? "badge-mastered" : "badge-learning"}">${card.mastered ? "✓ Mastered" : "Learning"}</span>
      <button class="card-delete-btn" data-i="${i}">✕</button>
    `;
    item.querySelector(".card-delete-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      deck.cards.splice(i, 1);
      save();
      renderCardsList();
      updateGlobalStats();
    });
    list.appendChild(item);
  });
}

document.getElementById("addCardBtn").addEventListener("click", () => {
  openModal("Add Card",
    `<label>QUESTION</label>
     <input id="cardQ" placeholder="e.g. What is photosynthesis?" maxlength="120"/>
     <label>ANSWER</label>
     <textarea id="cardA" placeholder="e.g. Process by which plants make food using sunlight..." maxlength="300"></textarea>`,
    "Add Card",
    () => {
      const q = document.getElementById("cardQ").value.trim();
      const a = document.getElementById("cardA").value.trim();
      if (!q || !a) return;
      data.decks[activeDeckIndex].cards.push({ q, a, mastered: false });
      save();
      renderCardsList();
      updateGlobalStats();
    }
  );
});

document.getElementById("deleteDeckBtn").addEventListener("click", () => {
  if (confirm(`Delete "${data.decks[activeDeckIndex].name}"?`)) {
    data.decks.splice(activeDeckIndex, 1);
    save();
    renderHome();
    showView("homeView");
  }
});

document.getElementById("backFromDeck").addEventListener("click", () => {
  renderHome();
  showView("homeView");
});

document.getElementById("studyDeckBtn").addEventListener("click", () => {
  startStudy([activeDeckIndex]);
});

document.getElementById("studyAllBtn").addEventListener("click", () => {
  if (data.decks.length === 0) return;
  startStudy(data.decks.map((_, i) => i));
});

let studyQueue = [];
let studyIndex = 0;
let studyCorrect = 0;
let studyWrong = [];
let isFlipped = false;

function startStudy(deckIndices) {
  studyQueue = [];
  deckIndices.forEach(di => {
    data.decks[di].cards.forEach((card, ci) => {
      studyQueue.push({ deckIndex: di, cardIndex: ci, ...card });
    });
  });

  studyQueue = studyQueue.sort(() => Math.random() - 0.5);

  if (studyQueue.length === 0) {
    alert("No cards in this deck! Add some cards first.");
    return;
  }

  studyIndex = 0;
  studyCorrect = 0;
  studyWrong = [];

  document.getElementById("studyResult").classList.add("hidden");
  document.getElementById("studyActions").style.display = "none";
  document.getElementById("flashcard-wrap") && (document.querySelector(".flashcard-wrap").style.display = "flex");

  showView("studyView");
  showStudyCard();
}

function showStudyCard() {
  if (studyIndex >= studyQueue.length) {
    showStudyResult();
    return;
  }

  const card = studyQueue[studyIndex];
  document.getElementById("cardFront").textContent = card.q;
  document.getElementById("cardBack").textContent = card.a;

  const fc = document.getElementById("flashcard");
  fc.classList.remove("flipped");
  isFlipped = false;

  document.getElementById("studyActions").style.display = "none";
  document.querySelector(".flashcard-wrap").style.display = "flex";

  const pct = (studyIndex / studyQueue.length) * 100;
  document.getElementById("studyProgressFill").style.width = pct + "%";
  document.getElementById("studyProgressLabel").textContent = `${studyIndex} / ${studyQueue.length}`;
}

document.getElementById("flashcard").addEventListener("click", () => {
  if (isFlipped) return;
  document.getElementById("flashcard").classList.add("flipped");
  isFlipped = true;
  document.getElementById("studyActions").style.display = "flex";
});

document.getElementById("correctBtn").addEventListener("click", () => {
  const card = studyQueue[studyIndex];
  data.decks[card.deckIndex].cards[card.cardIndex].mastered = true;
  studyCorrect++;
  studyIndex++;
  save();
  showStudyCard();
});

document.getElementById("wrongBtn").addEventListener("click", () => {
  const card = studyQueue[studyIndex];
  data.decks[card.deckIndex].cards[card.cardIndex].mastered = false;
  studyWrong.push(card);
  studyIndex++;
  save();
  showStudyCard();
});

function showStudyResult() {
  document.querySelector(".flashcard-wrap").style.display = "none";
  document.getElementById("studyActions").style.display = "none";

  const total = studyQueue.length;
  const pct = Math.round((studyCorrect / total) * 100);

  let emoji = "😅", title = "Keep Practicing!", sub = "Review the cards you missed.";
  if (pct >= 90) { emoji = "🏆"; title = "Excellent!"; sub = "You've mastered this deck!"; }
  else if (pct >= 70) { emoji = "🎉"; title = "Great Job!"; sub = "Almost there, keep going!"; }
  else if (pct >= 50) { emoji = "💪"; title = "Good Effort!"; sub = "Practice makes perfect."; }

  document.getElementById("resultEmoji").textContent = emoji;
  document.getElementById("resultTitle").textContent = title;
  document.getElementById("resultSub").textContent = sub;
  document.getElementById("resultScore").textContent = `${studyCorrect} / ${total} correct (${pct}%)`;

  const retryBtn = document.getElementById("retryBtn");
  if (studyWrong.length > 0) {
    retryBtn.classList.remove("hidden");
    retryBtn.onclick = () => {
      studyQueue = [...studyWrong];
      studyIndex = 0;
      studyCorrect = 0;
      studyWrong = [];
      document.getElementById("studyResult").classList.add("hidden");
      document.querySelector(".flashcard-wrap").style.display = "flex";
      showStudyCard();
    };
  } else {
    retryBtn.classList.add("hidden");
  }

  const today = new Date().toDateString();
  if (data.lastDate !== today) {
    data.streak++;
    data.lastDate = today;
    save();
  }
  updateGlobalStats();

  document.getElementById("studyResult").classList.remove("hidden");
  document.getElementById("studyProgressFill").style.width = "100%";
  document.getElementById("studyProgressLabel").textContent = `${total} / ${total}`;
}

document.getElementById("doneBtn").addEventListener("click", () => {
  renderHome();
  showView("homeView");
});

document.getElementById("backFromStudy").addEventListener("click", () => {
  if (activeDeckIndex >= 0) {
    renderCardsList();
    showView("deckView");
  } else {
    renderHome();
    showView("homeView");
  }
});

renderHome();
updateGlobalStats();
