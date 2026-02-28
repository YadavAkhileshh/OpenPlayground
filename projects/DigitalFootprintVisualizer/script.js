// === Element References ===
const browsingInput = document.getElementById("browsing");
const streamingInput = document.getElementById("streaming");
const messagingInput = document.getElementById("messaging");
const postsInput = document.getElementById("posts");
const gamingInput = document.getElementById("gaming");

const calcBtn = document.getElementById("calculateBtn");
const scoreEl = document.getElementById("score");
const barFill = document.getElementById("bar-fill");
const impactText = document.getElementById("impact-text");

// === Main Calculation Logic ===
function calculateFootprint() {
  const browsing = Number(browsingInput.value || 0) * 5;
  const streaming = Number(streamingInput.value || 0) * 15;
  const messaging = Number(messagingInput.value || 0) * 0.2;
  const posts = Number(postsInput.value || 0) * 10;
  const gaming = Number(gamingInput.value || 0) * 8;

  let score = Math.round(browsing + streaming + messaging + posts + gaming);

  // Cap at 300 max
  score = Math.min(score, 300);

  // Update Score UI
  scoreEl.textContent = score;

  // Progress Bar Animation
  const percentage = (score / 300) * 100;
  barFill.style.width = percentage + "%";

  // Impact Messaging Logic
  if (score < 80) {
    barFill.style.background = "#22c55e"; // green
    impactText.textContent = "Low Digital Footprint 🌱 (Healthy usage)";
  } else if (score < 180) {
    barFill.style.background = "#eab308"; // yellow
    impactText.textContent = "Moderate Footprint 🌐 (Balanced usage)";
  } else {
    barFill.style.background = "#ef4444"; // red
    impactText.textContent = "High Footprint 🔥 (Reduce usage & data exposure)";
  }
}

// === Button Listener ===
calcBtn.addEventListener("click", calculateFootprint);
