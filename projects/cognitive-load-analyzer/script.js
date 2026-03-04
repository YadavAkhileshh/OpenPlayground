/* =========================================================
   Cognitive Load UI Analyzer
   ========================================================= */

const analyzeBtn = document.getElementById("analyzeBtn");
const resetBtn = document.getElementById("resetBtn");

const totalScoreEl = document.getElementById("totalScore");
const textScoreEl = document.getElementById("textScore");
const interactionScoreEl = document.getElementById("interactionScore");
const visualScoreEl = document.getElementById("visualScore");
const suggestionsEl = document.getElementById("suggestions");

/* ================= EVENT LISTENERS ================= */

analyzeBtn.addEventListener("click", analyzeUI);
resetBtn.addEventListener("click", resetResults);

/* ================= ANALYSIS ================= */

function analyzeUI() {
  const textScore = calculateTextDensity();
  const interactionScore = calculateInteractionLoad();
  const visualScore = calculateVisualComplexity();

  const total = textScore + interactionScore + visualScore;

  totalScoreEl.innerText = total;
  textScoreEl.innerText = textScore;
  interactionScoreEl.innerText = interactionScore;
  visualScoreEl.innerText = visualScore;

  generateSuggestions(textScore, interactionScore, visualScore);
}

/* ================= METRICS ================= */

function calculateTextDensity() {
  const textElements = document.querySelectorAll("p, h1, h2, h3, span");
  let charCount = 0;

  textElements.forEach(el => {
    charCount += el.innerText.length;
  });

  if (charCount > 800) return 40;
  if (charCount > 400) return 25;
  return 10;
}

function calculateInteractionLoad() {
  const interactiveElements = document.querySelectorAll(
    "button, a, input, select"
  );

  const count = interactiveElements.length;

  if (count > 15) return 35;
  if (count > 8) return 20;
  return 10;
}

function calculateVisualComplexity() {
  const allElements = document.querySelectorAll("*");
  const count = allElements.length;

  if (count > 120) return 30;
  if (count > 60) return 18;
  return 8;
}

/* ================= SUGGESTIONS ================= */

function generateSuggestions(text, interaction, visual) {
  suggestionsEl.innerHTML = "";

  if (text > 25) {
    addSuggestion(
      "Reduce text density by shortening paragraphs or using progressive disclosure."
    );
  }

  if (interaction > 20) {
    addSuggestion(
      "Reduce number of visible buttons or group actions into menus."
    );
  }

  if (visual > 18) {
    addSuggestion(
      "Simplify layout by removing unnecessary visual elements."
    );
  }

  if (
    suggestionsEl.children.length === 0
  ) {
    addSuggestion("UI cognitive load looks acceptable. Good job!");
  }
}

function addSuggestion(text) {
  const li = document.createElement("li");
  li.innerText = text;
  suggestionsEl.appendChild(li);
}

/* ================= RESET ================= */

function resetResults() {
  totalScoreEl.innerText = "-";
  textScoreEl.innerText = "-";
  interactionScoreEl.innerText = "-";
  visualScoreEl.innerText = "-";
  suggestionsEl.innerHTML = "";
}