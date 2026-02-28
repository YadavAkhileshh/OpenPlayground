const addBtn = document.getElementById("addBtn");
const questionInput = document.getElementById("question");
const answerInput = document.getElementById("answer");

const flashcard = document.getElementById("flashcard");
const frontText = document.getElementById("frontText");
const backText = document.getElementById("backText");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const flipBtn = document.getElementById("flipBtn");
const deleteBtn = document.getElementById("deleteBtn");
const progress = document.getElementById("progress");

let cards = JSON.parse(localStorage.getItem("flashcards")) || [];
let current = 0;

// Update UI
function updateCard() {
  if (cards.length === 0) {
    frontText.textContent = "No Cards Yet";
    backText.textContent = "Add a flashcard to start";
    progress.textContent = "0 / 0";
    return;
  }

  flashcard.classList.remove("flip");
  frontText.textContent = cards[current].question;
  backText.textContent = cards[current].answer;
  progress.textContent = `${current + 1} / ${cards.length}`;
}

// Save
function saveCards() {
  localStorage.setItem("flashcards", JSON.stringify(cards));
}

// Add card
addBtn.addEventListener("click", () => {
  const q = questionInput.value.trim();
  const a = answerInput.value.trim();

  if (!q || !a) return alert("Enter question and answer");

  cards.push({ question: q, answer: a });
  current = cards.length - 1;

  saveCards();
  updateCard();

  questionInput.value = "";
  answerInput.value = "";
});

// Flip card
flipBtn.addEventListener("click", () => {
  flashcard.classList.toggle("flip");
});

// Next card
nextBtn.addEventListener("click", () => {
  if (!cards.length) return;
  current = (current + 1) % cards.length;
  updateCard();
});

// Previous card
prevBtn.addEventListener("click", () => {
  if (!cards.length) return;
  current = (current - 1 + cards.length) % cards.length;
  updateCard();
});

// Delete card
deleteBtn.addEventListener("click", () => {
  if (!cards.length) return;
  cards.splice(current, 1);
  if (current >= cards.length) current = cards.length - 1;
  saveCards();
  updateCard();
});

// Initial load
updateCard();