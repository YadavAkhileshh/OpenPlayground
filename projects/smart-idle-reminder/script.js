const statusEl = document.getElementById("status");
const idleTimeEl = document.getElementById("idleTime");
const alertEl = document.getElementById("alert");

let idleSeconds = 0;
const IDLE_LIMIT = 10; // seconds before reminder

function resetIdle() {
  idleSeconds = 0;
  statusEl.textContent = "Active";
  alertEl.classList.add("hidden");
}

// Detect activity
["mousemove", "keydown", "click", "scroll"].forEach(event => {
  document.addEventListener(event, resetIdle);
});

// Count idle time
setInterval(() => {
  idleSeconds++;
  idleTimeEl.textContent = idleSeconds + "s";

  if (idleSeconds >= IDLE_LIMIT) {
    statusEl.textContent = "Idle";
    alertEl.classList.remove("hidden");
  }
}, 1000);
