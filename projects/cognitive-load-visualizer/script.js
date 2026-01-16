const meterFill = document.getElementById("meterFill");
const loadValue = document.getElementById("loadValue");
const statusText = document.getElementById("status");
const app = document.getElementById("app");

const taskButtons = document.querySelectorAll("[data-load]");
const interruptBtn = document.getElementById("interrupt");
const resetBtn = document.getElementById("reset");

let cognitiveLoad = 0;
const OVERLOAD_THRESHOLD = 70;

// Update UI
function updateUI() {
  cognitiveLoad = Math.max(0, Math.min(100, cognitiveLoad));
  meterFill.style.width = `${cognitiveLoad}%`;
  loadValue.textContent = `Load: ${Math.round(cognitiveLoad)}%`;

  if (cognitiveLoad < OVERLOAD_THRESHOLD) {
    meterFill.style.background = "#22c55e";
    statusText.textContent = "System stable";
    app.classList.remove("overloaded");
  } else {
    meterFill.style.background = "#ef4444";
    statusText.textContent = "⚠ Cognitive overload detected";
    app.classList.add("overloaded");
  }
}

// Add task load
taskButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    cognitiveLoad += Number(btn.dataset.load);
    updateUI();
  });
});

// Interrupt task (higher penalty)
interruptBtn.addEventListener("click", () => {
  cognitiveLoad += 25;
  statusText.textContent = "⚡ Interrupted! Load spiked";
  updateUI();
});

// Reset simulation
resetBtn.addEventListener("click", () => {
  cognitiveLoad = 0;
  app.classList.remove("overloaded");
  updateUI();
});

// Time-based recovery
setInterval(() => {
  if (cognitiveLoad > 0) {
    cognitiveLoad -= cognitiveLoad > OVERLOAD_THRESHOLD ? 0.5 : 1;
    updateUI();
  }
}, 1000);

// Initial render
updateUI();
