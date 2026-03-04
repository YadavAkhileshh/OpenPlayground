const statusEl = document.getElementById("status");
const activeEl = document.getElementById("active");
const inactiveEl = document.getElementById("inactive");

let activeTime = 0;
let inactiveTime = 0;
let isActive = true;

// Update every second
setInterval(() => {
  if (isActive) {
    activeTime++;
    activeEl.textContent = formatTime(activeTime);
  } else {
    inactiveTime++;
    inactiveEl.textContent = formatTime(inactiveTime);
  }
}, 1000);

// Detect tab visibility changes
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    isActive = false;
    statusEl.textContent = "Inactive";
  } else {
    isActive = true;
    statusEl.textContent = "Active";
  }
});

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}
