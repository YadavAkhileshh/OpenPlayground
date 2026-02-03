let selectedMood = null;
let typingStartTime = null;
let totalCharsTyped = 0;

const moodButtons = document.querySelectorAll(".options button");
const typingArea = document.getElementById("typingArea");
const analyzeBtn = document.getElementById("analyzeBtn");

const resultBox = document.getElementById("result");
const finalMoodText = document.getElementById("finalMood");
const focusLevelText = document.getElementById("focusLevel");
const tipsList = document.getElementById("tipsList");

moodButtons.forEach(button => {
  button.addEventListener("click", () => {
    moodButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    selectedMood = button.dataset.mood;
  });
});

typingArea.addEventListener("focus", () => {
  if (!typingStartTime) {
    typingStartTime = Date.now();
  }
});

typingArea.addEventListener("input", () => {
  totalCharsTyped = typingArea.value.length;
});

analyzeBtn.addEventListener("click", () => {
  if (!selectedMood || totalCharsTyped === 0) {
    alert("Please select a mood and type something first!");
    return;
  }

  const timeSpent = (Date.now() - typingStartTime) / 1000;
  const typingSpeed = Math.round((totalCharsTyped / timeSpent) * 60);

  let focusLevel = "";
  if (typingSpeed > 250) focusLevel = "High Focus ⚡";
  else if (typingSpeed > 120) focusLevel = "Medium Focus 🙂";
  else focusLevel = "Low Focus 🐢";

  displayResults(selectedMood, focusLevel);
});

function displayResults(mood, focus) {
  resultBox.classList.remove("hidden");
  finalMoodText.textContent = `Detected Mood: ${capitalize(mood)}`;
  focusLevelText.textContent = `Focus Level: ${focus}`;

  tipsList.innerHTML = "";
  getSuggestions(mood, focus).forEach(tip => {
    const li = document.createElement("li");
    li.textContent = tip;
    tipsList.appendChild(li);
  });
}

function getSuggestions(mood, focus) {
  const tips = [];

  if (mood === "stressed") {
    tips.push("Take a 5-minute breathing break");
    tips.push("Try the Pomodoro technique");
  }

  if (mood === "tired") {
    tips.push("Drink water and stretch");
    tips.push("Switch to lighter tasks");
  }

  if (mood === "happy" || mood === "excited") {
    tips.push("Work on challenging tasks");
    tips.push("Contribute to open source");
  }

  if (focus.includes("Low")) {
    tips.push("Disable notifications");
    tips.push("Clean your workspace");
  }

  tips.push("Listen to instrumental coding music");
  tips.push("Review your goals for today");

  return tips;
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}