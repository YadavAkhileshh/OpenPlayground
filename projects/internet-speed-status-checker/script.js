const statusEl = document.getElementById("status");
const typeEl = document.getElementById("type");
const effectiveEl = document.getElementById("effective");
const speedEl = document.getElementById("speed");

function updateStatus() {
  if (navigator.onLine) {
    statusEl.textContent = "Online";
    statusEl.className = "online";
  } else {
    statusEl.textContent = "Offline";
    statusEl.className = "offline";
    typeEl.textContent = "--";
    effectiveEl.textContent = "--";
    speedEl.textContent = "--";
    return;
  }

  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  if (!connection) {
    typeEl.textContent = "Not supported";
    effectiveEl.textContent = "Not supported";
    speedEl.textContent = "Not supported";
    return;
  }

  // Connection type: wifi / cellular
  typeEl.textContent = connection.type || "Unknown";

  // Effective type: 4g / 3g / 2g
  effectiveEl.textContent = connection.effectiveType || "Unknown";

  // Estimated speed (not real)
  speedEl.textContent = connection.downlink
    ? `${connection.downlink} Mbps (estimated)`
    : "Unavailable";
}

// Initial load
updateStatus();

// Listen for changes
window.addEventListener("online", updateStatus);
window.addEventListener("offline", updateStatus);

if (navigator.connection) {
  navigator.connection.addEventListener("change", updateStatus);
}
